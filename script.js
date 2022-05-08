var GraphContext;
var Graph;

const GRAPHSIZE = 384;
const BORDERTHICKNESS = 4;


function stretchNum(input, min, max, nmin, nmax) // Converts input to its equivelent value in a new range
{
	return ((((input-min)/(max-min)) * (nmax-nmin)) + nmin);
}



function drawLine(ctx, colour, startX, startY, endX, endY, width)
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

function drawRectangle(ctx, colour, posX, sizeX, posY, sizeY)
{
	ctx.fillStyle = colour;
	
	ctx.fillRect(posX, posY, sizeX, sizeY);
}

const GRAPHCIRCLESIZE = 2;
const GRAPHLINESIZE = 1;

const GRAPHMARGINX = 30;
const GRAPHMARGINY = 30;

const GRAPHBACKGROUND = "#3c3c3c"

function drawGraph(graph, ctx, colour, size, data, displayAmount, minY, maxY)
{	
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, 0, size);
	var cDisplayAmount = displayAmount;
	if (displayAmount > data.length)
	{
		cDisplayAmount = data.length;
	}
	
	var lastData = data.length-1; // just a slight optimization
	var tempData = data[lastData]; // another slight optimization
	
	var metaData = [tempData[0], tempData[1], minY, maxY];
	
	// calculates the minimum and maximum values of the graph it's trying to display
	for (var i = lastData; i > lastData-cDisplayAmount; i--) // as painful as it is to do the same loop twice, there probably isn't any way to combine them, or to calculate this stuff less often
	{
		// this is terribly inefficient, but i gotta do this somehow, and i cant think of a better way
		if (data[i][0] < metaData[0])
		{
			metaData[0] = data[i][0];
		} else if (data[i][0] > metaData[1])
		{
			metaData[1] = data[i][0];
		}
		
		/*if (data[i][1] < metaData[2])
		{
			metaData[2] = data[i][1];
		} else if (data[i][1] > metaData[3])
		{
			metaData[3] = data[i][1];
		}*/
	}
	//var metaData = [0, 60, 0, 20];
	
	// Draw grid background
	
	// Vertical lines
	var vertLinesDistance = Math.ceil(cDisplayAmount/15); // Distance between labels on vertical lines, in units
	for (var i = Math.ceil(metaData[0]); i < metaData[1]; i += 1)
	{
		var nX = stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX);
		drawLine(ctx, "#505050", nX, GRAPHMARGINY, nX, GRAPHSIZE-GRAPHMARGINY, GRAPHLINESIZE);
		
		if (i % vertLinesDistance == 0) {
			ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, nX - (i.toString().length)*3, GRAPHMARGINY-5); 
		}
	}
	
	// Horizontal lines
	var horizLinesDistance = Math.ceil((maxY-minY)/40); // Distance between labels on horizontal lines, in units
	for (var i = Math.ceil(metaData[2]); i < metaData[3]; i += 1)
	{
		var cColour = "#505050";
		if (i == 0) {
			cColour = "#808080";
		}
		
		var nY = stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GRAPHSIZE-GRAPHMARGINY);
		drawLine(ctx, cColour, GRAPHMARGINX, nY, GRAPHSIZE-GRAPHMARGINX, nY, GRAPHLINESIZE);
		
		if (i % horizLinesDistance == 0) {
			ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, GRAPHSIZE-GRAPHMARGINX+(i.toString().length)+3, nY+3);
		}
	}
	
	// old x/y, because drawing lines between points requires the positions of both the current point and the previous one
	var oX;
	var oY;
	
	for (var i = lastData; i > lastData-cDisplayAmount; i--)
	{
		var cX = stretchNum(data[i][0], metaData[0], metaData[1], GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX);
		var cY = stretchNum(data[i][1], metaData[2], metaData[3], GRAPHMARGINY, GRAPHSIZE-GRAPHMARGINY);
		
		drawCircle(ctx, colour, cX, cY, GRAPHCIRCLESIZE);
		
		if (i != lastData) {
			drawLine(ctx, colour, oX, oY, cX, cY, GRAPHLINESIZE);
		}
		
		oX = cX;
		oY = cY;
	}
	
	// Draw scroll bar at bottom
	drawRectangle(ctx, "#9999ff", GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX*2, GRAPHSIZE-GRAPHMARGINY, 24);
	drawRectangle(ctx, GRAPHBACKGROUND, GRAPHMARGINX+BORDERTHICKNESS, GRAPHSIZE-(GRAPHMARGINX*2)-(BORDERTHICKNESS*2), GRAPHSIZE-GRAPHMARGINY+BORDERTHICKNESS, 16);
	drawRectangle(ctx, "#9999ff", GRAPHMARGINX+scrollPosX, GRAPHMARGINX+SCROLLBARX, GRAPHSIZE-GRAPHMARGINY, 24);
}



