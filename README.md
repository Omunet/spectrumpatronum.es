# spectrumpatronum.es

## Events

The events page draws its own month view from [`events/events.json`](events/events.json). Visitors can only browse. An event shows the date, time, place, a map link, and a ticket link when there is one. Nothing on the page embeds Google Calendar, names it, or links to an event’s Google page.

To fill the calendar from Google Calendar, make that calendar public and put its id in [`events/calendar.json`](events/calendar.json):

```json
{ "calendarId": "your-id@group.calendar.google.com" }
```

Use the public calendar id, not a private ical secret. The workflow `.github/workflows/sync-calendar.yml` reads the public feed and rewrites `events.json`. It runs every hour and can be started by hand. While `calendarId` is empty, the example events already in `events.json` stay as they are.

You can also edit `events.json` by hand. The layout does not need to change.

Each event is one object:

```json
{
  "title": "Example event",
  "start": "2026-11-21T21:00:00",
  "end": "2026-11-22T02:00:00",
  "venue": "Example venue",
  "address": "Example address",
  "city": "Example city",
  "ticketUrl": "https://example.com/tickets",
  "description": "Optional short text.",
  "image": "/assets/events/optional.jpg",
  "imageAlt": "Optional description of the image."
}
```

`start` is the local date and time, written as `YYYY-MM-DDTHH:MM:SS`, with no timezone suffix. `end` is optional and uses the same form. `description`, `image`, and `imageAlt` are optional. `ticketUrl` is the ticket page. The site opens it in a new tab. A map link is built from the venue, address, and city.

The three entries already in the file are examples. Replace them when real dates are ready. Keep `"example": true` only on placeholders. That shows an Example label in the event details.
