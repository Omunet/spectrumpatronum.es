/**
 * Contact form endpoint for spectrumpatronum.es.
 *
 * Deploy as a web app: Execute as me, Who has access: Anyone.
 * The inbox address is read from the script property RECIPIENT.
 * Do not write that address in this file.
 *
 * Script properties:
 *   RECIPIENT          required, the inbox that receives messages
 *   UPLOAD_FOLDER_ID   required when a message has files; the Drive
 *                      folder "Formulari web uploads"
 *   SHARED_SECRET      optional; request token must match
 *   ALLOWED_ORIGINS    optional; comma-separated origins
 */
var MAX_BYTES = 20 * 1024 * 1024;
var MAX_FILES = 10;

function doGet() {
  return respond({ ok: true });
}

function doPost(e) {
  try {
    return handlePost(e);
  } catch (err) {
    Logger.log("contact form failed");
    return respond({ ok: false, error: "server" });
  }
}

function handlePost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return respond({ ok: false, error: "invalid" });
  }
  if (e.contentLength && Number(e.contentLength) > 28 * 1024 * 1024) {
    return respond({ ok: false, error: "size" });
  }

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ ok: false, error: "invalid" });
  }
  if (!data || Object.prototype.toString.call(data) !== "[object Object]") {
    return respond({ ok: false, error: "invalid" });
  }

  var props = PropertiesService.getScriptProperties();
  var secret = String(props.getProperty("SHARED_SECRET") || "").trim();
  if (secret && !sameText(secret, data.token)) {
    return respond({ ok: false, error: "server" });
  }
  if (!originAllowed(props, data.origin)) {
    return respond({ ok: false, error: "server" });
  }

  // Filled honeypot: pretend the message was accepted and drop it.
  if (String(data.company || "").trim() !== "") {
    try { tooMany("rl:all", 100, 3600); } catch (ignore) {}
    return respond({ ok: true });
  }

  var started = Number(data.started);
  var nowMs = Date.now();
  if (!isFinite(started) || started > nowMs + 60000 || nowMs - started < 3000 || nowMs - started > 6 * 60 * 60 * 1000) {
    return respond({ ok: false, error: "wait" });
  }

  var name = oneLine(data.name, 80);
  var surname = oneLine(data.surname, 80);
  var email = String(data.email || "").trim();
  var phone = String(data.phone || "").trim();
  var message = cleanMessage(data.message, 4000);
  var lang = String(data.lang || "");
  if (lang !== "es" && lang !== "ca" && lang !== "en") lang = "es";

  if (!name || !surname || !message || !validEmail(email) || !validPhone(phone)) {
    return respond({ ok: false, error: "invalid" });
  }

  var prepared = prepareFiles(data.files);
  if (prepared.error) return respond({ ok: false, error: prepared.error });

  if (limited(email)) return respond({ ok: false, error: "rate" });

  var now = new Date();
  var links = [];
  if (prepared.files.length) {
    var folderId = String(props.getProperty("UPLOAD_FOLDER_ID") || "").trim();
    if (!/^[A-Za-z0-9_-]{10,}$/.test(folderId)) {
      return respond({ ok: false, error: "server" });
    }
    var parent = DriveApp.getFolderById(folderId);
    var folder = parent.createFolder(folderName(now, name, surname, parent));
    prepared.files.forEach(function (file) {
      var saved = folder.createFile(file.blob);
      links.push({ name: saved.getName(), url: saved.getUrl() });
    });
  }

  var recipient = String(props.getProperty("RECIPIENT") || "").trim();
  if (!validEmail(recipient)) return respond({ ok: false, error: "server" });

  var fullName = (name + " " + surname).trim();
  var subject = ("[Formulari web] " + fullName).substring(0, 180);
  var when = Utilities.formatDate(now, "Europe/Madrid", "yyyy-MM-dd HH:mm");
  var origin = safeOrigin(data.origin);
  var blobs = prepared.files.map(function (file) { return file.blob; });
  var attached = blobBytes(blobs) <= MAX_BYTES;
  var mail = buildMail({
    name: name,
    surname: surname,
    email: email,
    phone: phone,
    message: message,
    lang: lang,
    when: when,
    origin: origin,
    links: links,
    attached: attached && blobs.length > 0
  });

  sendMail(recipient, email, subject, mail.plain, mail.html, attached ? blobs : []);
  return respond({ ok: true });
}

