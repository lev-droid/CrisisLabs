var cFrame = 0; // The current frame.

var GraphContext = [];
var Graph = [];
var GraphSize = 384;

var lastID = 0;

var riskColourMap = [
	[153, 153, 255],
	[237, 183, 21],
	[235, 56, 28]
];
var riskNameMap = [
	"None",
	"Potential",
	"Confirmed"
];
var risk = 0;
var riskColour = "rgb(153, 153, 255)";
var riskColourRGB = [153, 153, 255];
var oldColourRGB = [153, 153, 255];
var newColourRGB = [153, 153, 255];

const BORDERTHICKNESS = 4;
const FPS = 60; // Determines frame rate, for animations and such.


var AnimationQueue = []; // Array of queued animations.
class Animation
{
	constructor(func, finalFunc, length, name) 
	{
		this.PerFrame = func;
		this.LastFrame = finalFunc;
		
		this.Length = length;
		this.StartFrame = 0;
		
		this.Queued = false;
		this.Base = null;
		this.Instance = null;
		
		this.Name = name; // For debugging only.
	}
	
	Run(sFrame) // Makes this animation run on frame sFrame.
	{
		if (!this.Queued) // If this animation is already being run, it doesn't need to be run again.
		{
			// Clone this animation.
			var nAnim = new Animation();
			nAnim.PerFrame = this.PerFrame;
			nAnim.LastFrame = this.LastFrame;
			
			nAnim.Length = this.Length;
			nAnim.Base = this;
			
			this.Queued = true;
			this.Instance = nAnim;
			
			// Set the start frame and add it to the queue.
			nAnim.StartFrame = sFrame;
			AnimationQueue.push(nAnim);
		}
	}
}

function AnimationManager()
{
	cFrame++;
	for (var i = 0; i < AnimationQueue.length; i++) 
	{
		cAnimation = AnimationQueue[i];

		if (cFrame >= cAnimation.StartFrame + cAnimation.Length) // If the animation should be over...
		{
			cAnimation.LastFrame(); // Run its 'last frame' animation,
			cAnimation.Base.Queued = false; // Allow the base animation to be run again,
			cAnimation.Base.Instance = null;
			AnimationQueue.splice(i, 1); // and remove it from the queue.
		} else if (cFrame >= cAnimation.StartFrame) // If the animation should be running...
		{
			cAnimation.PerFrame(cFrame - cAnimation.StartFrame); // Run it.
		}
	}
}


function stretchNum(input, min, max, nmin, nmax) // Converts input to its equivelent value in a new range
{
	return ((((input-min)/(max-min)) * (nmax-nmin)) + nmin);
}

function convertColour(input1, input2, input3)
{
	return ("rgb(" + input1.toString() + ", " + input2.toString() + ", " + input3.toString() + ")");
}

