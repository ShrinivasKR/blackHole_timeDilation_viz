/**
 * Created by rohana on 3/9/16.
 */

$(function() {
	'use strict';
	// setup constants
	var canvasX = 250;
	var canvasY = 0;
	var canvasWidth = $(document).width() - (2 * $('#sidebar').width());
	var canvasHeight = $(document).height();
	var centerYOffset = canvasHeight / 2;
	var centerXOffset = canvasWidth / 2;
	const interval = 3; // DO NOT MODIFY THIS ONE
	var animationState = 1; // 1 for play
	var referenceTime = 0;
	var paper = Raphael(canvasX, canvasY, canvasWidth, canvasHeight);

	// center object mass settings
	var centerObjectMass = 5000000000;
	var centerObjectSize = 10; //arbitrary

	// physical constants and constraints
	var gravitationalConstant =  6.674 * Math.pow(10, -11);
	var speedOfLight = 299792458;
	var lowerBound = (3 * centerObjectMass * gravitationalConstant) / (speedOfLight ^ 2);

	// orbiting objects
	var orbitingObjects = [];
	addObject('earth', 150, "blue"); //debug
	addObject('mars', 200, "red"); //debug

	// center mass/black hole
	var centerObject = paper.circle(centerXOffset, centerYOffset, centerObjectSize);
	centerObject.attr("fill", "#000").attr("stroke", "#000");

	// initialize movement
	movePlanets();

	function movePlanets(){
		var timePassed = interval * animationState;
		referenceTime += timePassed;
		$('#center_mass').text(centerObjectMass);
		$('#reference').text(referenceTime);

		orbitingObjects.forEach(function(object) {
			var velocity = Math.sqrt(gravitationalConstant * centerObjectMass / object.radius);
			object.theta = object.theta + (velocity / object.radius * timePassed);
			object.x = object.radius * Math.cos(object.theta);
			object.y = object.radius * Math.sin(object.theta);
			object.raphaelObj.transform('t' + object.x + ',' + object.y);

			var amountAhead = referenceTime - calculateAge(centerObjectMass, object.radius);

			var timeSelector = $("#" + object.name);
			if (!timeSelector.length) {
				$("#relativeTimes").append("<p>" + object.name + " is  ahead by: <span id=" + object.name + "></span></p>")
			}
			timeSelector.text(amountAhead)
		});

		if (animationState) { // if animationState is 0, break to save memory
			setTimeout(function () {
				movePlanets();
			}, interval);
		} //else {console.log('failings')} // debug code
	}

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
		var x = centerXOffset;
		var y = centerYOffset;
		orbitingObjects.push({
			name: name,
			radius: radius,
			x: x,
			y: y,
			theta: 0,
			raphaelObj: paper.circle(x, y, 10).attr("fill", color).attr("stroke", color) //arbitrary size 10
		});
	}

	$('#button_stop').click(function(){
		console.log("restart invoked.");
		orbitingObjects.forEach(function(d) {
			d.theta = 0;
		});
		animationState = 0;
		referenceTime = 0;
		// code to reset
	});

	$('#button_pause').click(function() {
		console.log("pause invoked.");
		animationState = 0;
	});

	$('#button_play').click(function() {
		console.log("play invoked. " + animationState);
		var lastState = animationState;
		animationState = 1;
		if (lastState === 0) {
			movePlanets();
		}
	});

	$('#button_fw').click(function(){
		console.log("button forward invoked.");
		var lastState = animationState;
		animationState = 2;
		if (lastState === 0) {
			movePlanets();
		}
	});

	$('#button_ffw').click(function(){
		console.log("button fast forward invoked.");
		var lastState = animationState;
		animationState = 4;
		if (lastState === 0) {
			movePlanets();
		}
	});

	$('#increase_mass').click(function() {
		console.log("increasing mass");
		centerObjectMass = centerObjectMass * 2
	});

	$('#decrease_mass').click(function() {
		console.log("increasing mass");
		if (centerObjectMass > 250000000) {
			centerObjectMass = centerObjectMass / 2
		}
	});

    $( "#addParticleButton" ).click(function() {
		var particleName = $('#particleName').val();
		var particleRadius = $('#particleRadius').val();
		var particleColor = $('#particleColor').val();
        console.log("Adding Particle of Name: " + particleName + " Radius: " + particleRadius
			+ " Color: " + particleColor);
		if (particleName && particleColor && particleRadius) {
			addObject(particleName, particleRadius, particleColor)
		}
    });
});