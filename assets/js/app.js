(function () {
  "use strict";

  var DATA = window.ACADEMIA_DATA || null;
  var STORAGE_KEY = "academia_code_session";

  var screens = {
    boot: document.getElementById("screen-boot"),
    login: document.getElementById("screen-login"),
    dashboard: document.getElementById("screen-dashboard"),
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      if (!screens[key]) return;
      screens[key].classList.toggle("active", key === name);
    });
  }

  function institucionNombre() {
    return (DATA && DATA.institucion && DATA.institucion.nombre) || "Academia C.O.D.E.";
  }
  function institucionLema() {
    return (DATA && DATA.institucion && DATA.institucion.lema) || "Operación: Liberación Mental";
  }

  /* ---------------- Boot sequence ---------------- */
  var bootLines = [
    { text: "&gt; INICIANDO TERMINAL DE ACCESO — " + institucionNombre().toUpperCase(), cls: "line-dim" },
    { text: "&gt; CONECTANDO A LA RED NEURONAL SEGURA...", cls: "line-dim" },
    { text: "[OK] CONEXIÓN ESTABLECIDA.", cls: "line-ok" },
    { text: "&gt; ESCANEANDO PRESENCIA DE N.E.U.R.O.N. EN EL SECTOR...", cls: "line-dim" },
    { text: "[OK] CORTAFUEGOS DE LA RESISTENCIA ACTIVO.", cls: "line-ok" },
    { text: "&gt; CARGANDO PROTOCOLO DE IDENTIFICACIÓN HACKER...", cls: "line-dim" },
    { text: "[LISTO] INGRESA TU CÓDIGO DE ACCESO PARA CONTINUAR.", cls: "line-warn" },
  ];

  function runBoot(onDone) {
    var log = document.getElementById("boot-log");
    if (!log) return onDone();
    log.innerHTML = "";
    var i = 0;

    function nextLine() {
      if (i >= bootLines.length) {
        setTimeout(onDone, 400);
        return;
      }
      var div = document.createElement("div");
      div.className = bootLines[i].cls;
      log.appendChild(div);
      typeText(div, bootLines[i].text, function () {
        i++;
        setTimeout(nextLine, 220);
      });
    }
    nextLine();
  }

  function typeText(el, html, onDone) {
    // Simple char-by-char reveal supporting basic entities like &gt;
    var raw = html;
    var plain = raw.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
    var idx = 0;
    el.textContent = "";
    var cursor = document.createElement("span");
    cursor.className = "cursor-blink";
    el.appendChild(cursor);

    var interval = setInterval(function () {
      idx++;
      el.textContent = plain.slice(0, idx);
      el.appendChild(cursor);
      if (idx >= plain.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 12);
  }

  /* ---------------- Login ---------------- */
  function findStudent(code) {
    if (!DATA || !DATA.estudiantes) return null;
    var normalized = (code || "").trim().toUpperCase();
    if (!normalized) return null;
    return DATA.estudiantes.find(function (s) {
      return (s.codigo || "").toUpperCase() === normalized;
    }) || null;
  }

  function initLogin() {
    var input = document.getElementById("code-input");
    var btn = document.getElementById("btn-login");
    var errorBox = document.getElementById("login-error");
    var noDataBox = document.getElementById("no-data-note");

    var hasStudents = DATA && DATA.estudiantes && DATA.estudiantes.length > 0;
    if (!hasStudents) {
      if (noDataBox) noDataBox.hidden = false;
      if (btn) btn.disabled = true;
      if (input) input.disabled = true;
      return;
    }

    function attempt() {
      var student = findStudent(input.value);
      if (student) {
        errorBox.hidden = true;
        sessionStorage.setItem(STORAGE_KEY, student.codigo);
        enterDashboard(student);
      } else {
        errorBox.hidden = false;
        errorBox.classList.remove("shake");
        void errorBox.offsetWidth;
        errorBox.classList.add("shake");
      }
    }

    btn.addEventListener("click", attempt);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") attempt();
    });
    setTimeout(function () { input.focus(); }, 100);
  }

  /* ---------------- Dashboard ---------------- */
  function avatarSrc(student) {
    if (!student.avatar) return null;
    var sub = student.genero === "M" ? "masculino" : "femenino";
    return "avatars/" + sub + "/" + student.avatar;
  }

  function animateCount(el, target) {
    var duration = 900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function renderPerfil(student) {
    var wrap = document.getElementById("panel-perfil");
    var siguiente = student.rango_siguiente
      ? "Próximo rango: <strong>" + student.rango_siguiente.nombre + "</strong> a " +
        student.rango_siguiente.acumulado_requerido + " RB acumulados."
      : "Has alcanzado el rango máximo de la Resistencia.";
    var src = avatarSrc(student);
    wrap.innerHTML =
      '<div class="perfil-avatar-wrap">' +
      (src
        ? '<img class="perfil-avatar-grande" src="' + src + '" alt="Avatar de ' + student.nombre + '">'
        : '<div class="perfil-avatar-grande perfil-avatar-fallback">' + student.nombre.charAt(0).toUpperCase() + '</div>') +
      '</div>' +
      "<p style=\"color:var(--text-dim)\">" + (student.rango_actual.hito || "") + "</p>" +
      "<p>" + siguiente + "</p>" +
      "<p>RitaBits disponibles para la Tienda C.O.D.E.: <strong style=\"color:var(--cyan)\">" +
      student.rb_disponibles + " RB</strong></p>" +
      "<p>Posición en el ranking: <strong style=\"color:var(--amber)\">#" + student.posicion + "</strong></p>";
  }

  function renderAvatares(student) {
    var wrap = document.getElementById("panel-avatares");
    var progresion = DATA.avatar_progresion || [];
    if (progresion.length === 0) {
      wrap.innerHTML = '<div class="empty-note">La progresión de avatares aún no está disponible.</div>';
      return;
    }
    var owned = student.avatares_desbloqueados || ["aprendiz"];
    var sub = student.genero === "M" ? "masculino" : "femenino";
    var html = '<p style="color:var(--text-dim);margin-bottom:14px">' +
      'Desbloquea tus avatares en orden comprándolos con tus RitaBits desde tu cuenta de estudiante.</p>' +
      '<div class="album-grid">';
    progresion.forEach(function (step) {
      var isOwned = owned.indexOf(step.clave) !== -1;
      var isEquipped = student.avatar_equipado_clave === step.clave;
      var archivo = student.genero === "M" ? step.archivo_m : step.archivo_f;
      var src = "avatars/" + sub + "/" + archivo;
      var cls = "album-card avatar-card " + (isOwned ? "owned" : "locked") + (isEquipped ? " equipped" : "");
      html += '<div class="' + cls + '">' +
        (isOwned ? "" : '<span class="lock-tag">🔒</span>') +
        '<img src="' + src + '" alt="' + step.nombre + '">' +
        '<div class="album-name">' + step.nombre + '</div>' +
        (isEquipped
          ? '<div class="album-cat" style="color:var(--cyan);border-color:var(--cyan)">EQUIPADO</div>'
          : isOwned
            ? '<div class="album-cat" style="color:var(--green);border-color:var(--green)">DESBLOQUEADO</div>'
            : '<div class="album-cost">' + step.costo_rb + ' RB</div>') +
        '</div>';
    });
    html += '</div>';
    wrap.innerHTML = html;
  }

  function renderAlbum(student) {
    var wrap = document.getElementById("panel-album");
    var catalogo = DATA.catalogo || [];
    if (catalogo.length === 0) {
      wrap.innerHTML = '<div class="empty-note">El catálogo de objetos aún no está disponible.</div>';
      return;
    }
    var ownedIds = (student.coleccionables || []).map(function (c) { return c.collectible_id; });
    var iconMap = { Bronce: "◈", Plata: "◆", Oro: "★" };
    var tierClass = { Bronce: "tier-bronce", Plata: "tier-plata", Oro: "tier-oro" };
    var html = '<p style="color:var(--text-dim);margin-bottom:14px">' +
      'Objetos de la Tienda C.O.D.E. adquiridos comprándolos en orden desde tu cuenta.</p>' +
      '<div class="album-grid">';
    catalogo.forEach(function (item) {
      var unlocked = ownedIds.indexOf(item.id) !== -1;
      var cls = "album-card " + (tierClass[item.categoria] || "") + (unlocked ? " owned" : " locked");
      var media = item.imagen
        ? '<img src="assets/collectibles/' + item.imagen + '" alt="' + item.nombre + '" ' +
          'style="width:100%;aspect-ratio:1;object-fit:contain;margin-bottom:6px;' + (unlocked ? "" : "filter:grayscale(1);opacity:0.55;") + '">'
        : '<div class="album-icon">' + (iconMap[item.categoria] || "◈") + '</div>';
      html += '<div class="' + cls + '">' +
        (unlocked ? "" : '<span class="lock-tag">🔒</span>') +
        media +
        '<div class="album-name">' + item.nombre + '</div>' +
        '<div class="album-cat">' + item.categoria + '</div>' +
        '<div class="album-cost">' + item.costo_rb + ' RB</div>' +
        '</div>';
    });
    html += '</div>';
    wrap.innerHTML = html;
  }

  function computeStats(hist) {
    var n = hist.length;
    if (n === 0) return null;
    var sum = function (key) { return hist.reduce(function (a, h) { return a + h[key]; }, 0); };
    var dist = { Bajo: 0, "Básico": 0, Alto: 0, Superior: 0 };
    hist.forEach(function (h) {
      if (h.nota_final >= 9) dist.Superior++;
      else if (h.nota_final >= 8) dist.Alto++;
      else if (h.nota_final >= 7) dist["Básico"]++;
      else dist.Bajo++;
    });
    return {
      n: n, dist: dist,
      avgNota: sum("nota_final") / n, avgTaller: sum("taller") / n,
      avgGami: sum("gamificacion") / n, avgBita: sum("bitacora") / n,
    };
  }

  function periodOptionsHtml(periodos) {
    return '<option value="">Global (todos los periodos)</option>' +
      periodos.map(function (p) { return '<option value="' + p + '">Periodo ' + p + '</option>'; }).join("");
  }

  function renderEstadisticas(student) {
    var wrap = document.getElementById("panel-estadisticas");
    var allHist = student.historial || [];
    var periodos = Array.from(new Set(allHist.map(function (h) { return h.periodo; }))).sort();

    function draw(periodo) {
      var hist = periodo ? allHist.filter(function (h) { return h.periodo === periodo; }) : allHist;
      var stats = computeStats(hist);
      var body;
      if (!stats) {
        body = '<div class="empty-note">Aún no hay calificaciones' + (periodo ? " en este periodo" : "") + '.</div>';
      } else {
        var totalStudents = (DATA.ranking || []).length;
        var percentil = (!periodo && totalStudents > 0)
          ? Math.round((1 - (student.posicion - 1) / totalStudents) * 100) : null;

        body = '<div class="stats-summary-grid">' +
          '<div class="stats-tile"><div class="stats-tile-value">' + stats.avgNota.toFixed(2) + '</div><div class="stats-tile-label">Promedio' + (periodo ? " del periodo" : " general") + '</div></div>' +
          '<div class="stats-tile"><div class="stats-tile-value">' + stats.n + '</div><div class="stats-tile-label">Misiones' + (periodo ? " del periodo" : " completadas") + '</div></div>' +
          '<div class="stats-tile"><div class="stats-tile-value">' + student.rb_total + '</div><div class="stats-tile-label">RitaBits totales</div></div>' +
          (percentil !== null
            ? '<div class="stats-tile"><div class="stats-tile-value">' + percentil + '%</div><div class="stats-tile-label">Mejor que este % de la clase</div></div>'
            : "") +
          '</div>';

        function bar(label, value) {
          return '<div class="stats-row"><div class="stats-label"><span>' + label + '</span><span>' + value.toFixed(1) + ' / 10</span></div>' +
            '<div class="stats-track"><div class="stats-fill" style="width:' + (value * 10) + '%"></div></div></div>';
        }
        body += '<h3 style="color:var(--green);font-size:0.85rem;margin-bottom:10px">PROMEDIO POR COMPONENTE</h3>';
        body += bar("Taller (20%)", stats.avgTaller) + bar("Gamificación (30%)", stats.avgGami) + bar("Bitácora (50%)", stats.avgBita);

        body += '<h3 style="color:var(--green);font-size:0.85rem;margin:18px 0 10px">DISTRIBUCIÓN DE DESEMPEÑO</h3>';
        Object.keys(stats.dist).forEach(function (k) {
          var pct = (stats.dist[k] / stats.n) * 100;
          body += '<div class="stats-row"><div class="stats-label"><span>' + k + '</span><span>' + stats.dist[k] + '</span></div>' +
            '<div class="stats-track"><div class="stats-fill" style="width:' + pct + '%"></div></div></div>';
        });

        body += '<h3 style="color:var(--green);font-size:0.85rem;margin:20px 0 10px">HISTORIAL DE MISIONES' +
          (periodo ? " — PERIODO " + periodo : "") + '</h3>';
        body += hist.map(function (h) {
          return '<div class="log-entry"><div class="log-title">[OK] ' + h.mision + '</div>' +
            '<div class="log-meta">Periodo ' + h.periodo + ' · Taller ' + h.taller.toFixed(1) +
            ' · Gamificación ' + h.gamificacion.toFixed(1) + ' · Bitácora ' + h.bitacora.toFixed(1) +
            ' · Nota <strong>' + h.nota_final.toFixed(2) + '</strong> · <span class="log-rb">+' + h.rb_ganado + ' RB</span></div></div>';
        }).join("");
      }
      document.getElementById("stats-body").innerHTML = body;
    }

    wrap.innerHTML =
      '<div class="filter-row"><label>Periodo</label><select class="hacker-select" id="stats-periodo-select">' +
      periodOptionsHtml(periodos) + '</select></div><div id="stats-body"></div>';
    document.getElementById("stats-periodo-select").addEventListener("change", function (e) {
      draw(e.target.value ? parseInt(e.target.value, 10) : null);
    });
    draw(null);
  }

  function renderFichaIndividual(student) {
    var wrap = document.getElementById("panel-ficha");
    var allHist = student.historial || [];
    var periodos = Array.from(new Set(allHist.map(function (h) { return h.periodo; }))).sort();
    var codigo = encodeURIComponent(student.codigo);

    function urlFor(tipo, periodo) {
      var qs = periodo ? ("?periodo=" + periodo) : "";
      return "/reportes/ficha-por-codigo/" + codigo + "/" + tipo + qs;
    }

    function draw(periodo) {
      document.getElementById("ficha-iframe").src = urlFor("html", periodo);
      document.getElementById("link-ficha-pdf").href = urlFor("pdf", periodo);
    }

    wrap.innerHTML =
      '<p style="color:var(--text-dim);margin-bottom:14px">' +
      'Esta es tu ficha académica oficial, exactamente igual a la que ve tu docente.</p>' +
      '<div class="filter-row">' +
      '<label>Historial de</label><select class="hacker-select" id="ficha-periodo-select">' + periodOptionsHtml(periodos) + '</select>' +
      '<a class="btn-print" id="link-ficha-pdf" style="text-decoration:none;display:inline-block" target="_blank" href="#">⬇ Descargar PDF</a>' +
      '</div>' +
      '<iframe id="ficha-iframe" class="ficha-embed" src=""></iframe>';

    draw(null);
    document.getElementById("ficha-periodo-select").addEventListener("change", function (e) {
      draw(e.target.value ? parseInt(e.target.value, 10) : null);
    });
  }

  function renderCarnet(student) {
    var wrap = document.getElementById("panel-carnet");
    var inst = DATA.institucion || {};
    var src = avatarSrc(student);
    wrap.innerHTML =
      '<div class="filter-row">' +
      '<button class="btn-print" id="btn-print-carnet">🖨 Imprimir Carnet</button>' +
      '<button class="btn-print" id="btn-download-carnet" style="border-color:var(--cyan);color:var(--cyan)">⬇ Descargar como Imagen</button>' +
      '</div>' +
      '<div class="printable" id="printable-carnet">' +
      '<div class="carnet-visual">' +
      '<div class="cv-header"><div class="cv-inst">' + (inst.nombre || "Academia C.O.D.E.") + '</div>' +
      '<div class="cv-lema">' + (inst.lema || "") + '</div></div>' +
      '<div class="cv-body">' +
      (src ? '<img class="cv-avatar" src="' + src + '">' : '<div class="cv-avatar" style="display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#10182c">' + student.nombre.charAt(0) + '</div>') +
      '<div>' +
      '<div class="cv-name">' + student.nombre + '</div>' +
      '<div class="cv-meta">Grado ' + student.grado + ' · Grupo ' + student.grupo + '</div>' +
      '<div class="cv-rango">RANGO ' + student.rango_actual.nombre.toUpperCase() + '</div>' +
      '</div></div>' +
      '<div class="cv-code-wrap"><div class="cv-code-label">CÓDIGO DE ACCESO INDIVIDUAL</div>' +
      '<div class="cv-code"><span class="cv-lock">🔒</span><span class="cv-sep"></span>' +
      '<span class="cv-code-text">' + student.codigo + '</span></div></div>' +
      '</div></div>';

    document.getElementById("btn-print-carnet").addEventListener("click", function () { window.print(); });
    document.getElementById("btn-download-carnet").addEventListener("click", function () {
      window.descargarCarnetImagen({
        institNombre: inst.nombre, institLema: inst.lema, avatarSrc: src,
        nombre: student.nombre, grado: student.grado, grupo: student.grupo,
        rango: student.rango_actual.nombre, codigo: student.codigo,
        filename: "carnet_" + student.codigo,
      });
    });
  }

  function renderRanking(student) {
    var wrap = document.getElementById("panel-ranking");
    var rows = (DATA.ranking || []);
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="empty-note">El ranking aún no tiene datos.</div>';
      return;
    }
    var grados = Array.from(new Set(rows.map(function (r) { return r.grado; }))).sort();
    var grupos = Array.from(new Set(rows.map(function (r) { return r.grupo; }))).sort();

    function draw(grado, grupo) {
      var filtered = rows.filter(function (r) {
        return (!grado || r.grado === grado) && (!grupo || r.grupo === grupo);
      });
      var html = '<table class="rank-table"><thead><tr>' +
        '<th>#</th><th>Hacker</th><th>Grado/Grupo</th><th>Rango</th><th>RB</th>' +
        '</tr></thead><tbody>';
      if (filtered.length === 0) html += '<tr><td colspan="5">Nadie coincide con este filtro.</td></tr>';
      filtered.forEach(function (r, idx) {
        var isMe = r.codigo === student.codigo;
        html += '<tr class="' + (isMe ? "me" : "") + '">' +
          '<td>' + (idx + 1) + '</td>' +
          '<td>' + r.nombre + (isMe ? " (Tú)" : "") + '</td>' +
          '<td>' + r.grado + ' - ' + r.grupo + '</td>' +
          '<td>' + r.rango + '</td>' +
          '<td>' + r.rb_total + '</td>' +
          '</tr>';
      });
      html += '</tbody></table>';
      document.getElementById("ranking-body").innerHTML = html;
    }

    wrap.innerHTML =
      '<div class="filter-row">' +
      '<label>Grado</label><select class="hacker-select" id="rank-grado-select"><option value="">Global</option>' +
      grados.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join("") + '</select>' +
      '<label>Grupo</label><select class="hacker-select" id="rank-grupo-select"><option value="">Todos</option>' +
      grupos.map(function (g) { return '<option value="' + g + '">' + g + '</option>'; }).join("") + '</select>' +
      '</div><div id="ranking-body"></div>';

    function reDraw() {
      draw(document.getElementById("rank-grado-select").value, document.getElementById("rank-grupo-select").value);
    }
    document.getElementById("rank-grado-select").addEventListener("change", reDraw);
    document.getElementById("rank-grupo-select").addEventListener("change", reDraw);
    draw("", "");
  }

  function initTabs() {
    var buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
      });
    });
  }

  function enterDashboard(student) {
    document.getElementById("dash-avatar-wrap").innerHTML = (function () {
      var src = avatarSrc(student);
      if (src) return '<img src="' + src + '" alt="Avatar de ' + student.nombre + '">';
      return '<span style="font-size:2rem;color:var(--green)">' + student.nombre.charAt(0).toUpperCase() + '</span>';
    })();

    document.getElementById("dash-name").textContent = student.nombre;
    document.getElementById("dash-meta").textContent =
      student.grado + " · Grupo " + student.grupo + " · Código " + student.codigo;
    document.getElementById("dash-rango").textContent =
      "RANGO: " + student.rango_actual.nombre.toUpperCase() + " (NIVEL " + student.rango_actual.nivel + ")";

    animateCount(document.getElementById("dash-rb-value"), student.rb_total);

    var fill = document.getElementById("power-bar-fill");
    setTimeout(function () { fill.style.width = student.progreso_pct + "%"; }, 150);
    document.getElementById("power-bar-label").textContent =
      student.rango_siguiente
        ? student.progreso_pct + "% hacia " + student.rango_siguiente.nombre
        : "Rango máximo alcanzado";

    renderPerfil(student);
    renderAvatares(student);
    renderAlbum(student);
    renderEstadisticas(student);
    renderRanking(student);
    renderFichaIndividual(student);
    renderCarnet(student);

    showScreen("dashboard");
  }

  function initLogout() {
    var btn = document.getElementById("btn-logout");
    if (!btn) return;
    btn.addEventListener("click", function () {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var titleEl = document.getElementById("brand-title");
    if (titleEl) {
      titleEl.textContent = institucionNombre();
      titleEl.setAttribute("data-text", institucionNombre());
    }
    var lemaEl = document.getElementById("inst-lema");
    if (lemaEl) lemaEl.textContent = institucionLema();

    initTabs();
    initLogout();

    showScreen("boot");
    runBoot(function () {
      var savedCode = sessionStorage.getItem(STORAGE_KEY);
      var savedStudent = savedCode ? findStudent(savedCode) : null;
      if (savedStudent) {
        showScreen("dashboard");
        enterDashboard(savedStudent);
      } else {
        showScreen("login");
        initLogin();
      }
    });
  });
})();
