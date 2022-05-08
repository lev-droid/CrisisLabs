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
		<div onclick="recieveData()">Recieve Data</div>
		<?php
			echo "My first PHP script!";
		?>

	</body>
</html>
