# Contact form web app

Google Apps Script web app for the website contact form. The inbox that receives messages is a script property. Do not put that address in this repository, in the page, or in a response from the script.

## Deploy

1. Open [Google Apps Script](https://script.google.com) while signed in to the association's Google account, and create a project.
2. Replace the default script with `Code.gs` from this folder.
3. In Google Drive, create a folder `SP` and, inside it, a folder `Formulari web uploads`. Open that folder and copy its id from the address bar (`https://drive.google.com/drive/folders/FOLDER_ID`).
4. In the Apps Script editor, open **Project settings** and add **Script properties**:
   - `RECIPIENT`: the inbox that should receive the messages. Set it only here.
   - `UPLOAD_FOLDER_ID`: the id of the `Formulari web uploads` folder.
   - `SHARED_SECRET` (optional): if this is set, each request must include the same value as `token`. Put that value in `FORM_TOKEN` in `js/main.js` and `test/js/main.js`. The page source is public, so this only stops clients that never read the script.
   - `ALLOWED_ORIGINS` (optional): comma-separated page origins, for example `https://spectrumpatronum.es`. Leave it empty until you want the check. The page sends `location.origin`; a client can still invent that field.
5. Choose **Deploy**, then **New deployment**. Click the gear, choose **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
     (older editors call this "Anyone, even anonymous")
6. Authorize send-mail and Drive access when Google asks. The script runs as the account you deploy with, and that account must be able to write to the Drive folder.
7. Copy the web app URL that ends in `/exec`.
8. Put that URL in `FORM_ENDPOINT` in `js/main.js` and `test/js/main.js`, in place of the `REPLACE_WITH_DEPLOYMENT_ID` placeholder.

After later edits to `Code.gs`, open **Deploy**, **Manage deployments**, edit the web app, and select **New version**. Updating the existing deployment keeps the same `/exec` URL.

The page posts JSON with `Content-Type: text/plain` so the browser does not send a CORS preflight. Apps Script answers that POST with a redirect. The page follows the redirect and reads the final JSON: `{"ok":true}` or `{"ok":false,"error":"..."}`. The error is a short code (`wait`, `rate`, `size`, `invalid`, or `server`). The response does not include an inbox address.

Each accepted message is mailed to `RECIPIENT`. **Reply-to** is the address the visitor typed. The subject starts with `[Formulari web]` and the sender's name. The body says the message came from the website contact form and includes an HTML table of the fields, the page language, and the time in Europe/Madrid.

Files are saved in Drive at `SP/Formulari web uploads/<date>-<name>`, and the email includes those links, so a large video can still be opened if it is not attached. Files are also attached when the total is within about 20 MB. A second send without attachments is used only if attaching fails.

Spam checks, with no third-party captcha: a honeypot field named `company`, a minimum of about 3 seconds between opening the form and sending, field and file checks (email shape, lengths, image / video / PDF types, 20 MB total, up to 10 files), and CacheService limits of about 5 messages per hour for the same visitor address and about 100 per hour overall.

`MailApp` sends as the deploying account. Consumer Google accounts can send on the order of 100 messages a day.

Opening the `/exec` URL in a browser runs `doGet` and returns `{"ok":true}`. That check does not show the script properties.

## Local mock

No Google account is needed to try the form.

```bash
node form-backend/mock-server.js
```

Open `http://127.0.0.1:8787/`. The server rewrites the placeholder `FORM_ENDPOINT` only in the JavaScript it serves, so the page posts to this mock. The file in the repository stays a placeholder.

The mock follows the Apps Script redirect: `POST /exec` responds with `302` to `/done`, and `/done` returns JSON. The terminal prints the sender's name, the page language, and the file names. It does not have an inbox address and does not print one.

Wait about three seconds after opening the form before sending. A filled honeypot is reported as success and dropped. A post that arrives too quickly returns `{"ok":false,"error":"wait"}`.
