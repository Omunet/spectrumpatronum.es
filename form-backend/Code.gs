/**
 * Contact form endpoint for spectrumpatronum.es.
 *
 * Deploy as a web app: Execute as me, Who has access: Anyone.
 * After editing this file, open Deploy > Manage deployments, edit the
 * web app, and choose New version. The /exec URL stays the same.
 *
 * The site stores nothing. The script sends one email to the address in
 * the RECIPIENT script property and does not write that address here.
 * Uploaded files are attachments on that email. The script keeps no copy.
 *
 * Script properties:
 *   RECIPIENT        required, the inbox that receives messages
 *   SHARED_SECRET    optional; request token must match
 *   ALLOWED_ORIGINS  optional; comma-separated origins
 *
 * Rate-limit counters use CacheService only, never Script Properties.
 */
var MAX_FILE_BYTES = 18 * 1024 * 1024;
var MAX_TOTAL_BYTES = 18 * 1024 * 1024;
var MAX_FILES = 10;
var MAX_MESSAGE = 4000;
var MAX_NAME = 80;
var MAX_EMAIL = 120;
var MAX_PHONE = 40;
// Base64 of 18 MB is 24 MB. Leave room for the JSON around the files.
var MAX_BODY_BYTES = 30 * 1024 * 1024;
// Leave a margin before Apps Script's 6 minute limit.
var RUN_BUDGET_MS = 5 * 60 * 1000 + 30 * 1000;

function doGet() {
  return respond({ ok: true });
}

function doPost(e) {
  var startedAt = Date.now();
  try {
    return handlePost(e, startedAt);
  } catch (err) {
    Logger.log("contact form failed");
    return respond({ ok: false, error: "server" });
  }
}

function handlePost(e, startedAt) {
  if (!e || !e.postData || !e.postData.contents) {
    return respond({ ok: false, error: "invalid" });
  }
  if (e.contentLength && Number(e.contentLength) > MAX_BODY_BYTES) {
    return respond({ ok: false, error: "size" });
  }
  if (outOfTime(startedAt)) return respond({ ok: false, error: "busy" });

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

  var name = oneLine(data.name, MAX_NAME);
  var surname = oneLine(data.surname, MAX_NAME);
  var email = String(data.email || "").trim();
  var phone = String(data.phone || "").trim();
  var message = cleanMessage(data.message, MAX_MESSAGE);
  var lang = String(data.lang || "");
  if (lang !== "es" && lang !== "ca" && lang !== "en") lang = "es";

  if (name == null || surname == null || message == null) {
    return respond({ ok: false, error: "invalid" });
  }
  if (!name || !message || !validEmail(email) || !validPhone(phone)) {
    return respond({ ok: false, error: "invalid" });
  }

  var prepared = prepareFiles(data.files, startedAt);
  if (prepared.error) return respond({ ok: false, error: prepared.error });
  if (outOfTime(startedAt)) return respond({ ok: false, error: "busy" });

  if (limited(email)) return respond({ ok: false, error: "rate" });

  var quota;
  try {
    quota = MailApp.getRemainingDailyQuota();
  } catch (err) {
    Logger.log("contact form quota check failed");
    return respond({ ok: false, error: "busy" });
  }
  if (!quota || quota < 1) return respond({ ok: false, error: "busy" });

  var recipient = String(props.getProperty("RECIPIENT") || "").trim();
  if (!validEmail(recipient)) return respond({ ok: false, error: "server" });

  var now = new Date();
  var fullName = (name + (surname ? " " + surname : "")).trim();
  var subject = ("[Formulari web] " + fullName).substring(0, 180);
  var when = Utilities.formatDate(now, "Europe/Madrid", "yyyy-MM-dd HH:mm");
  var mail = buildMail({
    name: name,
    surname: surname,
    email: email,
    phone: phone,
    message: message,
    lang: lang,
    when: when,
    origin: safeOrigin(data.origin),
    files: prepared.files
  });
  if (mail.html.length > 180 * 1024 || mail.plain.length > 180 * 1024) {
    return respond({ ok: false, error: "invalid" });
  }

  var sent = sendMail(recipient, email, subject, mail.plain, mail.html, prepared.files);
  if (sent === "too_large") return respond({ ok: false, error: "too_large" });
  if (sent !== "ok") return respond({ ok: false, error: "server" });
  return respond({ ok: true });
}

