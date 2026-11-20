(function () {
  "use strict";

  // Web app URL (Deploy > Web app, ends with /exec).
  // The inbox address is not stored in this file.
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxtcZmeIK5q4sYoTOtVQhMb4HOilwVwxlZ_MkIOS4Pk_pirVBqMglRkcFSTV-sb2mTq/exec";
  // Optional. Sent only when the script property SHARED_SECRET is set to the same value.
  var FORM_TOKEN = "";
  var MAX_BYTES = 18 * 1024 * 1024;
  var MAX_FILES = 10;

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
      "icon.nav": "Menú",
      "icon.home": "Inicio",
      "icon.projects": "Proyectos",
      "icon.events": "Eventos",
      "icon.contact": "Contacto",
      "lang.label": "Elegir idioma",
      "footer.note": "Asociación cultural sin ánimo de lucro · Barcelona",
      "legal.privacy": "Privacidad",
      "privacy.title": "Política de privacidad — Spectrum Patronum",
      "privacy.description": "Información sobre el formulario de contacto, el alojamiento del sitio y cómo ejercer los derechos de protección de datos.",
      "privacy.heading": "Política de privacidad",
      "notfound.title": "Página no encontrada — Spectrum Patronum",
      "notfound.description": "Esta página no existe.",
      "notfound.heading": "Página no encontrada",
      "notfound.text": "Esta página no existe o ha cambiado de dirección.",
      "notfound.home": "Volver al inicio",
      "form.title": "Contacto",
      "form.close": "Cerrar",
      "form.name": "Nombre",
      "form.surname": "Apellidos",
      "form.email": "Correo electrónico",
      "form.phone": "Teléfono",
      "form.optional": "opcional",
      "form.message": "Mensaje",
      "form.attach": "Adjuntar archivos",
      "form.fileList": "Archivos adjuntos",
      "form.remove": "Quitar",
      "form.removeNamed": "Quitar {name}",
      "form.total": "Total: {size} / 18 MB",
      "form.consentBefore": "Acepto que mis datos se usen para responder a esta consulta, según la ",
      "form.privacy": "política de privacidad",
      "form.consentAfter": ".",
      "form.notice": "La finalidad es responder a tu consulta. La base legal es tu consentimiento. Este sitio no guarda nada: el mensaje y los archivos se envían por correo a la asociación y se conservan solo el tiempo necesario para atender la consulta o el evento, y después se borran. Para cualquier solicitud sobre tus datos (acceso, rectificación, supresión y demás) usa este formulario. Puedes reclamar ante la AEPD.",
      "form.noticeAge": "Si tienes menos de 14 años, necesitas el permiso de tu padre, madre o tutor.",
      "form.noticeSensitive": "No envíes datos sensibles ni fotos o vídeos de otras personas sin su permiso.",
      "form.noticePolicy": "Política de privacidad",
      "form.send": "Enviar",
      "form.sending": "Enviando…",
      "form.success": "Mensaje enviado. Te responderemos lo antes posible.",
      "form.error": "No se ha podido enviar. Inténtalo de nuevo.",
      "form.wait": "Espera unos segundos y vuelve a enviarlo.",
      "form.rate": "Has enviado varios mensajes seguidos. Inténtalo más tarde.",
      "form.busy": "No se puede enviar ahora. Inténtalo más tarde.",
      "form.size": "Los archivos superan 18 MB en total. Para vídeos más grandes, envía un enlace en el mensaje.",
      "form.tooLarge": "Los archivos son demasiado grandes para el correo. Envía un enlace en el mensaje.",
      "form.type": "Solo se admiten imágenes, vídeos y PDF.",
      "form.count": "Puedes adjuntar hasta 10 archivos.",
      "form.invalid": "Revisa los campos e inténtalo de nuevo.",
      "form.unconfigured": "El formulario no está disponible en este momento."
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
      "icon.nav": "Menú",
      "icon.home": "Inici",
      "icon.projects": "Projectes",
      "icon.events": "Esdeveniments",
      "icon.contact": "Contacte",
      "lang.label": "Tria l'idioma",
      "footer.note": "Associació cultural sense ànim de lucre · Barcelona",
      "legal.privacy": "Privacitat",
      "privacy.title": "Política de privacitat — Spectrum Patronum",
      "privacy.description": "Informació sobre el formulari de contacte, l'allotjament del lloc i com exercir els drets de protecció de dades.",
      "privacy.heading": "Política de privacitat",
      "notfound.title": "Pàgina no trobada — Spectrum Patronum",
      "notfound.description": "Aquesta pàgina no existeix.",
      "notfound.heading": "Pàgina no trobada",
      "notfound.text": "Aquesta pàgina no existeix o ha canviat d'adreça.",
      "notfound.home": "Torna a l'inici",
      "form.title": "Contacte",
      "form.close": "Tanca",
      "form.name": "Nom",
      "form.surname": "Cognoms",
      "form.email": "Correu electrònic",
      "form.phone": "Telèfon",
      "form.optional": "opcional",
      "form.message": "Missatge",
      "form.attach": "Adjunta fitxers",
      "form.fileList": "Fitxers adjunts",
      "form.remove": "Treu",
      "form.removeNamed": "Treu {name}",
      "form.total": "Total: {size} / 18 MB",
      "form.consentBefore": "Accepto que les meves dades s'utilitzin per respondre aquesta consulta, segons la ",
      "form.privacy": "política de privacitat",
      "form.consentAfter": ".",
      "form.notice": "La finalitat és respondre la teva consulta. La base legal és el teu consentiment. Aquest lloc no desa res: el missatge i els fitxers s'envien per correu a l'associació i es conserven només el temps necessari per atendre la consulta o l'esdeveniment, i després s'esborren. Per a qualsevol sol·licitud sobre les teves dades (accés, rectificació, supressió i la resta) fes servir aquest formulari. Pots reclamar davant l'AEPD.",
      "form.noticeAge": "Si tens menys de 14 anys, necessites el permís del teu pare, mare o tutor.",
      "form.noticeSensitive": "No enviïs dades sensibles ni fotos o vídeos d'altres persones sense el seu permís.",
      "form.noticePolicy": "Política de privacitat",
      "form.send": "Envia",
      "form.sending": "S'està enviant…",
      "form.success": "Missatge enviat. Et respondrem tan aviat com puguem.",
      "form.error": "No s'ha pogut enviar. Torna-ho a provar.",
      "form.wait": "Espera uns segons i torna-ho a enviar.",
      "form.rate": "Has enviat diversos missatges seguits. Torna-ho a provar més tard.",
      "form.busy": "Ara no es pot enviar. Torna-ho a provar més tard.",
      "form.size": "Els fitxers superen 18 MB en total. Per a vídeos més grans, envia un enllaç al missatge.",
      "form.tooLarge": "Els fitxers són massa grans per al correu. Envia un enllaç al missatge.",
      "form.type": "Només s'admeten imatges, vídeos i PDF.",
      "form.count": "Pots adjuntar fins a 10 fitxers.",
      "form.invalid": "Revisa els camps i torna-ho a provar.",
      "form.unconfigured": "El formulari no està disponible en aquest moment."
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
      "icon.nav": "Menu",
      "icon.home": "Home",
      "icon.projects": "Projects",
      "icon.events": "Events",
      "icon.contact": "Contact",
      "lang.label": "Choose language",
      "footer.note": "Non-profit cultural association · Barcelona",
      "legal.privacy": "Privacy",
      "privacy.title": "Privacy policy — Spectrum Patronum",
      "privacy.description": "Information about the contact form, how the site is hosted, and how to exercise data protection rights.",
      "privacy.heading": "Privacy policy",
      "notfound.title": "Page not found — Spectrum Patronum",
      "notfound.description": "This page does not exist.",
      "notfound.heading": "Page not found",
      "notfound.text": "This page does not exist or has moved.",
      "notfound.home": "Back to the homepage",
      "form.title": "Contact",
      "form.close": "Close",
      "form.name": "Name",
      "form.surname": "Surname",
      "form.email": "Email",
      "form.phone": "Phone",
      "form.optional": "optional",
      "form.message": "Message",
      "form.attach": "Attach files",
      "form.fileList": "Attached files",
      "form.remove": "Remove",
      "form.removeNamed": "Remove {name}",
      "form.total": "Total: {size} / 18 MB",
      "form.consentBefore": "I agree that my data may be used to answer this enquiry, as described in the ",
      "form.privacy": "privacy policy",
      "form.consentAfter": ".",
      "form.notice": "The purpose is to answer your enquiry. The legal basis is your consent. This site stores nothing: your message and files are sent by email to the association and kept only as long as needed to handle the enquiry or event, then deleted. For any request about your data (access, rectification, erasure, and so on) use this contact form. You can complain to the AEPD.",
      "form.noticeAge": "If you are under 14, you need permission from your father, mother or guardian.",
      "form.noticeSensitive": "Don't send sensitive data or photos or videos of other people without their permission.",
      "form.noticePolicy": "Privacy policy",
      "form.send": "Send",
      "form.sending": "Sending…",
      "form.success": "Message sent. We will reply as soon as we can.",
      "form.error": "Could not send. Please try again.",
      "form.wait": "Wait a few seconds, then send it again.",
      "form.rate": "Several messages were sent in a row. Please try again later.",
      "form.busy": "It cannot be sent right now. Please try again later.",
      "form.size": "The files are over 18 MB in total. For larger videos, send a link in your message.",
      "form.tooLarge": "The files are too large for email. Send a link in your message instead.",
      "form.type": "Only images, videos and PDFs are accepted.",
      "form.count": "You can attach up to 10 files.",
      "form.invalid": "Check the fields and try again.",
      "form.unconfigured": "The form is not available right now."
    }
  };

  var current = "es";
  var afterApply = [];
  var formStarted = 0;
  var contactFiles = [];
  var contactSending = false;
  var contactStatusKey = "";
  var contactStatusTone = "";
  var contactSeq = 1;
  var ignoreOutsideUntil = 0;
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
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-title");
      if (t[key] != null) el.setAttribute("title", t[key]);
    });
    langOptions.forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.getAttribute("data-lang") === next ? "true" : "false");
    });
    afterApply.forEach(function (fn) { fn(); });
  }

  function t(key) {
    var pack = I18N[current];
    if (pack && pack[key] != null) return pack[key];
    return "";
  }

  function fill(template, token, value) {
    return String(template).split(token).join(value);
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
    closeContact(false);
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
    if (closeContact(true)) {
      e.preventDefault();
      return;
    }
    if (!langMenu.hidden) {
      closeLang();
      langBtn.focus();
    }
  });

  function contactRoot() {
    return document.querySelector(".contact");
  }

  function syncContactLabel() {
    var btn = document.getElementById("contact-btn");
    if (!btn) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    var key = open ? "form.close" : "icon.contact";
    btn.setAttribute("aria-label", t(key));
    btn.setAttribute("title", t(key));
  }

  function focusEl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (err) {
      el.focus();
    }
  }

  function contactBackdrop() {
    var backdrop = document.getElementById("contact-backdrop");
    if (backdrop) return backdrop;
    var header = document.querySelector(".site-header");
    if (!header) return null;
    backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.id = "contact-backdrop";
    backdrop.className = "contact-backdrop";
    backdrop.tabIndex = -1;
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.hidden = true;
    header.appendChild(backdrop);
    backdrop.addEventListener("click", function () {
      closeContact(false);
    });
    return backdrop;
  }

  function openContact() {
    var panel = document.getElementById("contact-panel");
    var btn = document.getElementById("contact-btn");
    if (!panel || !btn) return;
    closeLang();
    if (!formStarted) formStarted = Date.now();
    var backdrop = contactBackdrop();
    if (backdrop) backdrop.hidden = false;
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    syncContactLabel();
    focusEl(document.getElementById("contact-name"));
  }

  function closeContact(restoreFocus) {
    var panel = document.getElementById("contact-panel");
    var btn = document.getElementById("contact-btn");
    if (!panel || !btn || panel.hidden) return false;
    panel.hidden = true;
    var backdrop = document.getElementById("contact-backdrop");
    if (backdrop) backdrop.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    syncContactLabel();
    if (restoreFocus) focusEl(btn);
    return true;
  }

  function setStatus(key, tone) {
    contactStatusKey = key || "";
    contactStatusTone = tone || "";
    var el = document.getElementById("contact-status");
    if (!el) return;
    el.textContent = contactStatusKey ? t(contactStatusKey) : "";
    el.className = "form-status" + (contactStatusTone ? " is-" + contactStatusTone : "");
  }

  function formatSize(bytes) {
    var mb = bytes / (1024 * 1024);
    var text = mb >= 0.1 ? mb.toFixed(1) : (bytes / 1024).toFixed(0) + " KB";
    if (mb >= 0.1 && current !== "en") text = text.replace(".", ",");
    if (mb < 0.1) return text;
    return text + " MB";
  }

  function fileExt(name) {
    var parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function fileAllowed(file) {
    if (!file || !file.size) return false;
    var type = String(file.type || "").toLowerCase().split(";")[0].trim();
    var ext = fileExt(file.name);
    var images = { jpg: 1, jpeg: 1, png: 1, gif: 1, webp: 1, bmp: 1, heic: 1, heif: 1, avif: 1, svg: 1 };
    var videos = { mp4: 1, m4v: 1, webm: 1, mov: 1, avi: 1, mkv: 1, mpeg: 1, mpg: 1, "3gp": 1, ogv: 1 };
    if (ext === "pdf") return type === "application/pdf";
    if (images[ext]) return type.indexOf("image/") === 0;
    if (videos[ext]) return type.indexOf("video/") === 0;
    return false;
  }

  function renderFiles() {
    var list = document.getElementById("contact-files");
    var totalEl = document.getElementById("contact-total");
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    var total = 0;
    contactFiles.forEach(function (item) {
      total += item.file.size;
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "file-name";
      name.textContent = item.file.name;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-remove";
      btn.setAttribute("data-id", String(item.id));
      btn.textContent = t("form.remove");
      btn.setAttribute("aria-label", fill(t("form.removeNamed"), "{name}", item.file.name));
      if (contactSending) btn.disabled = true;
      li.appendChild(name);
      li.appendChild(btn);
      list.appendChild(li);
    });
    if (!totalEl) return;
    if (!contactFiles.length) {
      totalEl.hidden = true;
      totalEl.textContent = "";
      return;
    }
    totalEl.hidden = false;
    totalEl.textContent = fill(t("form.total"), "{size}", formatSize(total));
  }

  function addFiles(list) {
    var incoming = Array.prototype.slice.call(list || []);
    if (!incoming.length) return;
    var next = contactFiles.slice();
    var rejectedType = false;
    var rejectedCount = false;
    var rejectedSize = false;
    incoming.forEach(function (file) {
      if (!fileAllowed(file)) {
        rejectedType = true;
        return;
      }
      if (next.length >= MAX_FILES) {
        rejectedCount = true;
        return;
      }
      var duplicate = next.some(function (item) {
        var prev = item.file;
        return prev.name === file.name && prev.size === file.size && prev.lastModified === file.lastModified;
      });
      if (duplicate) return;
      var total = file.size;
      next.forEach(function (item) { total += item.file.size; });
      if (total > MAX_BYTES) {
        rejectedSize = true;
        return;
      }
      next.push({ id: contactSeq++, file: file });
    });
    contactFiles = next;
    renderFiles();
    if (rejectedSize) setStatus("form.size", "error");
    else if (rejectedType) setStatus("form.type", "error");
    else if (rejectedCount) setStatus("form.count", "error");
    else if (contactStatusKey === "form.size" || contactStatusKey === "form.type" || contactStatusKey === "form.count") setStatus("", "");
  }

  function trimField(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    var value = String(el.value || "").replace(/^\s+|\s+$/g, "");
    el.value = value;
    return value;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var raw = String(reader.result || "");
        var comma = raw.indexOf(",");
        resolve({
          name: file.name,
          type: file.type || "",
          data: comma >= 0 ? raw.slice(comma + 1) : raw
        });
      };
      reader.onerror = function () { reject(new Error("read")); };
      reader.readAsDataURL(file);
    });
  }

  function setBusy(on) {
    contactSending = on;
    var form = document.getElementById("contact-form");
    var sendBtn = document.getElementById("contact-send");
    if (form) form.setAttribute("aria-busy", on ? "true" : "false");
    if (sendBtn) {
      sendBtn.disabled = on;
      sendBtn.textContent = on ? t("form.sending") : t("form.send");
    }
    if (!form) return;
    var controls = form.querySelectorAll("input, textarea, button");
    Array.prototype.forEach.call(controls, function (control) {
      if (control === sendBtn) return;
      if (control.type === "file") return;
      control.disabled = on;
    });
  }

  function knownStatus(code) {
    if (code === "wait") return "form.wait";
    if (code === "rate") return "form.rate";
    if (code === "busy") return "form.busy";
    if (code === "size") return "form.size";
    if (code === "too_large") return "form.tooLarge";
    if (code === "invalid") return "form.invalid";
    return "form.error";
  }

  function initContact() {
    var root = contactRoot();
    var btn = document.getElementById("contact-btn");
    var panel = document.getElementById("contact-panel");
    var form = document.getElementById("contact-form");
    if (!root || !btn || !panel || !form) return;

    btn.addEventListener("click", function () {
      if (panel.hidden) openContact();
      else closeContact(false);
    });

    var closeBtn = document.getElementById("contact-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeContact(true);
      });
    }

    document.querySelectorAll(".js-contact").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openContact();
      });
    });

    document.addEventListener("click", function (e) {
      if (Date.now() < ignoreOutsideUntil) return;
      if (root.contains(e.target)) return;
      if (e.target.closest && e.target.closest(".js-contact")) return;
      closeContact(false);
    });

    root.addEventListener("focusout", function (e) {
      if (!e.relatedTarget) return;
      if (!root.contains(e.relatedTarget)) closeContact(false);
    });

    var fileInput = document.getElementById("contact-file");
    var attachBtn = document.getElementById("contact-attach");
    if (attachBtn && fileInput) {
      attachBtn.addEventListener("click", function () {
        ignoreOutsideUntil = Date.now() + 2000;
        fileInput.click();
      });
    }
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        ignoreOutsideUntil = Date.now() + 500;
        addFiles(fileInput.files);
        fileInput.value = "";
      });
    }
    window.addEventListener("focus", function () {
      if (Date.now() < ignoreOutsideUntil) ignoreOutsideUntil = Date.now() + 400;
    });

    var fileList = document.getElementById("contact-files");
    if (fileList) {
      fileList.addEventListener("click", function (e) {
        var target = e.target.closest ? e.target.closest("button") : null;
        if (!target || !fileList.contains(target) || contactSending) return;
        var id = target.getAttribute("data-id");
        contactFiles = contactFiles.filter(function (item) { return String(item.id) !== id; });
        renderFiles();
        if (contactStatusKey === "form.size" || contactStatusKey === "form.type" || contactStatusKey === "form.count") {
          setStatus("", "");
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (contactSending) return;
      trimField("contact-name");
      trimField("contact-surname");
      trimField("contact-email");
      trimField("contact-phone");
      trimField("contact-message");
      if (!form.reportValidity()) return;
      var total = 0;
      contactFiles.forEach(function (item) { total += item.file.size; });
      if (total > MAX_BYTES) {
        setStatus("form.size", "error");
        return;
      }
      if (FORM_ENDPOINT.indexOf("REPLACE_WITH") !== -1) {
        setStatus("form.unconfigured", "error");
        return;
      }
      if (!formStarted || Date.now() - formStarted < 3000) {
        setStatus("form.wait", "error");
        return;
      }
      setStatus("", "");
      setBusy(true);
      Promise.all(contactFiles.map(function (item) { return readFile(item.file); }))
        .then(function (files) {
          var payload = {
            name: document.getElementById("contact-name").value,
            surname: document.getElementById("contact-surname").value,
            email: document.getElementById("contact-email").value,
            phone: document.getElementById("contact-phone").value,
            message: document.getElementById("contact-message").value,
            company: (document.getElementById("contact-company") || { value: "" }).value,
            lang: document.documentElement.lang || "es",
            started: formStarted,
            origin: location.origin,
            files: files
          };
          if (FORM_TOKEN) payload.token = FORM_TOKEN;
          // text/plain avoids a CORS preflight. Apps Script answers with a
          // redirect; the browser follows it and we read the final JSON.
          return fetch(FORM_ENDPOINT, {
            method: "POST",
            redirect: "follow",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload)
          }).then(function (res) { return res.text(); });
        })
        .then(function (text) {
          var data;
          try {
            data = JSON.parse(text);
          } catch (err) {
            throw new Error("bad-response");
          }
          if (!data || data.ok !== true) {
            var failure = new Error("form");
            failure.code = data && data.error;
            throw failure;
          }
          form.reset();
          contactFiles = [];
          renderFiles();
          formStarted = Date.now();
          setStatus("form.success", "ok");
        })
        .catch(function (err) {
          setStatus(knownStatus(err && err.code), "error");
        })
        .then(function () {
          setBusy(false);
        });
    });

    afterApply.push(function () {
      syncContactLabel();
      renderFiles();
      var sendBtn = document.getElementById("contact-send");
      if (sendBtn) sendBtn.textContent = contactSending ? t("form.sending") : t("form.send");
      if (contactStatusKey) setStatus(contactStatusKey, contactStatusTone);
    });
  }

  initContact();

  var stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch (e) {}
  if (stored === "es" || stored === "ca" || stored === "en") apply(stored);
  else apply("es");

  var IG_WEB = "https://www.instagram.com/spectrumpatronum.es";
  var IG_APP = "instagram://user?username=spectrumpatronum.es";

  function isPhone() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  }

  document.querySelectorAll(".js-instagram").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (!isPhone()) return;
      e.preventDefault();
      var left = false;
      function gone() { left = true; }
      document.addEventListener("visibilitychange", gone);
      window.addEventListener("pagehide", gone);
      window.location.href = IG_APP;
      setTimeout(function () {
        document.removeEventListener("visibilitychange", gone);
        window.removeEventListener("pagehide", gone);
        if (!left && document.visibilityState === "visible") {
          window.location.href = IG_WEB;
        }
      }, 1000);
    });
  });

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
