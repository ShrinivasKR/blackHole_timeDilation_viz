$.fn.isOnScreen = function(x, y) {

  if (x == null || typeof x == 'undefined') x = 1;
  if (y == null || typeof y == 'undefined') y = 1;

  var win = $(window);

  var viewport = {
    top: win.scrollTop(),
    left: win.scrollLeft()
  };
  viewport.right = viewport.left + win.width();
  viewport.bottom = viewport.top + win.height();

  var height = this.outerHeight();
  var width = this.outerWidth();

  if (!width || !height) {
    return false;
  }

  var bounds = this.offset();
  bounds.right = bounds.left + width;
  bounds.bottom = bounds.top + height;

  var visible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

  if (!visible) {
    return false;
  }

  var deltas = {
    top: Math.min(1, (bounds.bottom - viewport.top) / height),
    bottom: Math.min(1, (viewport.bottom - bounds.top) / height),
    left: Math.min(1, (bounds.right - viewport.left) / width),
    right: Math.min(1, (viewport.right - bounds.left) / width)
  };

  return (deltas.left * deltas.right) >= x && (deltas.top * deltas.bottom) >= y;

};



var fullWindowWrapper = (function() {
  $(".full-wrapper").css({
    width: window.innerWidth,
    height: window.innerHeight

  });
  window.onresize = function() {
    $(".full-wrapper").css({
      width: window.innerWidth,
      height: window.innerHeight

    });
  }
});

var blackHoleSimulation = (function() {
  // Global Animation Setting
  window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };

  // Global Canvas Setting
  var canvas = document.getElementById('particle');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Particles Around the Parent
  function Particle(x, y, distance) {
    this.angle = Math.random() * 2 * Math.PI;
    this.radius = Math.random();
    this.opacity = (Math.random() * 5 + 2) / 10;
    this.distance = (1 / this.opacity) * distance;
    this.speed = this.distance * 0.00003;

    this.position = {
      x: x + this.distance * Math.cos(this.angle),
      y: y + this.distance * Math.sin(this.angle)
    };

    this.draw = function() {
      ctx.fillStyle = "rgba(255,255,255," + this.opacity + ")";
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    }
    this.update = function() {
      this.angle += this.speed;
      this.position = {
        x: x + this.distance * Math.cos(this.angle),
        y: y + this.distance * Math.sin(this.angle)
      };
      this.draw();
    }
  }

  function Emitter(x, y) {
    this.position = {
      x: x,
      y: y
    };
    this.radius = 30;
    this.count = 3000;
    this.particles = [];

    for (var i = 0; i < this.count; i++) {
      this.particles.push(new Particle(this.position.x, this.position.y, this.radius));
    }
  }


  Emitter.prototype = {
    draw: function() {
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    },
    update: function() {
      for (var i = 0; i < this.count; i++) {
        this.particles[i].update();
      }
      this.draw();
    }
  }


  var emitter = new Emitter(canvas.width / 2, canvas.height / 2);

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    emitter.update();
    requestAnimFrame(loop);
  }

  loop();
})

