# spectrumpatronum.es

## Events

The events page is the site’s own month view. It reads the public Google Calendar of the **spectrumpatronumbcn** account in the browser. Visitors can only browse. An event shows the date, time, place, a map link, and a ticket link when the description contains one. The page does not embed Google Calendar and does not link to an event’s Google page.

Until the two values in [`events/config.js`](events/config.js) are filled in, every month shows “No hay eventos este mes.” That file is the only configuration spot.

### 1. Make the calendar public

1. Sign in to Google Calendar as **spectrumpatronumbcn**.
2. Open the calendar that should appear on the site.
3. Go to **Settings → Access permissions for events**.
4. Turn on **Make available to public**.
5. Choose **See all event details**.

### 2. Copy the Calendar ID

1. In that same calendar’s settings, open **Integrate calendar**.
2. Copy **Calendar ID**.
3. Paste it into `calendarId` in `events/config.js`, replacing `YOUR_CALENDAR_ID`.

### 3. Create a browser API key

The public ICS feed cannot be read from the page (the browser blocks it). The page uses Calendar API `events.list` instead, which needs a browser key.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or choose a project.
2. Enable **Google Calendar API**.
3. Go to **APIs & Services → Credentials → Create credentials → API key**.
4. Edit the key. Under **Application restrictions**, choose **HTTP referrers** and add:
   - `https://spectrumpatronum.es/*`
   - `https://www.spectrumpatronum.es/*`
5. Under **API restrictions**, restrict the key to **Google Calendar API**.
6. Paste the key into `apiKey` in `events/config.js`, replacing `YOUR_BROWSER_API_KEY`.

Reload the site. Events from about one month back through the following year appear on their days.

### 4. Add an event

Create the event in that Google Calendar.

- **Title** is the name on the calendar.
- **Start** and **end** are the date and time. An all-day event stays all day.
- **Location** is the venue. The page turns it into the map link.
- **Description** can hold the ticket link. Put it on its own line, for example `Tickets: https://example.com/tickets`. If there is no line like that, the first URL in the description is used. The link opens in a new tab.

Nothing else in the layout needs to change, and there is no login on the site.
