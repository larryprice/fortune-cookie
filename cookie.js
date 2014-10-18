$(document).ready(function () {
  var canvas = $("#myCanvas");
  var context = canvas[0].getContext("2d");
  context.font = "bold 12px sans-serif";
  var left = new Image();
  left.src = "fortune_cookie_left.png";
  left.onload = function () {
    context.drawImage(left, 0, 0);
  };
  var right = new Image();
  right.src = "fortune_cookie_right.png";
  right.onload = function () {
    context.drawImage(right, left.width - 18, 1);
  };

  canvas.on("click", function () {
    $.ajax({
      url: "http://fortunecookieapi.com/v1/cookie",
      crossDomain: true,
      success: function (result) {
        context.clearRect(0, 0, canvas.width(), canvas.height());
        result = result[0];
        context.fillText(result.fortune.message, 100, 100);
        context.fillText(result.lesson.english + ", " + result.lesson.chinese +
          ", " +
          result.lesson.pronunciation, 100, 120);
        context.fillText("Lucky numbers: " + result.lotto.numbers.join(" "), 100,
          140);
      }
    });
  });
});