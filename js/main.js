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

  window.onscroll = function() {

    content1InVP.change($("#content-1").isOnScreen(1, 1), function() {

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