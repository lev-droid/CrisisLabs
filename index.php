<!DOCTYPE html>
<html>
	<head>
		<title>CRISiSLab</title>
		<script src="script.js"></script>
		<link rel="stylesheet" href="style.css">
	</head>
	
	<body>

		<canvas class="graph" id="graph" width="384" height="384" onmousemove="graphMouseMove(event)" onmousedown="graphMouseDown(event)" onmouseleave="graphMouseLeave()"> 
			Your browser does not support the canvas element. 
        </canvas>
		
		<div class="graphMenuTop"></div>
        <div class="graphMenu">
            <button class="graphMenuButton" onclick="changeGraph(0);">X</button>
            <button class="graphMenuButton" onclick="changeGraph(1);">Y</button> 
            <button class="graphMenuButton" onclick="changeGraph(2);">Z</button>
        </div>
		<div class="graphMenuBottom"></div>
	
		<button onclick="recieveData()">Recieve Data</button>
        <button onclick="unrecieveData()">Unrecieve Data</button>
		<?php
			echo "My first PHP script!";
		?>
        

	</body>
</html>
