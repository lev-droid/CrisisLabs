const express = require('express');
const cors = require('cors');
const udp = require("dgram");

var client = udp.createSocket('udp4');
var time = 0;

function Random(min, max, digits) {
	var output = (Math.random() * (max-min) + min).toFixed(digits);
	return output;
}

function GenerateOutput(min, max, digits, stations, interval, ports, ip, x) {
	time += interval;
	for (var i = 0; i < ports.length; i++)
	{
		for (var j = 0; j < stations.length; j++)
		{
			var output = ("{" + stations[j] + ", " + time);
			for (var k = 0; k < x; k++)
			{
				output += ", " + Random(min, max, digits);
			}
			output += "}";
			client.send(output, ports[i], ip);
		}
	}
}

const MIN = 1000;
const MAX = 40000;
const DIGITS = 5;
const STATIONS = [
	"'EHZ'",
	"'ENN'",
	"'ENE'",
	"'ENZ'"
];
const INTERVAL = 0.25;
const PORTS = [
	8888
];
const IP = "localhost";
const X = 20;
setInterval(function(){
	GenerateOutput(MIN, MAX, DIGITS, STATIONS, INTERVAL, PORTS, IP, X);
}, INTERVAL * 1000);