function prepareFiles(raw) {
  var files = raw || [];
  if (Object.prototype.toString.call(files) !== "[object Array]") {
    return { error: "invalid", files: [] };
  }
  if (files.length > MAX_FILES) return { error: "invalid", files: [] };

  var prepared = [];
  var total = 0;
  for (var i = 0; i < files.length; i++) {
    var item = files[i] || {};
    var filename = safeFileName(item.name);
    var encoded = String(item.data || "").replace(/\s/g, "");
    var size = base64Size(encoded);
    if (!filename || size < 0) return { error: "invalid", files: [] };
    if (!mimeAllowed(item.type, filename)) return { error: "invalid", files: [] };
    total += size;
    if (size > MAX_BYTES || total > MAX_BYTES) return { error: "size", files: [] };
    var bytes;
    try {
      bytes = Utilities.base64Decode(encoded);
    } catch (err) {
      return { error: "invalid", files: [] };
    }
    if (!bytes || bytes.length !== size) return { error: "invalid", files: [] };
    prepared.push({
      blob: Utilities.newBlob(bytes, guessMime(item.type, filename), filename)
    });
  }
  return { files: prepared };
}

function buildMail(fields) {
  var langName = fields.lang === "ca" ? "Català" : fields.lang === "en" ? "English" : "Español";
  var rows = [
    row("Nom", esc(fields.name)),
    row("Cognoms", esc(fields.surname)),
    row("Correu electrònic", esc(fields.email)),
    row("Telèfon", esc(fields.phone || "—")),
    row("Missatge", esc(fields.message)),
    row("Idioma de la pàgina", esc(langName)),
    row("Data", esc(fields.when + " (Europe/Madrid)"))
  ];
  if (fields.origin) rows.push(row("Origen", esc(fields.origin)));
  rows.push(row("Fitxers a Drive", linkList(fields.links)));

  var intro = "Aquest missatge arriba del formulari de contacte del web.";
  var note = "";
  if (fields.links.length && fields.attached) {
    note = "Els fitxers també s'adjunten a aquest correu.";
  } else if (fields.links.length) {
    note = "Els fitxers no s'adjunten al correu pel pes. Els enllaços de Drive continuen disponibles.";
  }

  var html = "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.45;color:#221c28\">" +
    "<p>" + esc(intro) + "</p>" +
    "<table style=\"border-collapse:collapse\">" + rows.join("") + "</table>" +
    (note ? "<p>" + esc(note) + "</p>" : "") +
    "</div>";

  var plain = [
    intro,
    "",
    "Nom: " + fields.name,
    "Cognoms: " + fields.surname,
    "Correu electrònic: " + fields.email,
    "Telèfon: " + (fields.phone || "—"),
    "Missatge:",
    fields.message,
    "",
    "Idioma de la pàgina: " + langName,
    "Data: " + fields.when + " (Europe/Madrid)"
  ];
  if (fields.origin) plain.push("Origen: " + fields.origin);
  plain.push("", "Fitxers a Drive:");
  if (!fields.links.length) plain.push("—");
  fields.links.forEach(function (link) {
    plain.push(link.name + ": " + link.url);
  });
  if (note) plain.push("", note);

  return { html: html, plain: plain.join("\n") };
}

