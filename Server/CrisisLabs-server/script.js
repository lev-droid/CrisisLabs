const express = require('express');
const cors = require('cors');
const udp = require('dgram');
const crypto = require('crypto');


// without the need for a registration system, or even as much as a username, elaborate cryptographic systems prove rather unneccessary. a simple password stored on the server should suffice (encrypting the password would functionally be the same as just using a longer password, cryptographically speaking.).
const PASSWORD = "myshake"; // NOTE: Move this to a .env file (or whatever they're called)
const TOKENEXPIRE = 3600000; // how many milliseconds the token is valid for (currently 1h)
var tokens = [];
// data backlog, used because the site has to send a request to the server rather than listening to a live feed
var data = [];

var DETRENDLIMIT = 50; // How many data points to consider when detrending.
var detrendTable = [];
detrendTable["'EHZ'0"] = [];
detrendTable["'ENZ'0"] = [];
detrendTable["'ENN'0"] = [];
detrendTable["'ENE'0"] = [];
detrendTable["'EHZ'1"] = [];
detrendTable["'ENZ'1"] = [];
detrendTable["'ENN'1"] = [];
detrendTable["'ENE'1"] = [];

var detrendTime = [];

var ROUNDING = 10;

var CONVERSION = [];
CONVERSION["'EHZ'"] = 39965000;
CONVERSION["'ENZ'"] = 384500;
CONVERSION["'ENN'"] = 384500;
CONVERSION["'ENE'"] = 384500;

var THRESHOLD = [];
THRESHOLD["'EHZ'"] = 0.1;
THRESHOLD["'ENZ'"] = 10;
THRESHOLD["'ENN'"] = 10;
THRESHOLD["'ENE'"] = 10;

var risk = 0;
var activatedShakes = [];
var SHAKEWINDOW = 5; // how many seconds it will stay in alert mode for before reverting to default

function GetAverage(array)
{
	var avg = 0;
	for (var i = 0; i < array.length; i++)
	{
		avg += array[i];
	}
	return (avg / array.length);
}

function UpdateRisk(time)
{
	for (var i = 0; i < activatedShakes.length; i++) // after a certain period of low activity, deactivate a shake's alert. 
	{
		if (activatedShakes[i].activated + SHAKEWINDOW <= time)
		{
			//console.log(activatedShakes[i].activated + " vs " + time);
			activatedShakes.splice(i, 1);
			i--;
		}
	}
	
	//console.log(activatedShakes.length + "/" + shakes.length);
	
	if (activatedShakes.length == 0)
	{
		risk = 0;
	} else if (activatedShakes.length >= shakes.length)
	{
		risk = 2;
	} else 
	{
		risk = 1;
	}
}

function ConvertData(input, shakeObj)
{
	// I know I said I was going to un-spaghetti Brendan's code, but at least to some extent, it was programmed the way it was due to the formatting of the input data. Though this is better, it's still not really all that great.
	var output = "";
	var inputArr = input.replace('}', '').replace('{', '').split(',');
	
	// lazy, but it doesnt really matter much
	var shake = shakeObj.id;
	
	// The first index is a string (the seismograph this data came from), the second is a float, and the rest are all ints. We need to convert them all to their respective types.
	// I could do this more expandably, but it'd come at the cost of a heavy hit to efficiency, so I'll leave it for now.
	var station = inputArr[0];
	var station2 = station + shake;
	var time = parseFloat(inputArr[1]);
	var cData = [];
	for (var i = 2; i < inputArr.length; i++)
	{
		cData[i-2] = parseInt(inputArr[i]);
	}

	// Now that the data has been properly organized, we need to process it - detrend it, convert it to m/s, etc.

	// Check if a default time value has been set - if not, set one.
	if (detrendTime[shake] == null)
	{
		detrendTime[shake] = time;
	}
	time -= detrendTime[shake];

	// Calculate the average of recent data.
	var avg = 0;
	if (detrendTable.length < 1)
	{
		avg = cData[0];
	} else {
		avg = GetAverage(detrendTable[station2]);
	}

	// Subtract said average from the data that is currently being processed, update the arrays used for the previous step, and convert the data into a format which the website can read.
	for (var i = 0; i < cData.length; i++)
	{
		cData[i] = (cData[i] - avg) / CONVERSION[station];
		if ((cData[i] > THRESHOLD[station]) || (cData[i]) < THRESHOLD[station]*-1)
		{
			shakeObj.activated = time;
			if (!activatedShakes.includes(shakeObj))
			{
				activatedShakes.push(shakeObj);
			}
		} else {
			// exceptional data points wont be counted toward detrending
			detrendTable[station2].splice(0, 0, cData[i]);
			if (detrendTable[station2].length > DETRENDLIMIT)
			{
				detrendTable[station2].splice(-1, 1); // cant merge the splice lines because old data needs to be removed before new data is
			}
		}
	}
	
	UpdateRisk(time);
	output += "~" + station2 + "," + time + "," + (GetAverage(cData).toFixed(ROUNDING));
	//console.log(output + "\n-----------\n");
	//console.log(shake);
	return (output);
}

