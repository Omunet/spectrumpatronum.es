# spectrumpatronum.es

## Events

Public events are listed in [`events/events.json`](events/events.json). The events page reads that file and builds the month view. There is no login and nothing for visitors to edit. Change the file, then commit it. The layout does not need to change.

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