function sendMail(recipient, replyTo, subject, plain, html, blobs) {
  var base = {
    to: recipient,
    replyTo: replyTo,
    subject: subject,
    body: plain,
    htmlBody: html
  };
  if (blobs && blobs.length) {
    try {
      MailApp.sendEmail({
        to: base.to,
        replyTo: base.replyTo,
        subject: base.subject,
        body: base.body,
        htmlBody: base.htmlBody,
        attachments: blobs
      });
      return;
    } catch (err) {
      Logger.log("contact form attachment send failed");
    }
  }
  MailApp.sendEmail(base);
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function row(label, valueHtml) {
  return "<tr><th style=\"text-align:left;vertical-align:top;padding:4px 16px 4px 0;white-space:nowrap\">" +
    esc(label) + "</th><td style=\"padding:4px 0;white-space:pre-wrap\">" + valueHtml + "</td></tr>";
}

function linkList(links) {
  if (!links.length) return esc("—");
  return links.map(function (link) {
    var href = safeHttps(link.url);
    if (!href) return esc(link.name);
    return "<a href=\"" + esc(href) + "\">" + esc(link.name) + "</a>";
  }).join("<br>");
}

function folderName(now, name, surname, parent) {
  var stamp = Utilities.formatDate(now, "Europe/Madrid", "yyyy-MM-dd");
  var who = (name + " " + surname).trim() || "consulta";
  var base = stamp + "-" + who.substring(0, 60);
  if (!parent.getFoldersByName(base).hasNext()) return base;
  return base + "-" + Utilities.formatDate(now, "Europe/Madrid", "HHmmss");
}

function limited(email) {
  try {
    if (tooMany("rl:all", 100, 3600)) return true;
    if (tooMany("rl:" + digest(email.toLowerCase()), 5, 3600)) return true;
  } catch (err) {
    return false;
  }
  return false;
}

function tooMany(key, max, seconds) {
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get(key) || "0");
  if (count >= max) return true;
  cache.put(key, String(count + 1), seconds);
  return false;
}

function digest(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, "");
}

function originAllowed(props, origin) {
  var allowedRaw = String(props.getProperty("ALLOWED_ORIGINS") || "").trim();
  if (!allowedRaw) return true;
  var value = String(origin || "").trim();
  var allowed = allowedRaw.split(",");
  for (var i = 0; i < allowed.length; i++) {
    if (allowed[i].trim() === value) return true;
  }
  return false;
}

function validEmail(value) {
  if (!value || value.length > 120) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  if (!value) return true;
  if (value.length > 40) return false;
  return /^[0-9 +().-]+$/.test(value);
}

function oneLine(value, max) {
  return String(value || "").replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim().substring(0, max);
}

function cleanMessage(value, max) {
  return String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s+|\s+$/g, "")
    .substring(0, max);
}

function mimeAllowed(type, filename) {
  var mime = String(type || "").toLowerCase().split(";")[0].trim();
  if (mime.indexOf("image/") === 0 || mime.indexOf("video/") === 0 || mime === "application/pdf") return true;
  if (mime && mime !== "application/octet-stream") return false;
  return extensionAllowed(filename);
}

function extensionAllowed(filename) {
  return /\.(pdf|png|jpe?g|gif|webp|bmp|svg|heic|heif|avif|mp4|webm|mov|m4v|avi|mkv|mpeg|mpg|3gp|ogv)$/i.test(filename || "");
}

function guessMime(type, filename) {
  var mime = String(type || "").toLowerCase().split(";")[0].trim();
  if (mime && mime !== "application/octet-stream") return mime;
  var ext = String(filename || "").toLowerCase().split(".").pop();
  var map = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    heic: "image/heic",
    heif: "image/heif",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/mp4",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    "3gp": "video/3gpp",
    ogv: "video/ogg"
  };
  return map[ext] || "application/octet-stream";
}

function base64Size(value) {
  if (!value || value.length % 4 !== 0) return -1;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return -1;
  var pad = 0;
  if (value.charAt(value.length - 1) === "=") pad++;
  if (value.charAt(value.length - 2) === "=") pad++;
  return (value.length / 4) * 3 - pad;
}

function safeFileName(name) {
  var base = String(name || "").split(/[/\\]/).pop() || "";
  base = base.replace(/[^\w.\- ()áéíóúàèòçñüÁÉÍÓÚÀÈÒÇÑÜ]+/g, "_").replace(/^\.+/, "");
  if (!base || base === "." || base === "..") return "";
  return base.substring(0, 120);
}

function safeHttps(url) {
  var value = String(url || "");
  if (!/^https:\/\/[^\s<>"]+$/.test(value)) return "";
  return value;
}

function safeOrigin(value) {
  var text = String(value || "").trim();
  if (!/^https?:\/\/[A-Za-z0-9.-]+(?::\d+)?$/.test(text)) return "";
  return text.substring(0, 200);
}

function sameText(a, b) {
  a = String(a);
  b = String(b == null ? "" : b);
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function blobBytes(blobs) {
  var total = 0;
  for (var i = 0; i < blobs.length; i++) total += blobs[i].getBytes().length;
  return total;
}

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