// should work for what the thing i need it for, but it wont handle negatives very well (also it's stolen from StackOverflow)
function NearestLogTen(x)
{
	return (Math.pow(10, Math.floor(Math.log10(x))));
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

function changeRisk()
{	
	if (!changeColour.Queued) // This if statement shouldn't be in the final version, it's just here to make this look nicer.
	{
		oldColourRGB = riskColourRGB;
		newColourRGB = riskColourMap[n];
		
		risk = n;
		
		changeColour.Run(cFrame+1); // Run the colour updating animation next frame.
		changeText.Run(cFrame+1);
	}
}
const CHANGECOLOURLENGTH = 0.25;
var root;
changeColour = new Animation(
	function(cProgress) {
		for (var i = 0; i < 3; i++) // Loop through all 3 channels of the colour.
		{
			riskColourRGB[i] = stretchNum(Math.sin(stretchNum(cProgress, 0, FPS*CHANGECOLOURLENGTH-1, Math.PI*2, Math.PI*5/2)), 0, 1, oldColourRGB[i], newColourRGB[i]); // Converts the progress through the animation to progress from one colour to another. Fades in and out according to a sine function.
		}
		
		// Update the colour both in the CSS and the rest of the script.
		riskColour = convertColour(riskColourRGB[0], riskColourRGB[1], riskColourRGB[2]);
		root.style.setProperty("--risk-colour", riskColour);
		
		// Redraw the graph to display the change in colour.
		for (var i = 0; i < GraphContext.length; i++)
		{
			drawGraph(i, "#ffffff", GraphSize, data[cData[i]], scrollValueX[i], -scrollValueY[i], scrollValueY[i], scrollValueXMin);
		}
	},
	function() {},
	FPS*CHANGECOLOURLENGTH,
	"Change Colour"
);
var riskWidth = 384;
var riskOffset = 20;
var riskMenuTransition;
var riskMenuDisplay;
changeText = new Animation(
	function (cProgress) {
		riskMenuTransition.style.setProperty("width", Math.sin(stretchNum(cProgress, 0, FPS/2*CHANGECOLOURLENGTH-1, Math.PI*2, Math.PI*5/2)) * riskWidth + "px");
	},
	function() {
		changeText2.Run(cFrame);
	},
	FPS/2*CHANGECOLOURLENGTH,
	"Change Text A"
);
changeText2 = new Animation(
	function (cProgress) {},
	function() {
		riskMenuDisplay.innerHTML = riskNameMap[risk].toUpperCase();
		changeText3.Run(cFrame);
	},
	0,
	"Change Text B"
);
changeText3 = new Animation(
	function (cProgress) {
		var cProgressMult = Math.sin(stretchNum(cProgress, 0, FPS/2*CHANGECOLOURLENGTH-1, Math.PI*2, Math.PI*5/2));
		riskMenuTransition.style.setProperty("right", cProgressMult * riskWidth + riskOffset + "px");
		riskMenuTransition.style.setProperty("width", (1 - cProgressMult) * riskWidth + "px");
	},
	function() {
		changeText4.Run(cFrame);
	},
	FPS/2*CHANGECOLOURLENGTH,
	"Change Text C"
);
changeText4 = new Animation(
	function (cProgress) {},
	function() {
		riskMenuTransition.style.setProperty("width", 0);
		riskMenuTransition.style.setProperty("right", riskOffset + "px");
	},
	0,
	"Change Text D"
);




const GRAPHCIRCLESIZE = 0;
const GRAPHLINESIZE = 1;

const GRAPHMARGINX = 30;
const GRAPHMARGINY = 30;

const GRAPHBACKGROUND = "#3c3c3c"

function drawGraph(id, colour, size, data, displayAmount, minY, maxY, minX)
{
	// lazy
	if (data.length < 3) 
	{
		return;
	}
	
	var ctx = GraphContext[id];
	
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, 0, size);
	var cDisplayAmount = displayAmount;
	if (displayAmount > data.length)
	{
		cDisplayAmount = data.length;
	}
	
	var lastData = data.length-1;
	var tempData = data[lastData];
	
	var metaData = [tempData[0], tempData[1], minY, maxY];
	
	// calculates the minimum and maximum values of the graph it's trying to display
	for (var i = lastData; i > lastData-cDisplayAmount; i--)
	{
		// this seems terribly inefficient, but i gotta do this somehow, and i cant think of a better way
		if (data[i][0] < metaData[0])
		{
			metaData[0] = data[i][0];
		} else if (data[i][0] > metaData[1])
		{
			metaData[1] = data[i][0];
		}
	}
	//var metaData = [0, 60, 0, 20];
	
	// Draw grid background
	
	// NOTE: Fix graph (its wierd and buggy, that may be vague but you seriously GOTTA do this)
	// Vertical lines
	var vertLinesRound = NearestLogTen(tempData[0])/10;
	var vertLinesDistance = vertLinesRound; //Math.floor( (cDisplayAmount/(80-((Math.floor(tempData[0])).toString().length*10)))*vertLinesRound )/vertLinesRound; // Distance between labels on vertical lines, in units
	//console.log("vertLinesDistance: " + vertLinesDistance);
	var vertLinesStart = Math.ceil(metaData[0]*vertLinesRound)/vertLinesRound;
	//console.log("vertLinesStart: " + vertLinesStart);
	//console.log("metaData[1]: " + metaData[1]);
	for (var i = vertLinesStart; i < metaData[1]; i += vertLinesDistance)
	{
		var cColour = "#505050";
		var nX = stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GraphSize-GRAPHMARGINX);

		/*if (i % vertLinesDistance == 0) {
			cColour = "#606060";
		}*/
		
		drawLine(ctx, cColour, nX, GRAPHMARGINY, nX, GraphSize-GRAPHMARGINY, GRAPHLINESIZE);
	}
	
	//console.log("-------------------");
	
	// Horizontal lines
	var horizLinesRound = NearestLogTen(metaData[3])/10;
	var horizLinesRound2 = NearestLogTen(maxY-minY)/10;
	//console.log("horizLinesRound: " + horizLinesRound);
	//console.log("horizLinesRound2: " + horizLinesRound2);
	var horizLinesDistance = horizLinesRound; //Math.floor( (maxY-minY)/(40-((Math.floor(metaData[3])).toString().length*10))/horizLinesRound2 )*horizLinesRound2; // Distance between labels on horizontal lines, in units
	//console.log("horizLinesDistance: " + horizLinesDistance);
	var horizLinesStart = Math.ceil(metaData[2]/horizLinesRound)*horizLinesRound;
	//console.log("horizLinesStart: " + horizLinesStart);
	//console.log("metaData[3]: " + metaData[3]);
	
	
	//console.log("------------------------------------");
	
	for (var i = horizLinesStart; i < metaData[3]; i += horizLinesDistance)
	{
		var cColour = "#505050";
		var nY = stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GraphSize-GRAPHMARGINY);
		
		/*if (i % horizLinesDistance == 0) {
			cColour = "#606060";
		}*/
		
		if (i == 0) {
			cColour = "#808080";
		}
		
		drawLine(ctx, cColour, GRAPHMARGINX, nY, GraphSize-GRAPHMARGINX, nY, GRAPHLINESIZE);
	}
	
	// old x/y, because drawing lines between points requires the positions of both the current point and the previous one
	var oX;
	var oY;
	
	for (var i = lastData; i > lastData-cDisplayAmount; i--)
	{
		var cX = stretchNum(data[i][0], metaData[0], metaData[1], GRAPHMARGINX, GraphSize-GRAPHMARGINX);
		var cY = stretchNum(data[i][1], metaData[2], metaData[3], GRAPHMARGINY, GraphSize-GRAPHMARGINY);
		
		drawCircle(ctx, colour, cX, cY, GRAPHCIRCLESIZE);
		
		if (i != lastData) {
			drawLine(ctx, colour, oX, oY, cX, cY, GRAPHLINESIZE);
		}
		
		oX = cX;
		oY = cY;
	}
	
	// Border rectangles, because sometimes lines and points stretch outside the graph but still need to be rendered.
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, 0, GRAPHMARGINY);
	drawRectangle(ctx, GRAPHBACKGROUND, 0, size, GraphSize-GRAPHMARGINY, GRAPHMARGINY);
	
	// Vertical line labels
	for (var i = vertLinesStart; i < metaData[1]; i += vertLinesDistance)
	{
		ctx.fillStyle = "#ffffff";
		ctx.font = "10px Monospace";
		//var j = Math.floor(i);
		ctx.fillText(i, stretchNum(i, metaData[0], metaData[1], GRAPHMARGINX, GraphSize-GRAPHMARGINX) - (i.toString().length*2.5), GRAPHMARGINY-3); 
	}
	
	// Horizontal line labels
	for (var i = horizLinesStart; i < metaData[3]; i += horizLinesDistance)
	{		
		ctx.fillStyle = "#ffffff";
		ctx.font = "10px Monospace";
		ctx.fillText(i, GraphSize-GRAPHMARGINX+1, stretchNum(i, metaData[2], metaData[3], GRAPHMARGINY, GraphSize-GRAPHMARGINY)+3);
	}
	
	// Draw zoom bar at bottom
	drawRectangle(ctx, riskColour, GRAPHMARGINX, GraphSize-GRAPHMARGINX*2, GraphSize-GRAPHMARGINY, SCROLLBARY);
	drawRectangle(ctx, GRAPHBACKGROUND, GRAPHMARGINX+BORDERTHICKNESS, GraphSize-GRAPHMARGINX*2-BORDERTHICKNESS*2, GraphSize-GRAPHMARGINY+BORDERTHICKNESS, SCROLLBARY-BORDERTHICKNESS*2);
	drawRectangle(ctx, riskColour, GRAPHMARGINX+scrollPosX[id], GRAPHMARGINX+SCROLLBARX, GraphSize-GRAPHMARGINY, SCROLLBARY);
	
	// Draw zoom bar on left
	drawRectangle(ctx, riskColour, GRAPHMARGINX-SCROLLBARY, SCROLLBARY, GRAPHMARGINY, GraphSize-GRAPHMARGINY*2);
	drawRectangle(ctx, GRAPHBACKGROUND, GRAPHMARGINX-SCROLLBARY+BORDERTHICKNESS, SCROLLBARY-BORDERTHICKNESS*2, GRAPHMARGINY+BORDERTHICKNESS, GraphSize-GRAPHMARGINY*2-BORDERTHICKNESS*2);
	drawRectangle(ctx, riskColour, GRAPHMARGINX-SCROLLBARY, SCROLLBARY, GRAPHMARGINY+scrollPosY[id], GRAPHMARGINY+SCROLLBARX);
	
	// Draw zoom bar direction guides
	ctx.fillStyle = riskColour;
	ctx.font = "40px Monospace";
	ctx.fillText("+", GRAPHMARGINX-SCROLLBARY-1, GraphSize-GRAPHMARGINY+25); 
	ctx.fillText("-", GRAPHMARGINX-SCROLLBARY, GRAPHMARGINY-2); 
	ctx.fillText("-", GraphSize-GRAPHMARGINX, GraphSize-GRAPHMARGINY+23);
}


