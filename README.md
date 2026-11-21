# spectrumpatronum.es

Static website of Associació Spectrum Patronum, published with GitHub Pages. Every page is in Spanish, Catalan and English.

## Pages

- **Home** (`index.html`): the association.
- **Projects** (`projects/`): the association's projects. Edit `projects/index.html` to add one; images go in `assets/projects/`.
- **Events** (`events/`): a month calendar filled from the association's public Google Calendar.
- **Privacy** (`privacidad.html`): the privacy policy.
- **Test** (`test/`): a hidden preview copy of the home page, not indexed by search engines.

## Events

Add, change or delete events in the Google Calendar of **spectrumpatronumbcn** called "Events (Public)". The site updates on its own.

- **Location** becomes the "Ver en el mapa" link.
- A link in the **description** becomes the "Entradas" button and is removed from the text.

The calendar ID and API key are in `events/config.js`. The key is public on purpose. Keep it restricted in Google Cloud to the Calendar API and to `spectrumpatronum.es`.

## Contact form

The contact form opens from the home, projects and events pages. It sends an email through a Google Apps Script web app. See [`form-backend/README.md`](form-backend/README.md).
