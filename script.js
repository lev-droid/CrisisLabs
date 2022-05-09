var cFrame = 0; // The current frame.

var GraphContext;
var Graph;

var risk = 0;
var riskColour = "#9999ff";

const GRAPHSIZE = 384;
const BORDERTHICKNESS = 4;
const FPS = 30; // Determines frame rate, for animations and such.


var AnimationQueue = []; // Array of queued animations.
class Animation // The eternal animation class. I just can't seem to escape it, no matter what language I run to.
{
	constructor(func, finalFunc, length) 
	{
		// With the implementation of a 'last frame' function, the seperate 'frame' class has become entirely unneccesary; each animation can simply start running another when it ends.
		this.PerFrame = func;
		this.LastFrame = finalFunc;
		
		this.Length = length;
		this.StartFrame = 0;
	}
	
	Run(sFrame) // Makes this animation run on frame sFrame.
	{
		// Clone this animation.
		nAnim = new Animation();
		nAnim.PerFrame = this.PerFrame;
		nAnim.LastFrame = this.LastFrame;
		nAnim.Length = this.Length;
		
		// Set the start frame and add it to the queue.
		nAnim.StartFrame = sFrame;
		AnimationQueue.push(nAnim);
	}
}

function AnimationManager()
{
	for (var i = 0; i < AnimationQueue.length; i++) 
	{
		cAnimation = AnimationQueue[i];
		if (cFrame >= cAnimation.StartFrame) // If the animation should be running...
		{
			cAnimation.PerFrame(); // Run it.
		}
		
		if (cFrame >= cAnimation.StartFrame + cAnimation.Length) // If the animation should be over...
		{
			cAnimation.LastFrame(); // Run its 'last frame' animation,
			AnimationQueue.splice(i, 1); // and remove it from the queue.
		}
	}
}

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

function drawTriangle(ctx, colour, oneX, oneY, twoX, twoY, threeX, threeY)
{
	ctx.fillStyle = colour;
	
	ctx.beginPath();
    ctx.moveTo(oneX, oneY);

    ctx.lineTo(twoX, twoY);
    ctx.lineTo(threeX, threeY);
    ctx.lineTo(oneX, oneY);

	ctx.fill();
	ctx.closePath();
}

function drawRectangle(ctx, colour, posX, sizeX, posY, sizeY)
{
	ctx.fillStyle = colour;
	
	ctx.fillRect(posX, posY, sizeX, sizeY);
}

function changeRisk(n)
{
	switch (n)
	{
	case (1):
		riskColour = "#d2de2a"; // Green (med risk)
		break;
	case (2):
		riskColour = "#edb715"; // Yellow (high risk)
		break;
	case (3):
		riskColour = "#e67a27"; // Orange (imminent)
		break;
	case (4):
		riskColour = "#eb381c"; // Red (ongoing)
		break;
	default:
		riskColour = "#9999ff"; // Blue (low risk)
		break;
	}
	
	risk = n;
	document.documentElement.style.setProperty("--risk-colour", riskColour);
	drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
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
		var cColour = "#505050";
		var nX = stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX);

		if (i % vertLinesDistance == 0) {
			/*ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, nX - (i.toString().length)*3, GRAPHMARGINY-5);*/
			cColour = "#606060";
		}
		
		drawLine(ctx, cColour, nX, GRAPHMARGINY, nX, GRAPHSIZE-GRAPHMARGINY, GRAPHLINESIZE);
	}
	
	// Horizontal lines
	var horizLinesDistance = Math.ceil((maxY-minY)/40); // Distance between labels on horizontal lines, in units
	for (var i = Math.ceil(metaData[2]); i < metaData[3]; i += 1)
	{
		var cColour = "#505050";
		var nY = stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GRAPHSIZE-GRAPHMARGINY);
		
		if (i % horizLinesDistance == 0) {
			/*ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, GRAPHSIZE-GRAPHMARGINX+(i.toString().length)+3, nY+3);*/
			cColour = "#606060";
		}
		
		if (i == 0) {
			cColour = "#808080";
		}
		
		drawLine(ctx, cColour, GRAPHMARGINX, nY, GRAPHSIZE-GRAPHMARGINX, nY, GRAPHLINESIZE);
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
	
	// Border rectangles, because sometimes lines and points stretch outside the graph but still need to be rendered.
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, 0, GRAPHMARGINY);
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, GRAPHSIZE-GRAPHMARGINY, GRAPHMARGINY);
	
	// This code is a crime against humanity. But alas, there may be no better way of doing this - excluding the utilization of wacky maths that I don't know how to do.
	// Vertical line labels
	for (var i = Math.ceil(metaData[0]); i < metaData[1]; i += 1)
	{
		if (i % vertLinesDistance == 0) {
			ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX) - (i.toString().length)*3, GRAPHMARGINY-3); 
		}
	}
	
	// Horizontal line labels
	for (var i = Math.ceil(metaData[2]); i < metaData[3]; i += 1)
	{		
		if (i % horizLinesDistance == 0) {
			ctx.fillStyle = "#ffffff";
			ctx.font = "10px Monospace";
			ctx.fillText(i, GRAPHSIZE-GRAPHMARGINX+(i.toString().length)+1, stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GRAPHSIZE-GRAPHMARGINY)+3);
		}
	}
	
	// Draw zoom bar at bottom
	drawRectangle(ctx, riskColour, GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINX*2, GRAPHSIZE-GRAPHMARGINY, SCROLLBARY);
	drawRectangle(ctx, GRAPHBACKGROUND, GRAPHMARGINX+BORDERTHICKNESS, GRAPHSIZE-GRAPHMARGINX*2-BORDERTHICKNESS*2, GRAPHSIZE-GRAPHMARGINY+BORDERTHICKNESS, SCROLLBARY-BORDERTHICKNESS*2);
	drawRectangle(ctx, riskColour, GRAPHMARGINX+scrollPosX, GRAPHMARGINX+SCROLLBARX, GRAPHSIZE-GRAPHMARGINY, SCROLLBARY);
	
	// Draw zoom bar on left
	drawRectangle(ctx, riskColour, GRAPHMARGINX-SCROLLBARY, SCROLLBARY, GRAPHMARGINY, GRAPHSIZE-GRAPHMARGINY*2);
	drawRectangle(ctx, GRAPHBACKGROUND, GRAPHMARGINX-SCROLLBARY+BORDERTHICKNESS, SCROLLBARY-BORDERTHICKNESS*2, GRAPHMARGINY+BORDERTHICKNESS, GRAPHSIZE-GRAPHMARGINY*2-BORDERTHICKNESS*2);
	drawRectangle(ctx, riskColour, GRAPHMARGINX-SCROLLBARY, SCROLLBARY, GRAPHMARGINY+scrollPosY, GRAPHMARGINY+SCROLLBARX);
	
	// Draw zoom bar direction guides
	ctx.fillStyle = riskColour;
	ctx.font = "40px Monospace";
	ctx.fillText("+", GRAPHMARGINX-SCROLLBARY-1, GRAPHSIZE-GRAPHMARGINY+25); 
	ctx.fillText("-", GRAPHMARGINX-SCROLLBARY, GRAPHMARGINY-2); 
	ctx.fillText("-", GRAPHSIZE-GRAPHMARGINX, GRAPHSIZE-GRAPHMARGINY+23);
}



