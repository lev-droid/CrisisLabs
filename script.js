var GraphContextX;
var GraphX;

const GRAPHXSIZE = 256;


function drawLine(ctx, colour, width, startX, startY, endX, endY)
{
	ctx.strokeStyle = colour;
	ctx.lineWidth = width;
	
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.closePath();
}

function drawCircle(ctx, colour, centerX, centerY, radius)
{
	ctx.fillStyle = colour;
	
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.closePath();
}

function drawGraph(ctx, colour)
{
	
}

function requestData() // request data from server
{
	
}

function recieveData() // recieve data from server
{
	
}

function onLoad() {
	GraphX = document.getElementById("graphX");
	GraphContextX = GraphX.getContext("2d");
	
	drawCircle(GraphContextX, "yellow", 40, 40, 15);
	drawLine(GraphContextX, "yellow", 5, 40, 40, 180, 120);
	drawCircle(GraphContextX, "yellow", 180, 120, 15);
}

window.onload = onLoad;