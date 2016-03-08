var main = function(){
	'use strict';
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var canvasDim = 800;
	var offset = canvasDim / 2;

	var interval = 10;

	// center mass settings
	var centerMass = 5000000000;

	//constants
	var gravitationalConstant =  6.674 * Math.pow(10, -11);
	var speedOfLight = 299792458;
	var lowerBound = (3 * centerMass * gravitationalConstant) / (speedOfLight ^ 2);

    var referenceTime = 0;

	// orbiting masses
	var orbitingMasses = [];

	addMass('earth', 150, "blue"); //debug
	addMass('mars', 200, "red"); //debug

    var orbitalDetails = "";

	setInterval(function(){ 

        referenceTime += interval;

		ctx.clearRect(0,0,canvasDim,canvasDim); // clear canvas

		//center mass
		ctx.save();
		ctx.shadowColor = '#000000';
		ctx.fillStyle = '#000000';
		ctx.shadowBlur = 40;
	    ctx.lineWidth = 0.5;
	    makeCircle(offset, offset, 50, 0, 2*Math.PI);
	    ctx.restore();


		orbitingMasses.forEach(function(mass) {
			var velocity = Math.sqrt(gravitationalConstant * centerMass / mass.radius);
			mass.theta = mass.theta + (velocity / mass.radius * interval);

			var objectX = mass.radius * Math.cos(mass.theta) + offset;
			var objectY = mass.radius * Math.sin(mass.theta) + offset;
			var color = 'blue';
			makeCircle(objectX, objectY, mass.size, mass.color);
		});

        orbitalDetails = '';
        $.each(orbitingMasses , function (index, value){
            //console.log(JSON.stringify(value));
            orbitalDetails += 'Relative ' + value.name + ' time: ' + calculateAge(centerMass, offset) + '<br>';
        });
		$(".planet .value").html(orbitalDetails);
		$(".reference .value").html(referenceTime);

	}, interval);

	function makeCircle(objectX, objectY, size,color) {
		//console.log(objectX, objectY);
		ctx.beginPath();
		ctx.arc(objectX,objectY,size,0,2*Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.stroke(); 
		ctx.closePath();
	}

	function calculateAge(mass, radius) {

        var relativeTime = referenceTime * Math.sqrt(1 - (3/2) * (1/radius) * (3 * gravitationalConstant * mass)/speedOfLight)

        return relativeTime;
	}

	function addMass(name, radius, color) {
		orbitingMasses.push({
			name: name,
			radius: radius,
			theta: 0,
			size: 10,
			color: color
		})
	}

};

$(document).ready(main);