var Data = [
	[Math.random()*0.5+0.5, Math.random()*20-10],
	[Math.random()*0.5+1.5, Math.random()*20-10],
	[Math.random()*0.5+2.5, Math.random()*20-10],
	[Math.random()*0.5+3.5, Math.random()*20-10],
	[Math.random()*0.5+4.5, Math.random()*20-10],
	[Math.random()*0.5+5.5, Math.random()*20-10],
	[Math.random()*0.5+6.5, Math.random()*20-10],
	[Math.random()*0.5+7.5, Math.random()*20-10],
	[Math.random()*0.5+8.5, Math.random()*20-10],
	[Math.random()*0.5+9.5, Math.random()*20-10],
	[Math.random()*0.5+10.5, Math.random()*20-10],
	[Math.random()*0.5+11.5, Math.random()*20-10],
	[Math.random()*0.5+12.5, Math.random()*20-10],
	[Math.random()*0.5+13.5, Math.random()*20-10],
	[Math.random()*0.5+14.5, Math.random()*20-10],
	[Math.random()*0.5+15.5, Math.random()*20-10]
];

function requestData() // request data from server
{
	
}

function recieveData() // recieve data from server
{
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	Data.push([Math.random()*0.5+Data.length+0.5, Math.random()*20-10]);
	
	drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, Data, scrollValueX, minY, maxY);
}

function onLoad() {
	Graph = document.getElementById("graph");
	GraphContext = Graph.getContext("2d");
	
	drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, Data, scrollValueX, minY, maxY);
}



function graphScrollHitboxX(x, y)
{
	return ( (x>GRAPHMARGINX) && (x<GRAPHSIZE-GRAPHMARGINX) && (y>GRAPHSIZE-GRAPHMARGINY+12) && (y<GRAPHSIZE-GRAPHMARGINY+36) );
}

var graphDraggingX = false;
var graphDraggingY = false;
function graphMouseDown(event) {
	if (graphScrollHitboxX(event.clientX, event.clientY)) {	
		graphDraggingX = true;
		graphMouseMove(event)
	}
}

function graphMouseUp(event) {
	graphDraggingX = false;
}

const SCROLLMINX = 4;
const SCROLLMAXX = 128;

const SCROLLBARX = 32; // Size of the X axis scroll bar in pixels

var minY = -40;
var maxY = 40;
var scrollPosX = 0;
var scrollValueX = 4;
function graphMouseMove(event) {
	if (graphDraggingX)
	{
		scrollPosX = event.clientX - GRAPHMARGINX - SCROLLBARX;
		var scrollPosXMax = GRAPHSIZE - GRAPHMARGINX*2 - SCROLLBARX*2;
		console.log(scrollPosX);
		if (scrollPosX < 0)
		{
			scrollPosX = 0;
		} else if (scrollPosX > scrollPosXMax)
		{
			scrollPosX = scrollPosXMax;
		}
		
		scrollValueX = stretchNum(scrollPosX, 0, GRAPHSIZE-GRAPHMARGINX, SCROLLMINX, SCROLLMAXX);
		drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, Data, scrollValueX, minY, maxY);
	}
}

function graphMouseLeave() {
	/*graphDraggingX = false;
	graphDraggingY = false;*/
}

window.onload = onLoad;
document.addEventListener('mouseup', graphMouseUp);
