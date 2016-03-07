var main = function(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

    //Black Hole settings
    var blackHoleMass = 500000;
    var referenceTime = 0;
    var interval = 10;

	//Earth orbit settings
	var eTheta = 0;
	var eOffset = 400;
	var earthPeriod = 500;
	var earthFreq = 1/earthPeriod;
	var earthRadius = 300;

	//Moon orbit settings
	var mTheta = 0;
	var mOffset = 20;
	var moonPeriod = 100;
	var moonFreq = 1/moonPeriod;
	var moonRadius = 40;
    
	//Asteroid orbit settings
	var aTheta = 0;
	var aOffset = 20;
	var asteroidPeriod = 10;
	var asteroidFreq = 1/asteroidPeriod;
	var asteroidRadius = 20;    

	setInterval(function(){ 

        referenceTime += interval;

		ctx.clearRect(0,0,800,800); // clear canvas

		//Sun
		ctx.save();
		ctx.shadowColor = '#000000';
		ctx.fillStyle = '#000000';
		ctx.shadowBlur = 40;
	    ctx.lineWidth = 0.5;
	    makeCircle(400,400, 50, 0, 2*Math.PI);
	    ctx.restore();

		//Orbit path
		ctx.beginPath();
		ctx.arc(eOffset,eOffset,300,0,2*Math.PI);
		ctx.stroke();
		ctx.closePath();
		
		//Earth
		eTheta += earthFreq;
		
		if(eTheta >= 2*Math.PI)
			eTheta = 0;
		
		var earthX = (earthRadius * Math.cos(eTheta)) + eOffset;
		var earthY = (earthRadius * Math.sin(eTheta)) + eOffset;
		
		makeCircle(earthX,earthY,15,"blue");
		
		//Moon
		mTheta += moonFreq;
		
		if(mTheta >= 2*Math.PI)
			mTheta = 0;

		var moonX = (moonRadius * Math.cos(mTheta)) + earthX;
		var moonY = (moonRadius * Math.sin(mTheta)) + earthY;

		makeCircle(moonX,moonY,5,"gray");

		//Asteroid
		aTheta += asteroidFreq;
		
		if(aTheta >= 2*Math.PI)
			aTheta = 0;

		var asteroidX = (asteroidRadius * Math.cos(aTheta)) + moonX;
		var asteroidY = (asteroidRadius * Math.sin(aTheta)) + moonY;

		makeCircle(asteroidX,asteroidY,5,"green");

		$(".planet .value").html(calculateAge(blackHoleMass, eOffset));
		$(".moon .value").html(calculateAge(blackHoleMass, eOffset));
		$(".asteroid .value").html(calculateAge(blackHoleMass, eOffset));


	}, interval);

	function makeCircle(earthX,earthY,earthRadius,color) {
		ctx.beginPath();
		ctx.arc(earthX,earthY,earthRadius,0,2*Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.stroke(); 
		ctx.closePath();
	}

	function calculateAge(mass, radius) {
        var speedOfLight = 299792458;
        var gravitationalConstant =  6.674 * Math.pow(10, -11);

        var relativeTime = referenceTime * Math.sqrt(1 - (3/2) * (1/radius) * (3 * gravitationalConstant * mass)/speedOfLight)

        return relativeTime;
	}


};

$(document).ready(main);