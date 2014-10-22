window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

$(document).ready(function() {
  var canvas = $("#myCanvas");
  var context = canvas[0].getContext("2d");
  context.font = "bold 12px sans-serif";
  context.translate(canvas.width() / 2, canvas.height() / 2);

  var cookie = new Cookie(context, canvas[0]);

  CookieAnimator.start(canvas, context, cookie);
});

var CookieAnimator = (function() {
  var setUpPoke = function(canvas, context, cookie) {
    canvas.one("click", function() {
      cookie.pokeCookie();
      $.ajax({
        url: "http://fortunecookieapi.com/v1/cookie",
        crossDomain: true,
        success: function(result) {
          cookie.breakCookie();
          result = result[0];
          context.fillText(result.fortune.message, -canvas.width() / 4 + 25, -canvas.height() / 4 + 50);
          context.fillText(result.lesson.english + ", " + result.lesson.chinese +
            ", " +
            result.lesson.pronunciation, -canvas.width() / 4 + 25, -canvas.height() / 4 + 70);
          context.fillText("Lucky numbers: " + result.lotto.numbers.join(" "), -canvas.width() / 4 + 25, -canvas.height() / 4 + 90);
        },
        error: function(xhr) {
          // deal with this later
        },
        complete: function() {
          setUpReset(canvas, context, cookie);
        }
      });
    });
  };

  var setUpReset = function(canvas, context, cookie) {
    context.fillText("Click to reset...", -canvas.width() / 4 + 50, canvas.height() / 2);

    canvas.one("click", function() {
      cookie.reset();
      setUpPoke(canvas, context, cookie);
    });
  };

  return {
    start: setUpPoke
  };
})();

var CookieHalf = function(srcUrl, xPos, yPos, context) {
  this.x = xPos;
  this.y = yPos;
  this.context = context;

  this.image = new Image();
  this.image.src = srcUrl;

  var that = this;
  this.image.onload = function() {
    context.drawImage(that.image, that.x, that.y);
  };
}

CookieHalf.prototype = {
  getX: function() {
    return this.x;
  },
  getY: function() {
    return this.y;
  },
  getImage: function() {
    return this.image;
  }
}

var Cookie = function(context, canvas) {
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  this.context = context;
  this.rotation = 0;
  this.shouldAnimate = false;
  this.reset();
};

Cookie.prototype = {
  reset: function() {
    this.context.clearRect(-this.canvasWidth / 2, -this.canvasHeight / 2, this.canvasWidth, this.canvasHeight);
    this.left = new CookieHalf("fortune_cookie_left.png", -this.canvasWidth / 4, -this.canvasHeight / 4, this.context);
    this.right = new CookieHalf("fortune_cookie_right.png", -this.canvasWidth / 4 + this.left.getImage().width - 19, -this.canvasHeight / 4 + 1, this.context);
  },

  breakCookie: function() {
    this.shouldAnimate = false;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.rotate(-this.rotation);
    this.rotation = 0;
  },

  shakeCookie: function(startTime) {
    if (this.shouldAnimate) {
      var time = (new Date()).getTime() - startTime;
      if ((time / 10) > 1) {
        this.rotation += .1;
        this.context.clearRect(-this.canvasWidth / 2, -this.canvasHeight / 2, this.canvasWidth, this.canvasHeight);
        this.context.rotate(.1);
        this.context.drawImage(this.left.getImage(), 0, 0);
        this.context.drawImage(this.right.getImage(), this.left.getImage().width - 18, 1);
        startTime = time
      }

      var that = this;
      requestAnimFrame(function() {
        that.shakeCookie(startTime);
      });
    }
  },

  pokeCookie: function() {
    this.shouldAnimate = true;
    this.shakeCookie((new Date()).getTime());
  }
};