var cData = [];
cData[0] = "'EHZ'0";
cData[1] = "'EHZ'1";
var data = [];
data["'EHZ'0"] = [];
data["'ENZ'0"] = [];
data["'ENE'0"] = [];
data["'ENN'0"] = [];
data["'EHZ'1"] = [];
data["'ENZ'1"] = [];
data["'ENE'1"] = [];
data["'ENN'1"] = [];




function onLoad() {
	root = document.documentElement;
	
	Graph[0] = document.getElementById("graph");
	GraphContext[0] = Graph[0].getContext("2d");
	Graph[1] = document.getElementById("graph2");
	GraphContext[1] = Graph[1].getContext("2d");
	GraphSize = Graph[0].offsetWidth - parseInt(window.getComputedStyle(root).getPropertyValue("--border"))*2; // bruh why does getpropertyvalue extend the style when setproperty extends the element
	
	riskMenuTransition = document.getElementById("riskMenuTransition");
	riskMenuDisplay = document.getElementById("riskMenuDisplay");
	riskWidth = document.getElementById("riskMenuBackground").offsetWidth;
	riskOffset = root.offsetWidth - (riskMenuTransition.offsetLeft + riskMenuTransition.offsetWidth);
	
	loginBackground = document.getElementById("login");
	loginBanner = document.getElementById("login2");
	
	setInterval(AnimationManager, 1000/FPS); // Run the AnimationManager every frame.
}



