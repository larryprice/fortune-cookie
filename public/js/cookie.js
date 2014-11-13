window.requestAnimFrame = (function (callback) {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var leftImageWidth = 144;
var rightImageWidth = 174;

$(document).ready(function () {
  var canvas = $("#myCanvas");
  var context = canvas[0].getContext("2d");
  context.font = "bold 12px sans-serif";
  context.translate(canvas.width() / 2, canvas.height() / 2);

  var cookie = new Cookie(context, canvas[0]);

  CookieAnimator.start(canvas, context, cookie);
});

var CookieAnimator = (function () {
  var setUpPoke = function (canvas, context, cookie) {
    canvas.one("click", function () {
      cookie.pokeCookie()
      $.ajax({
        url: "http://fortunecookieapi.com/v1/cookie",
        crossDomain: true,
        success: function (result) {
          $(cookie.breakCookie()).one("break", function () {
            this.context.clearRect(-this.canvasWidth / 2, -this.canvasHeight /
              2, this.canvasWidth, this.canvasHeight);
            result = result[0];

            var maxWidth = canvas.width() / 2 + 50;
            var leftTab = -canvas.width() / 4 + 10;
            var lastYPosition = wrapText(context, result.fortune.message, leftTab, -canvas.height() /
              4 + 50, maxWidth);

            lastYPosition = wrapText(context, result.lesson.english + ", " + result.lesson.chinese +
              ", " + result.lesson.pronunciation,
              leftTab, lastYPosition + 20, maxWidth);

            context.fillText("Lucky numbers: " + result.lotto.numbers.join(" "), leftTab,
              lastYPosition + 20);
            setUpReset(canvas, context, cookie);
          });
        },
        error: function (xhr) {
          setUpReset(canvas, context, cookie);
        }
      });
    });
  };

  var setUpReset = function (canvas, context, cookie) {
    context.fillText("Click to reset...", -canvas.width() / 4 + 50, canvas.height() /
      2);

    canvas.one("click", function () {
      cookie.reset();
      setUpPoke(canvas, context, cookie);
    });
  };

  var wrapText = function (context, text, x, y, maxWidth) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += 16;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    return y;
  };

  return {
    start: setUpPoke
  };
})();

var CookieHalf = function (srcUrl, xPos, yPos, context) {
  this.x = xPos;
  this.y = yPos;
  this.context = context;

  this.image = new Image();
  this.image.src = srcUrl;

  var that = this;
  this.image.onload = function () {
    context.drawImage(that.image, that.x, that.y);
  };
}

CookieHalf.prototype = {
  getX: function () {
    return this.x;
  },
  getY: function () {
    return this.y;
  },
  getImage: function () {
    return this.image;
  },
  move: function (x, y) {
    x = x || 0;
    y = y || 0;
    this.x += x;
    this.y += y;
    this.context.drawImage(this.image, this.x, this.y);
  }
}

var Cookie = function (context, canvas) {
  this.canvasWidth = canvas.width;
  this.canvasHeight = canvas.height;
  this.context = context;
  // this.rotation = 0;
  this.timesShaken = 0;
  this.shouldAnimate = false;
  this.reset();
};

Cookie.prototype = {
  reset: function () {
    this.context.clearRect(-this.canvasWidth / 2, -this.canvasHeight / 2, this.canvasWidth,
      this.canvasHeight);
    this.left = new CookieHalf("/images/fortune_cookie_left.png", -this.canvasWidth / 4, -this.canvasHeight /
      4, this.context);
    this.right = new CookieHalf("/images/fortune_cookie_right.png", -this.canvasWidth / 4 +
      leftImageWidth - 19, -this.canvasHeight / 4 + 1, this.context);
    return this;
  },

  breakCookie: function () {
    this.shouldAnimate = false;
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // this.context.rotate(-this.rotation);
    // this.rotation = 0;

    if (this.timesShaken > 100) {
      $(this).trigger("break");
    }

    return this;
  },

  shakeCookie: function (startTime) {
    if (this.shouldAnimate || this.timesShaken < 100) {
      var time = (new Date()).getTime() - startTime;
      if ((time / 10) > 1) {
        // this.rotation += .1;
        this.context.clearRect(-this.canvasWidth / 2, -this.canvasHeight / 2, this.canvasWidth,
          this.canvasHeight);
        // this.context.rotate(.1);
        this.left.move(this.movement);
        this.right.move(this.movement);
        // this.context.drawImage(this.left.getImage(), 0, 0);
        // this.context.drawImage(this.right.getImage(), this.left.getImage().width - 18, 1);
        startTime = time;
        ++this.timesShaken;
        if (this.timesShaken % 10 === 0) {
          this.movement = this.movement * -1;
        }
      }

      var that = this;
      requestAnimFrame(function () {
        that.shakeCookie(startTime);
      });
    } else if (!this.hasBroken) {
      $(this).trigger("break");
    }

    return this;
  },

  pokeCookie: function () {
    this.shouldAnimate = true;
    this.timesShaken = -5;
    this.movement = -1;
    this.shakeCookie((new Date()).getTime());
    this.hasBroken = false;
    return this;
  }
};