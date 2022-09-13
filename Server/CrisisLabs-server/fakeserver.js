const express = require('express');
const cors = require('cors');
const udp = require("dgram");

var data = [];
var time = 0;
var risk = 0;

function Random(min, max, digits) {
	var output = (Math.random() * (max-min) + min).toFixed(digits);
	return output;
}

function GenerateOutput(min, max, digits, stations, interval) {
	if (data.length > 100000) 
	{
		data.splice(0, 1);
	}
	
	time += interval;
	for (var i = 0; i < stations.length; i++)
	{
		data.push("~" + stations[i] + "," + time + "," + Random(min, max, digits) + "|" + data.length + "|");
	}
}

const MIN = -0.2;
const MAX = 0.2;
const DIGITS = 10;
const STATIONS = [
	"'EHZ'0",
	"'ENN'0",
	"'ENE'0",
	"'ENZ'0",
	"'EHZ'1",
	"'ENN'1",
	"'ENE'1",
	"'ENZ'1",
];
const INTERVAL = 0.25;
setInterval(function(){
	GenerateOutput(MIN, MAX, DIGITS, STATIONS, INTERVAL);
}, INTERVAL * 1000);

const serverData = express();
serverData.use(cors());

serverData.get('/data', (req,res)=>{
	var nData = data.slice();
	nData.splice(0, parseInt(req.header("id")));

	var response = "";
	for (var i = 0; i < nData.length; i++)
	{
		response += nData[i];
	}

	res.send(response);
});
serverData.get('/risk', (req,res)=>{
	var response = risk.toString();
	res.send(response);
});

serverData.listen(4000, ()=>{
	console.log("Server listening for data requests on port 4000");
});