function graphScrollHitboxX(x, y)
{
	return ( (x>GRAPHMARGINX) && (x<GraphSize-GRAPHMARGINX) && (y>GraphSize-GRAPHMARGINY) && (y<GraphSize+SCROLLBARY) );
}
function graphScrollHitboxY(x, y)
{
	return ( (x>GRAPHMARGINX-SCROLLBARY) && (x<GRAPHMARGINX) && (y>GRAPHMARGINY) && (y<GraphSize-GRAPHMARGINY) );
}

var graphDraggingX = false;
var graphDraggingY = false;
function graphMouseDown(event, id) {
	var bounds = event.target.getBoundingClientRect();
	var clientX = event.clientX - bounds.left;
	var clientY = event.clientY - bounds.top;
	
	if (graphScrollHitboxX(clientX, clientY)) {	
		graphDraggingX = true;
		graphMouseMove(event, id);
	} else if (graphScrollHitboxY(clientX, clientY)) {	
		graphDraggingY = true;
		graphMouseMove(event, id);
	}
}

function graphMouseUp(event) {
	graphDraggingX = false;
	graphDraggingY = false;
}

const SCROLLMINX = 100;
const SCROLLMAXX = 10000;

const SCROLLMINY = 0.00025;
const SCROLLMAXY = 0.05;

