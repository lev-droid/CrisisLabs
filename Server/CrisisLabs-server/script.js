const express = require('express');
const cors = require('cors');
const udp = require("dgram");


// without the need for a registration system, or even as much as a username, elaborate cryptographic systems prove rather unneccessary. a simple password stored on the server should suffice (encrypting the password would functionally be the same as just using a longer password, cryptographically speaking.).
const PASSWORD = "myshake"; // NOTE: Move this to a .env file (or whatever they're called)
const TOKENEXPIRE = 10000; // how many milliseconds the token is valid for
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

var detrendTime = 0;

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

function GetAverage(array)
{
	var avg = 0;
	for (var i = 0; i < array.length; i++)
	{
		avg += array[i];
	}
	return (avg / array.length);
}

function ConvertData(input, shake)
{
	// NOTE: REMEMBER TO PUT A SANITY CHECK BEFORE PARSING DATA INTO THIS FUNCTION

	// I know I said I was going to un-spaghetti Brendan's code, but at least to some extent, it was programmed the way it was due to the formatting of the input data. Though this is better, it's still not really all that great.
	var output = "";
	var inputArr = input.replace('}', '').replace('{', '').split(',');

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
	if (detrendTime == 0)
	{
		detrendTime = time;
	}
	time -= detrendTime;

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
			if (shake == 1)
			{
				console.log(cData[i] + " vs " + THRESHOLD[station] + "\n-----------\n");
			}
			//console.log(activatedShakes);
			if (!activatedShakes.includes(shake))
			{
				activatedShakes.push(shake);
				if (activatedShakes.length == shakes.length) // Case that all shakes have gone over THRESHOLD
				{
					risk = 2
				} else if (activatedShakes.length == 1) // Case that this is the first shake to go over THRESHOLD
				{
					risk = 1
				}
			}
			//console.log(risk);
		} else {
			// exceptional data points wont be counted toward detrending
			detrendTable[station2].splice(0, 0, cData[i]);
			if (detrendTable[station2].length > DETRENDLIMIT)
			{
				detrendTable[station2].splice(-1, 1); // cant merge the splice lines because old data needs to be removed before new data is
			}
		}
	}
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
	};


	RecieveData(msg, info)
	{
		if (data.length > 100000)
		{
			data = [];
		}

		if (msg != null)
		{
			console.log(msg.toString());
			data.push(ConvertData(msg.toString(), this.id) + "|" + data.length + "|");
		}
	};
};
var shakes = [new Shake(0, 8888), new Shake(1, 8889)];
var sockets = [];
for (var i = 0; i < shakes.length; i++)
{
	var cSocket = udp.createSocket('udp4');

	var cShake = shakes[i];

	(function(cShake){
		cSocket.on("message", function(msg, info) {
			cShake.RecieveData(msg, info);
		});
	})(cShake);

	cSocket.on("listening", function() {
		console.log("Server listening for shake output on port " + cShake.port);
	});
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
		var arr = [0];
		self.crypto.getRandomValues(arr); // idk how entropic this is, but it should be enough for our purposes
		tokens.push(arr);
		res.send(arr);
		console.log(tokens);
		
		(function(index) { // remove the token after a certain period of time
			setTimeout(function() {
				tokens.splice(index, 1);
				console.log(tokens);
			}, TOKENEXPIRE);
		})(tokens.length-1);
	}
});
server.get('/logout', (req,res)=>{
	
});
server.get('/edit', (req,res)=>{
	var token = req.header("token");
	if (tokens.indexOf(token) != -1) 
	{
		switch (req.header("target"))
		{
			case ("rounding"):
				var value = parseInt(req.header("value"));
				if (value != NaN)
				{
					rounding = value;
					res.send("0"); // indicate successful operation
					break;
				}
				res.send("1"); // indicate unsuccessful operation (invalid value)
				break;
			case ("conversion"):
				var value = req.header("value").split(',');
				if (value.length != 2)
				{
					res.send("1");
					break;
				}
				CONVERSION[value[0]] = value[1];
				break;
			default:
				console.log("Invalid request recieved from IP " + req.ip + " (Content: \"" + req.header("value") + "\")");
				res.send("2"); // indicate unsuccessful operation (invalid request)
				break;
		}
	}
});

server.listen(4000, ()=>{
	console.log("Server listening for data requests on port 4000");
});
/*
const serverRisk = express();
serverRisk.use(cors());

serverRisk.get('/risk', (req,res)=>{
	var response = risk;
	res.send(response);
});

serverRisk.listen(4000, ()=>{
	console.log("Server listening for threat requests on port 4001");
});*/
