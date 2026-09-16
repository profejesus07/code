/* Genera el carnet visual como imagen PNG descargable, sin dependencias externas. */
(function () {
  "use strict";

  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(ctx, W, H, opts, avatarImg) {
    ctx.clearRect(0, 0, W, H);

    // Fondo blanco con borde dorado
    ctx.fillStyle = "#ffffff";
    roundRectPath(ctx, 4, 4, W - 8, H - 8, 26);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 4;
    roundRectPath(ctx, 4, 4, W - 8, H - 8, 26);
    ctx.stroke();

    // Header con degradado
    ctx.save();
    roundRectPath(ctx, 4, 4, W - 8, 118, 26);
    ctx.clip();
    var grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "#0f1729");
    grad.addColorStop(1, "#1c1436");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 130);
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "bold 27px Georgia, serif";
    ctx.fillText(opts.institNombre || "Academia C.O.D.E.", 32, 52);
    ctx.fillStyle = "#c9a227";
    ctx.font = "13px Arial, sans-serif";
    ctx.fillText((opts.institLema || "").toUpperCase(), 32, 80);

    // Avatar circular (recorta el cuadrado superior del retrato para encuadrar el rostro)
    var cx = 118, cy = 190, r = 66;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (avatarImg) {
      ctx.fillStyle = "#f0efe6";
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      var iw = avatarImg.naturalWidth || avatarImg.width;
      var ih = avatarImg.naturalHeight || avatarImg.height;
      var side = Math.min(iw, ih);
      var sx = ih >= iw ? 0 : (iw - side) / 2;
      var sy = 0;
      ctx.drawImage(avatarImg, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = "#3a4459";
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px Arial";
      ctx.textAlign = "center";
      ctx.fillText((opts.nombre || "?").charAt(0).toUpperCase(), cx, cy + 18);
      ctx.textAlign = "left";
    }
    ctx.restore();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Nombre y datos
    var tx = 214;
    ctx.fillStyle = "#10182c";
    ctx.font = "bold 29px Georgia, serif";
    ctx.fillText(opts.nombre || "", tx, 178);
    ctx.fillStyle = "#55607a";
    ctx.font = "17px Arial, sans-serif";
    ctx.fillText("Grado " + (opts.grado || "") + " · Grupo " + (opts.grupo || ""), tx, 206);

    // Insignia de rango
    var rangoTxt = "RANGO " + (opts.rango || "").toUpperCase();
    ctx.font = "bold 14px Arial, sans-serif";
    var rangoW = Math.max(160, ctx.measureText(rangoTxt).width + 40);
    ctx.fillStyle = "#10182c";
    roundRectPath(ctx, tx, 222, rangoW, 36, 18);
    ctx.fill();
    ctx.fillStyle = "#e8c874";
    ctx.textAlign = "center";
    ctx.fillText(rangoTxt, tx + rangoW / 2, 245);
    ctx.textAlign = "left";

    // Placa del código de acceso: credencial rectangular con ícono de candado
    ctx.fillStyle = "#9aa2b8";
    ctx.font = "12px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("CÓDIGO DE ACCESO INDIVIDUAL", W / 2, 307);

    var plateW = 320, plateH = 58, plateR = 14, plateX = W / 2 - plateW / 2, plateY = 318;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    var grad2 = ctx.createLinearGradient(plateX, 0, plateX + plateW, 0);
    grad2.addColorStop(0, "#0f1729");
    grad2.addColorStop(1, "#1c1436");
    ctx.fillStyle = grad2;
    roundRectPath(ctx, plateX, plateY, plateW, plateH, plateR);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2;
    roundRectPath(ctx, plateX, plateY, plateW, plateH, plateR);
    ctx.stroke();
    ctx.strokeStyle = "rgba(201,162,39,0.35)";
    ctx.lineWidth = 1;
    roundRectPath(ctx, plateX + 4, plateY + 4, plateW - 8, plateH - 8, plateR * 0.6);
    ctx.stroke();

    // Icono de candado
    var lockCx = plateX + 34, lockCy = plateY + plateH / 2;
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(lockCx, lockCy - 6, 9, Math.PI, 0, false);
    ctx.stroke();
    ctx.fillStyle = "#c9a227";
    roundRectPath(ctx, lockCx - 13, lockCy - 8, 26, 20, 4);
    ctx.fill();
    ctx.fillStyle = "#0f1729";
    ctx.beginPath();
    ctx.arc(lockCx, lockCy - 1, 3, 0, Math.PI * 2);
    ctx.fill();

    // Separador y código
    ctx.strokeStyle = "rgba(201,162,39,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plateX + 58, plateY + 10);
    ctx.lineTo(plateX + 58, plateY + plateH - 10);
    ctx.stroke();

    ctx.fillStyle = "#e8c874";
    ctx.font = "bold 26px 'Courier New', monospace";
    var codeCenterX = plateX + 58 + (plateW - 58) / 2;
    ctx.fillText(opts.codigo || "", codeCenterX, plateY + plateH / 2 + 9);
    ctx.textAlign = "left";
  }

  window.descargarCarnetImagen = function (opts) {
    var W = 800, H = 420;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    function finish(img) {
      draw(ctx, W, H, opts, img);
      var link = document.createElement("a");
      link.download = (opts.filename || "carnet") + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    if (opts.avatarSrc) {
      var img = new Image();
      img.onload = function () { finish(img); };
      img.onerror = function () { finish(null); };
      img.src = opts.avatarSrc;
    } else {
      finish(null);
    }
  };
})();