const SCROLLBARX = 32; // Size of scroll bars (parallel to nearest graph edge)
const SCROLLBARY = 24; // Size of scroll bars (perpendicular to nearest graph edge)

var minY = -40; // these do nothing right now, but they will be necessary if i decide to let user navigate graph freely
var maxY = 40;

var scrollPosX = [];
scrollPosX[0] = 0;
scrollPosX[1] = 0;
var scrollValueX = [];
scrollValueX[0] = SCROLLMINX;
scrollValueX[1] = SCROLLMINX;


var scrollValueXMin = 0;

var scrollPosY = [];
scrollPosY[0] = 0;
scrollPosY[1] = 0;
var scrollValueY = [];
scrollValueY[0] = SCROLLMAXY;
scrollValueY[1] = SCROLLMAXY;

function graphMouseMove(event, id) {
	var bounds = event.target.getBoundingClientRect();
	var clientX = event.clientX - bounds.left;
	var clientY = event.clientY - bounds.top;
	
	if (graphDraggingX)
	{
		scrollPosX[id] = clientX - GRAPHMARGINX - SCROLLBARX;
		var scrollPosXMax = GraphSize - GRAPHMARGINX*2 - SCROLLBARX*2;
		if (scrollPosX[id] < id)
		{
			scrollPosX[id] = id;
		} else if (scrollPosX[id] > scrollPosXMax)
		{
			scrollPosX[id] = scrollPosXMax;
		}
		
		scrollValueX[id] = stretchNum(scrollPosX[id], id, scrollPosXMax, SCROLLMINX, SCROLLMAXX);
		drawGraph(id, "#ffffff", GraphSize, data[cData[id]], scrollValueX[id], -scrollValueY[id], scrollValueY[id], scrollValueXMin);
	} else if (graphDraggingY) 
	{
		scrollPosY[id] = clientY - GRAPHMARGINY - SCROLLBARX;
		var scrollPosYMax = GraphSize - GRAPHMARGINY*2 - SCROLLBARX*2;
		if (scrollPosY[id] < id)
		{
			scrollPosY[id] = id;
		} else if (scrollPosY[id] > scrollPosYMax)
		{
			scrollPosY[id] = scrollPosYMax;
		}
		
		scrollValueY[id] = stretchNum(scrollPosYMax-scrollPosY[id], id, scrollPosYMax, SCROLLMINY, SCROLLMAXY);
		drawGraph(id, "#ffffff", GraphSize, data[cData[id]], scrollValueX[id], -scrollValueY[id], scrollValueY[id], scrollValueXMin);
	}
}

function graphMouseLeave() {
	/*graphDraggingX = false;
	graphDraggingY = false;*/
}

function changeGraph(newGraph, id) {
    cData[id] = newGraph.replaceAll("/QUOTE/", "'");
    drawGraph(id, "#ffffff", GraphSize, data[cData[id]], scrollValueX[id], -scrollValueY[id], scrollValueY[id], scrollValueXMin);
}

window.onload = onLoad;


// NOTE: Clean this up before submitting

function loadData(rawData)
{
    rawData.split('~').forEach(function(nData)
	{
		//console.log(nData);
		if (nData != "")
		{
			nData = nData.split(',');
			//console.log(nData[0]);
			data[nData[0]].push([parseFloat(nData[1]), parseFloat(nData[2])]);
		}
	});
}


var ip = "localhost";
var port = "4000";
var pw = "";
var token = "";

var ipInput = "ip";
var portInput = "port";
var pwInput = "pw";
var textOutput = "loginText";

var loginClicked = false;
var admin = false;

var adminClasses = [
	"adminLabel",
	"adminInput",
	"adminButton",
	"adminRow",
	"admin"
];

