/**
 * Created by rohana on 3/9/16.
 */

$(function() {
	'use strict';
	// setup constants
	var canvasX = 250;
	var canvasY = 50;
	var canvasDim = 500;
	var centerOffset = canvasDim / 2;
	var interval = 10;
	var referenceTime = 0;

	// center object mass settings
	var centerObjectMass = 5000000000;
	var centerObjectSize = 50;

	// physical constants and constraints
	var gravitationalConstant =  6.674 * Math.pow(10, -11);
	var speedOfLight = 299792458;
	var lowerBound = (3 * centerObjectMass * gravitationalConstant) / (speedOfLight ^ 2);

	// orbiting objects
	var orbitingObjects = [];

	var paper = Raphael(canvasX, canvasY, canvasDim, canvasDim);
	var centerObject = paper.circle(centerOffset, centerOffset, centerObjectSize);
	centerObject.attr("fill", "#000").attr("stroke", "#fff");

	addObject('earth', 150, "blue"); //debug
	addObject('mars', 200, "red"); //debug

	setInterval(function(){

		referenceTime += interval;
		$('#reference').text(referenceTime);

		orbitingObjects.forEach(function(object) {
			var velocity = Math.sqrt(gravitationalConstant * centerObjectMass / object.radius);
			object.theta = object.theta + (velocity / object.radius * interval);
			var dx = object.radius * Math.cos(object.theta) + centerOffset - object.x;
			object.x = object.x + dx;
			var dy = object.radius * Math.sin(object.theta) + centerOffset - object.y;
			object.y = object.y + dy;
			object.raphaelObj.translate(dx, dy);

			var amountAhead = referenceTime - calculateAge(centerObjectMass, object.radius);

			var timeSelector = $("#" + object.name);
			if (!timeSelector.length) {
				console.log("getting here");
				$("#sidebar").append("<p>" + object.name + " is  ahead by: <span id=" + object.name + "></span></p>")
			}
			timeSelector.text(amountAhead)
		});

	}, interval);

	function calculateAge(mass, radius) {
		// relative time
		return referenceTime * Math.sqrt(1 - (3/2) *
				(1/radius) * (3 * gravitationalConstant * mass)/speedOfLight);
	}

	// add object to system
	function addObject(name, radius, color) {
		if (radius < lowerBound){
			return false;
		}
		var x = radius * Math.cos(0) + centerOffset;
		var y = radius * Math.sin(0) + centerOffset;
		orbitingObjects.push({
			name: name,
			radius: radius,
			x: x,
			y: y,
			theta: 0,
			raphaelObj: paper.circle(x, y, 10).attr("fill", color).attr("stroke", color) //arbitrary size 10
		})
	}

});