(function () {
  var canvas = document.getElementById("matrix-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var chars = "アカデミアCODEｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ0123456789#$%&HACKRB01";
  var fontSize = 15;
  var columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(0).map(function () {
      return Math.floor(Math.random() * -40);
    });
  }
  window.addEventListener("resize", resize);
  resize();

  function draw() {
    ctx.fillStyle = "rgba(1, 6, 4, 0.10)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + "px monospace";
    for (var i = 0; i < drops.length; i++) {
      var text = chars.charAt(Math.floor(Math.random() * chars.length));
      var x = i * fontSize;
      var y = drops[i] * fontSize;

      var isHead = Math.random() > 0.92;
      ctx.fillStyle = isHead ? "#c9ffd9" : "#39ff6a";
      ctx.globalAlpha = isHead ? 0.95 : 0.55;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 45);
})();