var LoginReader = new FileReader();
function TryLogin() 
{
	if (loginClicked)
	{
		return; // lazy
	}
	loginClicked = true;
	
	var ip = document.getElementById(ipInput).value;
	var port = document.getElementById(portInput).value;
	var pw = document.getElementById(pwInput).value;
	document.getElementById(textOutput).innerHTML = "Connecting to server...";
	
	fetch("http://" + ip + ":" + port + "/login", {
		headers: {
			"pw": pw
		}
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
			document.getElementById(textOutput).innerHTML = "Failed to connect to server. (Status: " + response.status + ")";
		}

		return response.blob();
	})
	.then((response) => {
		LoginReader.readAsText(response);
	});
}
function SuccessfulLogin()
{
	if (token.length > 100) // only display admin panel if we got a token from the server
	{
		admin = true;
		document.getElementById(textOutput).innerHTML = "Successfully connected to server. (Admin access granted)";
	} else {
		for (var i = 0; i < adminClasses.length; i++)
		{
			var classObjects = Array.from(document.getElementsByClassName(adminClasses[i]));
			for (var j = 0; j < classObjects.length; j++)
			{
				classObjects[j].remove(); // token system means the server wouldnt care for any changes made through this menu without admin anyway, its deletion from the page is purely aesthetic
			}
		}
		
		document.getElementById(textOutput).innerHTML = "Successfully connected to server.";
	}
	
	setInterval(RequestData, 250); // Check for new data every 0.25 seconds
	setInterval(RequestRisk, 250); // Check for new risk level every 0.25 seconds
	document.addEventListener('mouseup', graphMouseUp);
	
	LoginAnimation.Run(cFrame+1);
}
LoginReader.addEventListener('load', () => {
	token = LoginReader.result;
	if ((token != "0") && (token.length < 100))
	{
		document.getElementById(textOutput).innerHTML = "Failed to connect to server. (Unexpected response \"" + token + "\")";
	} else {
		SuccessfulLogin();
	}
});
var loginBackground;
var loginBanner;
LoginAnimation = new Animation(
	function (cProgress) {
		loginBanner.style.setProperty("top", "calc(" + stretchNum(Math.sin(stretchNum(cProgress, 0, FPS*2, 0, Math.PI/2)), 0, 1, 50, -50) + "% - 100px)");
		loginBackground.style.setProperty("opacity", Math.sin(stretchNum(cProgress, 0, FPS*2, Math.PI/2, 0)).toString());
	},
	function() {
		loginBanner.remove();
		loginBackground.remove()
	},
	FPS*2,
	"Change Text A"
);

var DataReader = new FileReader();
var RiskReader = new FileReader();
function RequestData() 
{
	fetch("http://" + ip + ":" + port + "/data", {
		headers: {
			"id": lastID
		}
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return response.blob();
	})
	.then((response) => {
		DataReader.readAsText(response);
	});
}

function RequestRisk() 
{
	fetch("http://" + ip + ":" + port + "/risk", {})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return response.blob();
	})
	.then((response) => {
		RiskReader.readAsText(response);
	});
}

DataReader.addEventListener('load', () => {
	var arr = DataReader.result.split('|');
	lastID = parseInt(arr[arr.length-2]); // lazy but should work (for now)
	
	var str = "";
	for (var i = 0; i < arr.length-1; i += 2)
	{
		str += arr[i];
	}
	
	
	//console.log(arr);
	//console.log(arr[arr.length-2]);
	//console.log(str);
	loadData(str);
	
	for (var i = 0; i < GraphContext.length; i++)
	{
		drawGraph(i, "#ffffff", GraphSize, data[cData[i]], scrollValueX[i], -scrollValueY[i], scrollValueY[i], scrollValueXMin);
	}
});

RiskReader.addEventListener('load', () => {
	var nRisk = parseInt(RiskReader.result);
	//console.log(RiskReader.result);
	//console.log(nRisk);
	if ((nRisk != null) && (nRisk != risk)) {
		changeRisk(nRisk);
	}
});



var EditReader = new FileReader();
function EditServer(token, target, value)
{
	fetch("http://" + ip + ":" + port + "/edit", {
		headers: {
			"token": token,
			"target": target,
			"value": value
		}
	})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		return response.blob();
	})
	.then((response) => {
		EditReader.readAsText(response);
	});
}

EditReader.addEventListener('load', () => {
	switch(EditReader.result)
	{
		case ("1"):
			console.log("Failed to edit value (invalid input)");
			break;
		case ("2"):
			console.log("Failed to edit value (invalid target)");
			break;
		case ("3"):
			console.log("Token invalid. Reloading page...");
			location.reload();
			break;
		/*default:
			console.log(EditReader.result);
			break;*/
	}
});