class Shake
{
	constructor(id, port)
	{
		this.id = id;
		this.port = port;
		this.activated = 0; // time that this shake last triggered an alert
	};


	RecieveData(msg, info)
	{
		if (data.length > 100000)
		{
			data = [];
		}

		if (msg != null)
		{
			//console.log(msg.toString());
			data.push(ConvertData(msg.toString(), this) + "|" + data.length + "|");
		}
	};
};
var shakes = [new Shake(0, 8888), new Shake(1, 8889)];
var sockets = [];
for (var i = 0; i < shakes.length; i++)
{
	var cSocket = udp.createSocket('udp4');

	var cShake = shakes[i];
	(function(cShake2){
		cSocket.on("message", function(msg, info) {
			cShake2.RecieveData(msg, info);
		});
		cSocket.on("listening", function() {
			console.log("Server listening for shake output on port " + cShake2.port);
		});
	})(cShake);
	
	cSocket.bind(cShake.port);
}


const server = express();
server.use(cors());

server.get('/data', (req,res)=>{
	var nData = data.slice();
	nData.splice(0, parseInt(req.header("id")));

	var response = "";
	for (var i = 0; i < nData.length; i++)
	{
		response += nData[i];
	}

	res.send(response);
});
server.get('/risk', (req,res)=>{
	var response = risk.toString();
	res.send(response);
});

server.get('/login', (req,res)=>{
	if (req.header("pw") == PASSWORD)
	{
		var token = crypto.randomBytes(256).toString('hex');
		
		tokens.push(token);
		res.send(token);
		//console.log(tokens);
		
		(function(token) { // remove the token after a certain period of time
			setTimeout(function() {
				var index = tokens.indexOf(token);
				if (!isNaN(index))
				{
					tokens.splice(index, 1);
					//console.log(tokens);
				}
			}, TOKENEXPIRE);
		})(token);
	} else {
		//console.log("Invalid password \"" + req.header("pw") + "\" recieved from IP " + req.ip);
		res.send("0");
	}
});
// commented out because its unused, not because it doesnt work or anything
/*
server.get('/logout', (req,res)=>{
	var token = req.header("token");
	var index = tokens.indexOf(token);
	if (!isNaN(index))
	{
		tokens.splice(index, 1);
		//console.log(tokens);
	}
	res.send();
});*/
server.get('/edit', (req,res)=>{
	// i'm pretty sure this isn't meant to be done through a request like this, but it (should) work, so ill stick with it (at least for now)
	var token = req.header("token");
	if (tokens.indexOf(token) != -1) 
	{
		switch (req.header("target"))
		{
			case ("rounding"):
				var value = parseInt(req.header("value"));
				if (!(isNaN(value)))
				{
					ROUNDING = value;
					res.send("0"); // indicate successful operation
					break;
				}
				res.send("1"); // indicate unsuccessful operation (invalid value)
				break;
				
			case ("conversion"):
				var value = req.header("value").replaceAll("/QUOTE/", "'").split(',');
				if (value.length != 2)
				{
					res.send("1");
					break;
				}
				value[1] = parseInt(value[1]);
				if (isNaN(value[1]))
				{
					res.send("1");
					break;
				}
				CONVERSION[value[0]] = value[1];
				res.send("0");
				break;
				
			case ("threshold"):
				var value = req.header("value").replaceAll("/QUOTE/", "'").split(',');
				if (value.length != 2)
				{
					res.send("1");
					break;
				}
				value[1] = parseFloat(value[1]);
				if (isNaN(value[1]))
				{
					res.send("1");
					break;
				}
				THRESHOLD[value[0]] = value[1];
				res.send("0");
				break;
				
			case ("detrendlimit"):
				var value = parseInt(req.header("value"));
				if (!(isNaN(value)))
				{
					DETRENDLIMIT = value;
					res.send("0");
					break;
				}
				res.send("1");
				break;
				
			case ("shakewindow"):
				var value = parseFloat(req.header("value"));
				if (!(isNaN(value)))
				{
					SHAKEWINDOW = value;
					res.send("0");
					break;
				}
				res.send("1");
				break;
				
			default:
				console.log("Invalid request recieved from IP " + req.ip + " (Content: \"" + req.header("value") + "\")");
				res.send("2"); // indicate unsuccessful operation (invalid request)
				break;
		}
	} else {
		res.send("3"); // indicate unsuccessful operation (invalid token)
	}
});

server.listen(4000, ()=>{
	console.log("Server listening for data requests on port 4000");
});