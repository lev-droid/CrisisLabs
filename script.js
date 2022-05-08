var GraphContextX;
var GraphX;

const GRAPHXSIZE = 384;



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

function drawRectangle(ctx, colour, posX, posY, sizeX, sizeY)
{
	ctx.fillStyle = colour;
	
	ctx.fillRect(posX, posY, sizeX, sizeY);
}

const GRAPHCIRCLESIZE = 3;
const GRAPHLINESIZE = 2;

const GRAPHMARGINX = 40;
const GRAPHMARGINY = 40;

function drawGraph(graph, ctx, colour, size, data, displayAmount)
{	
	drawRectangle(ctx, "#3c3c3c", 0, 0, size, size);
	var cDisplayAmount = displayAmount;
	if (displayAmount > data.length)
	{
		cDisplayAmount = data.length;
	}
	
	var lastData = data.length-1; // just a slight optimization
	var tempData = data[lastData]; // another slight optimization
	var metaData = [tempData[0], tempData[0], tempData[1], tempData[1]];
	
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
		
		if (data[i][1] < metaData[2])
		{
			metaData[2] = data[i][1];
		} else if (data[i][1] > metaData[3])
		{
			metaData[3] = data[i][1];
		}
	}

	//var metaData = [0, 60, 0, 20];
	
	// Draw grid background
	
	// Vertical lines
	for (var i = Math.ceil(metaData[0]); i < metaData[1]; i += 2)
	{
		var nX = stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GRAPHXSIZE-GRAPHMARGINX);
		drawLine(ctx, "#505050", nX, GRAPHMARGINY, nX, GRAPHXSIZE-GRAPHMARGINY, GRAPHLINESIZE);
		
		ctx.fillStyle = "#ffffff";
		ctx.font = "10px Monospace";
		ctx.fillText(i, nX - (i.toString().length)*3, GRAPHMARGINY-5); 
	}
	
	// Horizontal lines
	for (var i = Math.ceil(metaData[2]); i < metaData[3]; i += 1)
	{
		var cColour = "#505050";
		if (i == 0) {
			cColour = "#808080";
		}
		
		var nY = stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GRAPHXSIZE-GRAPHMARGINY);
		drawLine(ctx, cColour, GRAPHMARGINX, nY, GRAPHXSIZE-GRAPHMARGINX, nY, GRAPHLINESIZE);
		
		ctx.fillStyle = "#ffffff";
		ctx.font = "10px Monospace";
		ctx.fillText(i, GRAPHXSIZE-GRAPHMARGINX+(i.toString().length)+3, nY+3); 
	}
	
	// old x/y, because drawing lines between points requires the positions of both the current point and the previous one
	var oX;
	var oY;
	
	for (var i = lastData; i > lastData-cDisplayAmount; i--)
	{
		var cX = stretchNum(data[i][0], metaData[0], metaData[1], GRAPHMARGINX, GRAPHXSIZE-GRAPHMARGINX);
		var cY = stretchNum(data[i][1], metaData[2], metaData[3], GRAPHMARGINY, GRAPHXSIZE-GRAPHMARGINY);
		
		drawCircle(ctx, colour, cX, cY, GRAPHCIRCLESIZE);
		
		if (i != lastData) {
			drawLine(ctx, colour, oX, oY, cX, cY, GRAPHLINESIZE);
		}
		
		oX = cX;
		oY = cY;
	}
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
	drawGraph(GraphX, GraphContextX, "#ffffff", GRAPHXSIZE, Data, 20);
}

function onLoad() {
	GraphX = document.getElementById("graphX");
	GraphContextX = GraphX.getContext("2d");
	
	drawGraph(GraphX, GraphContextX, "#ffffff", GRAPHXSIZE, Data, 20);
}

window.onload = onLoad;
document.addEventListener('click', recieveData);
