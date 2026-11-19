#!/usr/bin/env python3
"""Copy a public Google Calendar into events/events.json.

The site reads only that file. Visitors never see Google Calendar.
Leave calendarId empty to keep the example events already in events.json.
"""

import argparse
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
CALENDAR_FILE = ROOT / "calendar.json"
EVENTS_FILE = ROOT / "events.json"
MADRID = ZoneInfo("Europe/Madrid")
UTC = ZoneInfo("UTC")
WINDOW_PAST = timedelta(days=60)
WINDOW_FUTURE = timedelta(days=730)


def load_calendar_id(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    calendar_id = data.get("calendarId") if isinstance(data, dict) else ""
    return str(calendar_id or "").strip()


def fetch_ics(calendar_id):
    quoted = urllib.request.quote(calendar_id, safe="")
    url = "https://calendar.google.com/calendar/ical/%s/public/basic.ics" % quoted
    request = urllib.request.Request(url, headers={"User-Agent": "spectrumpatronum-calendar-sync"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "replace")


def unfold(text):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    return re.sub(r"\n[ \t]", "", text)


def unescape(value):
    return (
        value.replace("\\n", "\n")
        .replace("\\N", "\n")
        .replace("\\,", ",")
        .replace("\\;", ";")
        .replace("\\\\", "\\")
    )


def parse_prop(line):
    if ":" not in line:
        return None
    head, value = line.split(":", 1)
    parts = head.split(";")
    name = parts[0].upper()
    params = {}
    for part in parts[1:]:
        if "=" in part:
            key, raw = part.split("=", 1)
            params[key.upper()] = raw
    return name, params, unescape(value)


def parse_when(params, value):
    if params.get("VALUE", "").upper() == "DATE" or (len(value) == 8 and "T" not in value):
        return datetime.strptime(value[:8], "%Y%m%d"), True
    stamp = value[:15]
    if value.endswith("Z"):
        moment = datetime.strptime(stamp, "%Y%m%dT%H%M%S").replace(tzinfo=UTC).astimezone(MADRID)
        return moment.replace(tzinfo=None), False
    return datetime.strptime(stamp, "%Y%m%dT%H%M%S"), False


def is_google_calendar_url(url):
    match = re.match(r"^https?://([^/?#]+)([^?#]*)", url.strip(), re.I)
    if not match:
        return False
    host = re.sub(r"^www\.", "", match.group(1).lower())
    path = match.group(2) or ""
    if host == "calendar.google.com":
        return True
    if host == "google.com" or host.endswith(".google.com"):
        if re.search(r"/calendar", path, re.I):
            return True
    return False


def clean_description(text):
    if not text:
        return ""
    def drop(match):
        return "" if is_google_calendar_url(match.group(0)) else match.group(0)
    text = re.sub(r"https?://[^\s)]+", drop, text, flags=re.I)
    lines = []
    for line in text.splitlines():
        if re.search(r"google calendar", line, re.I):
            continue
        lines.append(line.rstrip())
    text = "\n".join(lines)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def ticket_url(description):
    if not description:
        return ""
    for match in re.finditer(r"https://[^\s)]+", description, re.I):
        url = match.group(0).rstrip(".,;")
        if not is_google_calendar_url(url):
            return url
    return ""


def description_without_ticket(description, url):
    if not description or not url:
        return description or ""
    text = description.replace(url, "")
    text = re.sub(r"(?im)^\s*(tickets?|entradas?|entrades?|tiquets?)\s*:?\s*$", "", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def format_stamp(moment, all_day):
    if all_day:
        return moment.strftime("%Y-%m-%d")
    return moment.strftime("%Y-%m-%dT%H:%M:%S")


def event_blocks(text):
    for chunk in unfold(text).split("BEGIN:VEVENT"):
        if "END:VEVENT" not in chunk:
            continue
        body = chunk.split("END:VEVENT", 1)[0]
        props = {}
        for line in body.split("\n"):
            parsed = parse_prop(line.strip())
            if not parsed:
                continue
            name, params, value = parsed
            props.setdefault(name, []).append((params, value))
        yield props


def first(props, name):
    values = props.get(name) or []
    return values[0] if values else (None, "")


def to_record(props, now):
    status = (first(props, "STATUS")[1] or "").upper()
    if status == "CANCELLED":
        return None
    klass = (first(props, "CLASS")[1] or "").upper()
    if klass == "PRIVATE":
        return None
    start_params, start_value = first(props, "DTSTART")
    if not start_value:
        return None
    start, all_day = parse_when(start_params or {}, start_value)
    end_params, end_value = first(props, "DTEND")
    end = None
    if end_value:
        end, end_all_day = parse_when(end_params or {}, end_value)
        if all_day or end_all_day:
            end = end - timedelta(days=1)
            if end.date() <= start.date():
                end = None
    if start < now - WINDOW_PAST or start > now + WINDOW_FUTURE:
        return None
    title = (first(props, "SUMMARY")[1] or "").strip() or "Event"
    location = (first(props, "LOCATION")[1] or "").strip()
    raw_description = clean_description(first(props, "DESCRIPTION")[1] or "")
    ticket = ticket_url(raw_description)
    description = description_without_ticket(raw_description, ticket)
    record = {
        "title": title,
        "start": format_stamp(start, all_day),
    }
    if end:
        record["end"] = format_stamp(end, all_day)
    if location:
        record["venue"] = location
    if ticket:
        record["ticketUrl"] = ticket
    if description:
        record["description"] = description
    if all_day:
        record["allDay"] = True
    return record


def sync(calendar_id, destination, now=None):
    now = now or datetime.now(MADRID).replace(tzinfo=None)
    ics = fetch_ics(calendar_id)
    records = []
    for props in event_blocks(ics):
        record = to_record(props, now)
        if record:
            records.append(record)
    records.sort(key=lambda item: item["start"])
    destination.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(records)


def main(argv):
    parser = argparse.ArgumentParser(description="Fill events.json from a public Google Calendar.")
    parser.add_argument("--calendar-id", default="")
    parser.add_argument("--out", type=Path, default=EVENTS_FILE)
    args = parser.parse_args(argv)
    calendar_id = args.calendar_id.strip() or load_calendar_id(CALENDAR_FILE)
    if not calendar_id:
        print("No calendarId in events/calendar.json; leaving events.json unchanged.")
        return 0
    count = sync(calendar_id, args.out)
    print("Wrote %s events to %s" % (count, args.out))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
