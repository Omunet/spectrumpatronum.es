# Contact form web app

Google Apps Script web app for the website contact form. The inbox that receives messages is a script property. Do not put that address in this repository, in the page, or in a response from the script.

## Deploy

1. Open [Google Apps Script](https://script.google.com) while signed in to the association's Google account, and create a project.
2. Replace the default script with `Code.gs` from this folder.
3. In the Apps Script editor, open **Project settings** and add **Script properties**:
   - `RECIPIENT`: the inbox that should receive the messages. Set it only here.
   - `SHARED_SECRET` (optional): if this is set, each request must include the same value as `token`. Put that value in `FORM_TOKEN` in `js/main.js` and `test/js/main.js`. The page source is public, so this only stops clients that never read the script.
   - `ALLOWED_ORIGINS` (optional): comma-separated page origins. The live value is `https://spectrumpatronum.es`, `https://www.spectrumpatronum.es` and `https://omunet.github.io`. The page sends `location.origin`.
4. Choose **Deploy**, then **New deployment**. Click the gear, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
     (older editors call this "Anyone, even anonymous")
5. Authorize sending mail when Google asks. The script runs as the account you deploy with and only sends email.
6. Copy the web app URL that ends in `/exec` only if it changed.
7. `FORM_ENDPOINT` in `js/main.js` and `test/js/main.js` already points at the current deployment. Replace it only if a new deployment has a different URL.

After editing `Code.gs`, open **Deploy**, **Manage deployments**, edit the web app, and select **New version**. That keeps the same `/exec` URL. You redeploy the script yourself; this repository does not deploy it.

The site stores nothing. If `UPLOAD_FOLDER_ID` is still set, you can delete that property; the script does not read it. Each accepted message is mailed to `RECIPIENT`, with the visitor's address as reply-to. The subject starts with `[Formulari web]` and the sender's name. The body says the message came from the website contact form and includes the fields, the page language, and the time in Europe/Madrid. Uploaded files are attachments on that email, not links.

The page posts JSON as `text/plain`, so the browser does not send a CORS preflight. Apps Script answers with a redirect. The page follows it and reads `{"ok":true}` or `{"ok":false,"error":"..."}`. The error is a short code (`wait`, `rate`, `busy`, `size`, `too_large`, `invalid`, or `server`). The response does not include an inbox address.

Limits, checked on the raw file bytes: each file and the whole submission must be at most 18 MB. The request body cap is 30 MB so the base64 form of an 18 MB file still fits. Images, video (including mp4) and PDF are accepted only when both the type and the extension match. The message is limited to 4000 characters. Surname and phone may be empty. If `MailApp.getRemainingDailyQuota()` is 0, the script returns `busy` and sends nothing. If `sendEmail` throws because the message is too large, it returns `too_large`. Work stops with `busy` if it runs past five and a half minutes, inside Apps Script's six-minute limit.

Spam checks, with no third-party captcha: a honeypot field named `company`, a minimum of about 3 seconds between opening the form and sending, and CacheService counters (not Script Properties) of about 5 messages per hour for the same visitor address and about 100 per hour overall.

`MailApp` sends as the deploying account. Consumer Google accounts can send on the order of 100 messages a day. When that quota is used up, the visitor is asked to try again later. Nothing is kept on the site.

Opening the `/exec` URL in a browser runs `doGet` and returns `{"ok":true}`. That check does not show the script properties.

## Local mock

No Google account is needed to try the form.

```bash
node form-backend/mock-server.js
```

Open `http://127.0.0.1:8787/`. The server rewrites `FORM_ENDPOINT` only in the JavaScript it serves, so the page posts to this mock instead of the deployed web app. The file in the repository is unchanged.

The mock follows the Apps Script redirect: `POST /exec` responds with `302` to `/done`, and `/done` returns JSON. The terminal prints the sender's name, the page language, and the file names. It does not have an inbox address and does not print one.

Wait about three seconds after opening the form before sending. A filled honeypot is reported as success and dropped. A post that arrives too quickly returns `{"ok":false,"error":"wait"}`.