function prepareFiles(raw, startedAt) {
  var files = raw || [];
  if (Object.prototype.toString.call(files) !== "[object Array]") {
    return { error: "invalid", files: [] };
  }
  if (files.length > MAX_FILES) return { error: "invalid", files: [] };

  var prepared = [];
  var total = 0;
  for (var i = 0; i < files.length; i++) {
    if (outOfTime(startedAt)) return { error: "busy", files: [] };
    var item = files[i] || {};
    var filename = safeFileName(item.name);
    var encoded = String(item.data || "").replace(/\s/g, "");
    var size = base64Size(encoded);
    if (!filename || size < 1) return { error: "invalid", files: [] };
    if (!typeAllowed(item.type, filename)) return { error: "invalid", files: [] };
    if (size > MAX_FILE_BYTES) return { error: "size", files: [] };
    total += size;
    if (total > MAX_TOTAL_BYTES) return { error: "size", files: [] };
    var bytes;
    try {
      bytes = Utilities.base64Decode(encoded);
    } catch (err) {
      return { error: "invalid", files: [] };
    }
    if (!bytes || bytes.length !== size || bytes.length > MAX_FILE_BYTES) {
      return { error: "invalid", files: [] };
    }
    prepared.push(Utilities.newBlob(bytes, guessMime(item.type, filename), filename));
  }
  return { files: prepared };
}

function buildMail(fields) {
  var langName = fields.lang === "ca" ? "Català" : fields.lang === "en" ? "English" : "Español";
  var names = fields.files.map(function (blob) { return blob.getName(); });
  var rows = [
    row("Nom", esc(fields.name)),
    row("Cognoms", esc(fields.surname || "—")),
    row("Correu electrònic", esc(fields.email)),
    row("Telèfon", esc(fields.phone || "—")),
    row("Missatge", esc(fields.message)),
    row("Idioma de la pàgina", esc(langName)),
    row("Data", esc(fields.when + " (Europe/Madrid)")),
    row("Fitxers adjunts", names.length ? names.map(esc).join("<br>") : esc("—"))
  ];
  if (fields.origin) rows.push(row("Origen", esc(fields.origin)));

  var intro = "Aquest missatge arriba del formulari de contacte del web. El lloc no en guarda cap còpia.";
  var html = "<div style=\"font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.45;color:#221c28\">" +
    "<p>" + esc(intro) + "</p>" +
    "<table style=\"border-collapse:collapse\">" + rows.join("") + "</table>" +
    "</div>";

  var plain = [
    intro,
    "",
    "Nom: " + fields.name,
    "Cognoms: " + (fields.surname || "—"),
    "Correu electrònic: " + fields.email,
    "Telèfon: " + (fields.phone || "—"),
    "Missatge:",
    fields.message,
    "",
    "Idioma de la pàgina: " + langName,
    "Data: " + fields.when + " (Europe/Madrid)",
    "",
    "Fitxers adjunts:",
    names.length ? names.join("\n") : "—"
  ];
  if (fields.origin) plain.push("", "Origen: " + fields.origin);
  return { html: html, plain: plain.join("\n") };
}

function sendMail(recipient, replyTo, subject, plain, html, blobs) {
  var options = {
    to: recipient,
    replyTo: replyTo,
    subject: subject,
    body: plain,
    htmlBody: html
  };
  if (blobs && blobs.length) options.attachments = blobs;
  try {
    MailApp.sendEmail(options);
    return "ok";
  } catch (err) {
    if (mailTooLarge(err)) {
      Logger.log("contact form message too large");
      return "too_large";
    }
    Logger.log("contact form mail failed");
    return "fail";
  }
}

function mailTooLarge(err) {
  var msg = String(err && err.message || err || "").toLowerCase();
  return msg.indexOf("too large") !== -1 || msg.indexOf("message size") !== -1 || msg.indexOf("attachment") !== -1 || (msg.indexOf("size") !== -1 && msg.indexOf("exceed") !== -1);
}

function outOfTime(startedAt) {
  return Date.now() - startedAt > RUN_BUDGET_MS;
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
  if (!value || value.length > MAX_EMAIL) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value) {
  if (!value) return true;
  if (value.length > MAX_PHONE) return false;
  return /^[0-9 +().-]+$/.test(value);
}

function oneLine(value, max) {
  var text = String(value || "").replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim();
  if (text.length > max) return null;
  return text;
}

function cleanMessage(value, max) {
  var text = String(value || "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s+|\s+$/g, "");
  if (text.length > max) return null;
  return text;
}

function typeAllowed(type, filename) {
  var mime = String(type || "").toLowerCase().split(";")[0].trim();
  var ext = String(filename || "").toLowerCase().split(".").pop();
  if (!mime || !ext) return false;
  if (ext === "pdf") return mime === "application/pdf";
  if (imageExt(ext)) return mime.indexOf("image/") === 0;
  if (videoExt(ext)) return mime.indexOf("video/") === 0;
  return false;
}

function imageExt(ext) {
  return { jpg: 1, jpeg: 1, png: 1, gif: 1, webp: 1, bmp: 1, heic: 1, heif: 1, avif: 1, svg: 1 }[ext] === 1;
}

function videoExt(ext) {
  return { mp4: 1, m4v: 1, webm: 1, mov: 1, avi: 1, mkv: 1, mpeg: 1, mpg: 1, "3gp": 1, ogv: 1 }[ext] === 1;
}

function guessMime(type, filename) {
  var mime = String(type || "").toLowerCase().split(";")[0].trim();
  if (mime) return mime;
  var ext = String(filename || "").toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "mp4" || ext === "m4v") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  return "application/octet-stream";
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

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
