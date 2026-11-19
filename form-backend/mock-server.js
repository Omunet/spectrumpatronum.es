#!/usr/bin/env node
"use strict";

var http = require("http");
var fs = require("fs");
var path = require("path");

var PORT = Number(process.env.PORT) || 8787;
var ROOT = path.resolve(__dirname, "..");
var PLACEHOLDER = "https://script.google.com/macros/s/AKfycbxtcZmeIK5q4sYoTOtVQhMb4HOilwVwxlZ_MkIOS4Pk_pirVBqMglRkcFSTV-sb2mTq/exec";
var last = null;

var TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".gs": "text/plain; charset=utf-8"
};

function endpoint() {
  return "http://127.0.0.1:" + PORT + "/exec";
}

function sendJson(res, status, obj) {
  var body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function safeFile(urlPath) {
  var decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch (err) {
    return null;
  }
  if (decoded.indexOf("\0") !== -1) return null;
  if (decoded === "/") decoded = "/index.html";
  var parts = decoded.split("/").filter(Boolean);
  if (parts.indexOf("..") !== -1 || parts.indexOf(".git") !== -1) return null;
  return path.join.apply(path, [ROOT].concat(parts));
}

var server = http.createServer(function (req, res) {
  var url = new URL(req.url, "http://127.0.0.1:" + PORT);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === "/exec") {
    var chunks = [];
    req.on("data", function (chunk) { chunks.push(chunk); });
    req.on("end", function () {
      try {
        last = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (err) {
        last = null;
        sendJson(res, 400, { ok: false, error: "invalid" });
        return;
      }
      var files = Array.isArray(last.files) ? last.files : [];
      console.log("mock received " + JSON.stringify({
        name: last.name || "",
        surname: last.surname || "",
        lang: last.lang || "",
        company: last.company ? "filled" : "",
        files: files.map(function (file) {
          return { name: file.name, type: file.type, chars: file.data ? file.data.length : 0 };
        })
      }));
      res.writeHead(302, {
        Location: "http://127.0.0.1:" + PORT + "/done",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      });
      res.end();
    });
    return;
  }

  if (url.pathname === "/done") {
    if (!last || typeof last !== "object") {
      sendJson(res, 200, { ok: false, error: "invalid" });
      return;
    }
    if (last.company) {
      sendJson(res, 200, { ok: true });
      return;
    }
    var started = Number(last.started);
    if (!started || Date.now() - started < 3000) {
      sendJson(res, 200, { ok: false, error: "wait" });
      return;
    }
    if (!last.name || !last.surname || !last.message || !last.email) {
      sendJson(res, 200, { ok: false, error: "invalid" });
      return;
    }
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }

  var file = safeFile(url.pathname);
  if (!file) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.stat(file, function (err, stat) {
    if (err || !stat.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    fs.readFile(file, function (readErr, buf) {
      if (readErr) {
        res.writeHead(500);
        res.end();
        return;
      }
      var ext = path.extname(file);
      var body = buf;
      if (ext === ".js") {
        body = Buffer.from(buf.toString("utf8").split(PLACEHOLDER).join(endpoint()));
      }
      res.writeHead(200, {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
        "Content-Length": body.length
      });
      if (req.method === "HEAD") res.end();
      else res.end(body);
    });
  });
});

server.listen(PORT, "127.0.0.1", function () {
  console.log("Mock contact server at http://127.0.0.1:" + PORT + "/");
  console.log("Served JavaScript posts to " + endpoint());
});
