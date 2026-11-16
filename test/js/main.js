(function () {
  "use strict";

  var KEY = "sp-lang";
  var I18N = {
    es: {
      "meta.title": "Spectrum Patronum — Asociación cultural",
      "meta.description": "Associació Spectrum Patronum es una asociación cultural sin ánimo de lucro en Barcelona que promueve la música electrónica, la cultura DJ, la producción musical, la música en directo y las artes escénicas y visuales.",
      "skip": "Saltar al contenido",
      "nav.open": "Abrir el menú",
      "nav.close": "Cerrar el menú",
      "nav.label": "Navegación principal",
      "nav.projects": "Proyectos",
      "nav.events": "Eventos",
      "nav.contact": "Contacto",
      "lang.label": "Elegir idioma",
      "tagline": "Asociación cultural sin ánimo de lucro en Barcelona. Música electrónica, cultura DJ, producción musical, música en directo y artes escénicas y visuales.",
      "projects.body": "Aquí publicaremos los proyectos de la asociación.",
      "events.body": "El calendario de conciertos y actividades se anunciará en esta sección.",
      "contact.body": "Los datos de contacto se publicarán próximamente.",
      "footer.note": "Asociación cultural sin ánimo de lucro · Barcelona",
      "legal.notice": "Aviso legal",
      "legal.privacy": "Privacidad",
      "notice.title": "Aviso legal — Spectrum Patronum",
      "notice.description": "Aviso legal de Associació Spectrum Patronum, en cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE).",
      "notice.heading": "Aviso legal",
      "privacy.title": "Política de privacidad — Spectrum Patronum",
      "privacy.description": "Política de privacidad de Associació Spectrum Patronum. El sitio no utiliza cookies, analítica ni publicidad.",
      "privacy.heading": "Política de privacidad"
    },
    ca: {
      "meta.title": "Spectrum Patronum — Associació cultural",
      "meta.description": "Associació Spectrum Patronum és una associació cultural sense ànim de lucre a Barcelona que promou la música electrònica, la cultura DJ, la producció musical, la música en directe i les arts escèniques i visuals.",
      "skip": "Salta al contingut",
      "nav.open": "Obre el menú",
      "nav.close": "Tanca el menú",
      "nav.label": "Navegació principal",
      "nav.projects": "Projectes",
      "nav.events": "Esdeveniments",
      "nav.contact": "Contacte",
      "lang.label": "Tria l'idioma",
      "tagline": "Associació cultural sense ànim de lucre a Barcelona. Música electrònica, cultura DJ, producció musical, música en directe i arts escèniques i visuals.",
      "projects.body": "Aquí publicarem els projectes de l'associació.",
      "events.body": "El calendari de concerts i activitats s'anunciarà en aquesta secció.",
      "contact.body": "Les dades de contacte es publicaran properament.",
      "footer.note": "Associació cultural sense ànim de lucre · Barcelona",
      "legal.notice": "Avís legal",
      "legal.privacy": "Privacitat",
      "notice.title": "Avís legal — Spectrum Patronum",
      "notice.description": "Avís legal d'Associació Spectrum Patronum, en compliment de l'article 10 de la Llei 34/2002 (LSSI-CE).",
      "notice.heading": "Avís legal",
      "privacy.title": "Política de privacitat — Spectrum Patronum",
      "privacy.description": "Política de privacitat d'Associació Spectrum Patronum. El lloc no utilitza galetes, analítica ni publicitat.",
      "privacy.heading": "Política de privacitat"
    },
    en: {
      "meta.title": "Spectrum Patronum — Cultural association",
      "meta.description": "Associació Spectrum Patronum is a non-profit cultural association in Barcelona promoting electronic music, DJ culture, music production, live music, and the performing and visual arts.",
      "skip": "Skip to content",
      "nav.open": "Open menu",
      "nav.close": "Close menu",
      "nav.label": "Main",
      "nav.projects": "Projects",
      "nav.events": "Events",
      "nav.contact": "Contact",
      "lang.label": "Choose language",
      "tagline": "A non-profit cultural association in Barcelona. Electronic music, DJ culture, music production, live music, and the performing and visual arts.",
      "projects.body": "The association’s projects will be published here.",
      "events.body": "The calendar of concerts and activities will be announced in this section.",
      "contact.body": "Contact details will be published soon.",
      "footer.note": "Non-profit cultural association · Barcelona",
      "legal.notice": "Legal notice",
      "legal.privacy": "Privacy",
      "notice.title": "Legal notice — Spectrum Patronum",
      "notice.description": "Legal notice of Associació Spectrum Patronum, under Article 10 of Spanish Law 34/2002 (LSSI-CE).",
      "notice.heading": "Legal notice",
      "privacy.title": "Privacy policy — Spectrum Patronum",
      "privacy.description": "Privacy policy of Associació Spectrum Patronum. This site uses no cookies, analytics or ads.",
      "privacy.heading": "Privacy policy"
    }
  };

  var current = "es";
  var lang = document.querySelector(".lang");
  var langBtn = document.getElementById("lang-btn");
  var langMenu = document.getElementById("lang-menu");
  var langOptions = langMenu.querySelectorAll("[data-lang]");
  var desc = document.querySelector('meta[name="description"]');

  function apply(next) {
    var t = I18N[next];
    if (!t) return;
    current = next;
    document.documentElement.lang = next;
    var page = document.body.getAttribute("data-page");
    var titleKey = page ? page + ".title" : "meta.title";
    var descKey = page ? page + ".description" : "meta.description";
    document.title = t[titleKey] || t["meta.title"];
    if (desc && t[descKey]) desc.setAttribute("content", t[descKey]);
    document.querySelectorAll("[data-lang-block]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang-block") !== next;
    });
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (t[key] != null) el.setAttribute("aria-label", t[key]);
    });
    langOptions.forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-lang") === next ? "true" : "false");
    });
  }

  function remember(next) {
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
  }

  function closeLang() {
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }

  function openLang() {
    langMenu.hidden = false;
    langBtn.setAttribute("aria-expanded", "true");
  }

  langBtn.addEventListener("click", function () {
    if (langMenu.hidden) openLang();
    else closeLang();
  });

  langOptions.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = btn.getAttribute("data-lang");
      apply(next);
      remember(next);
      closeLang();
      langBtn.focus();
    });
  });

  langBtn.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    openLang();
    var items = langMenu.querySelectorAll('[role="option"]');
    var target = e.key === "ArrowUp" ? items[items.length - 1] : items[0];
    target.focus();
  });

  langMenu.addEventListener("keydown", function (e) {
    var items = Array.prototype.slice.call(langMenu.querySelectorAll('[role="option"]'));
    var index = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var dir = e.key === "ArrowDown" ? 1 : -1;
      items[(index + dir + items.length) % items.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  });

  lang.addEventListener("focusout", function (e) {
    if (!lang.contains(e.relatedTarget)) closeLang();
  });

  document.addEventListener("click", function (e) {
    if (!lang.contains(e.target)) closeLang();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!langMenu.hidden) {
      closeLang();
      langBtn.focus();
    }
  });

  var stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {}
  if (stored === "es" || stored === "ca" || stored === "en") apply(stored);
  else apply("es");

  var video = document.querySelector(".logo-motion");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function useGif() {
    if (!video || !video.parentNode || video.dataset.fallback === "1") return;
    video.dataset.fallback = "1";
    var img = document.createElement("img");
    img.className = "logo-gif";
    img.src = "assets/sp-logo-heartbeat.gif";
    img.alt = "";
    img.width = 240;
    img.height = 240;
    video.replaceWith(img);
  }

  if (video && reduce) {
    video.pause();
    video.removeAttribute("autoplay");
    video.querySelectorAll("source").forEach(function (source) {
      source.remove();
    });
    video.load();
  } else if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    var source = video.querySelector("source");
    if (source) source.addEventListener("error", useGif);
    video.addEventListener("error", useGif);
    var started = video.play();
    if (started && typeof started.catch === "function") {
      started.catch(useGif);
    }
  }
})();