var gravitySimulation = (function() {

  var Gravity = function(max) {

    var transparent,
      renderType;

    if (this.webglAvailable()) {
      transparent = false;
      renderType = Phaser.WEBGL;
    } else {
      transparent = true;
      renderType = Phaser.CANVAS;
    }

    this.$window = $(window);
    this.width = this.$window.width();
    this.height = this.$window.height();

    this.game = new Phaser.Game(
      this.width, //Canvas Size
      this.height, //Canvas Size
      renderType, //Renderer
      'gravitySimulationContainer', //DOM ID
      {
        preload: this.preload.bind(this),
        create: this.create.bind(this),
        update: this.update.bind(this),
        render: this.render.bind(this)
      },
      transparent, //transparent
      false //antialias
    );

    this.div = document.getElementById('gravitySimulationContainer');
    this.$canvas = $('canvas');
    this.canvas = this.$canvas.get(0);
    this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;

    this.h = Math.random();
    this.s = 0.5;
    this.l = 0.66;

    this.color = new THREE.Color();

    this.screenLength = Math.sqrt(this.game.width * this.game.width + this.game.height * this.game.height);

    this.fireDirection = new Phaser.Point();
    this.fireTheta = Math.PI * 1.7;
    this.fireStrength = this.screenLength / 17;

    this.maxFire = max;
    this.fireRate = 24000 / this.maxFire;
    this.nextFire = 0;

    this.collisionGroups = null;

    //this.addStats();
  };

  Gravity.prototype = {

    preload: function() {

      this.game.load.image('arrow', 'img/arrow.png');
      this.game.load.image('black-hole', 'img/black-hole.png');

    },

    create: function() {
      this.game.stage.backgroundColor = '#404040';
      this.blackHole = this.game.add.sprite(100, 100, 'black-hole');
      this.blackHole.anchor.setTo(0.5, 0.5);
      this.blackHole.x = this.game.width / 2;
      this.blackHole.y = this.game.height / 2;
      this.blackHole.blendMode = PIXI.blendModes.MULTIPLY;

      this.createPhysics();
      this.createBullets();
    },

    createPhysics: function() {
      this.game.physics.startSystem(Phaser.Physics.P2JS);
      this.game.physics.p2.setImpactEvents(true);
      this.game.physics.p2.defaultRestitution = 0;
      this.game.physics.p2.defaultFriction = 0.5;
      this.game.physics.p2.contactMaterial.relaxation = 2;

      this.collisionGroups = {
        walls: this.game.physics.p2.createCollisionGroup(),
        bullets: this.game.physics.p2.createCollisionGroup(),
        planets: this.game.physics.p2.createCollisionGroup(),
        goals: this.game.physics.p2.createCollisionGroup()
      };
      this.game.physics.p2.updateBoundsCollisionGroup();

    },

    createBullets: function() {

      this.bullets = this.game.add.spriteBatch();
      this.bullets.enableBody = true;
      this.bullets.physicsBodyType = Phaser.Physics.P2JS;
      this.bullets.enableBodyDebug = true;

      var i = this.maxFire,
        bullet;

      while (i--) {
        bullet = this.bullets.create(50, 50, 'arrow');
        bullet.anchor.setTo(0.5, 0.5);
        bullet.planetPointer = new Phaser.Point();

        bullet.kill();
        bullet.body.collideWorldBounds = false;
        bullet.body.fixedRotation = true;
        //bullet.checkWorldBounds = true;
        //bullet.outOfBoundsKill = true;
        bullet.body.clearCollision(true);
        bullet.body.setCollisionGroup(this.collisionGroups.bullets);
        bullet.body.collides([]);
        bullet.scale.x = 0.3;
        bullet.scale.y = 0.3;

        bullet.blendMode = PIXI.blendModes.ADD;
      }

    },

    fire: function() {

      var bullet, random;

      if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {

        this.nextFire = this.game.time.now + this.fireRate;

        bullet = this.bullets.getFirstDead();
        bullet.reset(
          this.game.width / 4 + 100 * Math.random() - 50,
          3 * this.game.height / 4 + 100 * Math.random() - 50
        );
        bullet.px = bullet.x;
        bullet.py = bullet.y;

        bullet.reset(
          this.game.width / 4,
          3 * this.game.height / 4
        );

        bullet.body.moveRight(this.fireStrength * Math.cos(this.fireTheta));
        bullet.body.moveUp(this.fireStrength * Math.sin(this.fireTheta));
        //bullet.body.moveRight(  this.fireStrength * Math.cos( this.fireTheta ) + Math.random() * 1 );
        //bullet.body.moveUp(   this.fireStrength * Math.sin( this.fireTheta ) + Math.random() * 1 );
        this.h += .01;

        this.fireTheta += Math.PI / 1000;
      }



    },

    update: function() {
      this.fire();
      this.killOutOfBounds();
      this.attractGravity();
    },

    killOutOfBounds: function() {
      var bullet,
        i = this.bullets.children.length,
        bounds = this.game.world.bounds;

      while (i--) {
        bullet = this.bullets.children[i];

        if (
          bullet.alive &&
          bullet.x + 20 < bounds.left ||
          bullet.y + 20 < bounds.top ||
          bullet.x - 20 > bounds.right ||
          bullet.y - 20 > bounds.bottom
        ) {
          bullet.kill();
        }
      }
    },

    attractGravity: function() {
      var i = this.bullets.children.length,
        denominator,
        //      gravity = 30000,
        gravity = this.width * this.height / 30,
        speed;

      while (i--) {

        bullet = this.bullets.children[i];

        if (bullet.alive) {
          bullet.planetPointer.set(
            this.game.world.bounds.halfWidth - bullet.x,
            this.game.world.bounds.halfHeight - bullet.y
          );

          denominator = Math.pow(this.game.world.bounds.halfWidth - bullet.x, 2) +
            Math.pow(this.game.world.bounds.halfHeight - bullet.y, 2);

          bullet.planetPointer.normalize();

          speed = gravity / denominator;

          bullet.planetPointer.x *= speed;
          bullet.planetPointer.y *= speed;

          bullet.body.data.velocity[0] += bullet.body.world.pxmi(bullet.planetPointer.x);
          bullet.body.data.velocity[1] += bullet.body.world.pxmi(bullet.planetPointer.y);

          bullet.rotation = Math.atan2(bullet.y - bullet.py, bullet.x - bullet.px);

          bullet.px = bullet.x;
          bullet.py = bullet.y;

        }
      }
    },

    render: function() {

    },

    addStats: function() {
      this.stats = new Stats();
      this.stats.domElement.style.position = 'absolute';
      this.stats.domElement.style.top = '0px';
      $("#container").append(this.stats.domElement);
    },

    webglAvailable: function() {
      // Copied from PIXI, copied from mr doob
      try {
        var canvas = document.createElement('canvas');
        return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    }

  };

  gravity = new Gravity(300);

});
var timeDilationSimulations = (function() {


  // setup constants
  var canvasX = 250;
  var canvasY = 0;
  var canvasWidth = 600;
  var canvasHeight = 500;
  var centerYOffset = canvasHeight / 2;
  var centerXOffset = canvasWidth / 2;
  const interval = 3; // DO NOT MODIFY THIS ONE
  var animationState = 1; // 1 for play
  var referenceTime = 0;

  var paper = Raphael(document.getElementById('timeDilationSimulationContainer'), canvasWidth, canvasHeight);

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
        $("#relativeTimes").append("<p>" + object.name + " has experienced <span id=" + object.name + "></span> less time that the center mass</p>")
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
actionsInViewports = (function() {

  function inViewportOnceObj() {

    this.value = false;

    this.change = function(_value, onCallback, offCallback) {
      if (this.value != _value) {
        this.value = _value;
        if (this.value) {

          onCallback();

        } else {

          offCallback();

        }
      }
    }

  }

  var content1InVP = new inViewportOnceObj();
  var content5InVp = new inViewportOnceObj();


  window.onscroll = function() {

    content1InVP.change(verge.inY($("#content-1"), -verge.viewportH() / 2), function() {
      TweenMax.to($("#content-1 .bg-background"), 2, {
        backgroundColor: "rgba(0, 0, 0, " + 0.6 + ")",
        force3D: true,
        ease: Power3.easeOut
      });

    }, function() {
      TweenMax.to($("#content-1 .bg-background"), 2, {
        backgroundColor: "rgba(0, 0, 0, " + 0 + ")",
        force3D: true,
        ease: Power3.easeOut
      });

    });



  }



});



fullWindowWrapper();
actionsInViewports();
blackHoleSimulation();
gravitySimulation();
timeDilationSimulations();
