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
      "footer.note": "Asociación cultural sin ánimo de lucro · Barcelona"
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
      "footer.note": "Associació cultural sense ànim de lucre · Barcelona"
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
      "footer.note": "Non-profit cultural association · Barcelona"
    }
  };

  var current = "es";
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var navToggle = document.querySelector(".nav-toggle");
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
    document.title = t["meta.title"];
    if (desc) desc.setAttribute("content", t["meta.description"]);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (t[key] != null) el.setAttribute("aria-label", t[key]);
    });
    syncNavLabel();
    langOptions.forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-lang") === next ? "true" : "false");
    });
  }

  function remember(next) {
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
  }

  function syncNavLabel() {
    var open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-label", I18N[current][open ? "nav.close" : "nav.open"]);
  }

  function closeNav() {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    syncNavLabel();
  }

  function openNav() {
    closeLang();
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    syncNavLabel();
  }

  function closeLang() {
    langMenu.hidden = true;
    langBtn.setAttribute("aria-expanded", "false");
  }

  function openLang() {
    closeNav();
    langMenu.hidden = false;
    langBtn.setAttribute("aria-expanded", "true");
  }

  navToggle.addEventListener("click", function () {
    if (nav.classList.contains("is-open")) closeNav();
    else openNav();
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

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
    if (!header.contains(e.target)) closeNav();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!langMenu.hidden) {
      closeLang();
      langBtn.focus();
      return;
    }
    if (nav.classList.contains("is-open")) {
      closeNav();
      navToggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) closeNav();
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