var dataX = [
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
var dataY = [
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
var dataZ = [
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

var cData = 0;
var data = [dataX, dataY, dataZ];



function requestData() // request data from server
{
	
}

function recieveData() // recieve data from server
{
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	data[cData].push([Math.random()*0.5+data[cData].length+0.5, Math.random()*20-10]);
	
	drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
}

function unrecieveData()
{
    data[cData].pop();
    
    drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
}

function onLoad() {
	Graph = document.getElementById("graph");
	GraphContext = Graph.getContext("2d");
	
	setInterval(AnimationManager, 1000/FPS); // Run the AnimationManager every frame.
	document.addEventListener('mouseup', graphMouseUp);
	
	drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, dataX, scrollValueX, -scrollValueY, scrollValueY);
}



function graphScrollHitboxX(x, y)
{
	return ( (x>GRAPHMARGINX) && (x<GRAPHSIZE-GRAPHMARGINX) && (y>GRAPHSIZE-GRAPHMARGINY/2) && (y<GRAPHSIZE+SCROLLBARY) );
}
function graphScrollHitboxY(x, y)
{
	return ( (x>GRAPHMARGINX) && (x<GRAPHMARGINX+SCROLLBARY) && (y>GRAPHMARGINY) && (y<GRAPHSIZE-GRAPHMARGINY) );
}

var graphDraggingX = false;
var graphDraggingY = false;
function graphMouseDown(event) {
	if (graphScrollHitboxX(event.clientX, event.clientY)) {	
		graphDraggingX = true;
		graphMouseMove(event);
	} else if (graphScrollHitboxY(event.clientX, event.clientY)) {	
		graphDraggingY = true;
		graphMouseMove(event);
	}
}

function graphMouseUp(event) {
	graphDraggingX = false;
	graphDraggingY = false;
}

const SCROLLMINX = 5;
const SCROLLMAXX = 150;

const SCROLLMINY = 5;
const SCROLLMAXY = 120;

const SCROLLBARX = 32; // Size of scroll bars (parallel to nearest graph edge)
const SCROLLBARY = 24; // Size of scroll bars (perpendicular to nearest graph edge)

var minY = -40; // these do nothing right now, but they will be necessary if i decide to let user navigate graph freely
var maxY = 40;

var scrollPosX = 0;
var scrollValueX = SCROLLMINX;

var scrollPosY = 0;
var scrollValueY = SCROLLMAXY;

function graphMouseMove(event) {
	if (graphDraggingX)
	{
		scrollPosX = event.clientX - GRAPHMARGINX - SCROLLBARX;
		var scrollPosXMax = GRAPHSIZE - GRAPHMARGINX*2 - SCROLLBARX*2;
		if (scrollPosX < 0)
		{
			scrollPosX = 0;
		} else if (scrollPosX > scrollPosXMax)
		{
			scrollPosX = scrollPosXMax;
		}
		
		scrollValueX = stretchNum(scrollPosX, 0, scrollPosXMax, SCROLLMINX, SCROLLMAXX);
		drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
	} else if (graphDraggingY) 
	{
		scrollPosY = event.clientY - GRAPHMARGINY - SCROLLBARX;
		var scrollPosYMax = GRAPHSIZE - GRAPHMARGINY*2 - SCROLLBARX*2;
		if (scrollPosY < 0)
		{
			scrollPosY = 0;
		} else if (scrollPosY > scrollPosYMax)
		{
			scrollPosY = scrollPosYMax;
		}
		
		scrollValueY = stretchNum(scrollPosYMax-scrollPosY, 0, scrollPosYMax, SCROLLMINY, SCROLLMAXY);
		drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
	}
}

function graphMouseLeave() {
	/*graphDraggingX = false;
	graphDraggingY = false;*/
}

function changeGraph(newGraph) {
    cData = newGraph;
    drawGraph(Graph, GraphContext, "#ffffff", GRAPHSIZE, data[cData], scrollValueX, -scrollValueY, scrollValueY);
}

window.onload = onLoad;