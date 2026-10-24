# QR scan tracking (free: Cloudflare Workers + D1)

Every printed QR code opens a short link on the `parla-qr` Worker. The Worker writes the scan to the D1 database
`parla-tracking`, then sends the phone to the book's audio page. The page itself (`assets/js/track.js`) reports the
visit, each unit played and a tap on the Messenger button, tied to the scan that opened it.

```
phone scans QR ──> parla-qr.bavlywilliamwork.workers.dev/q/a2-book ──> scans table (time, code, city, device, new?)
                         │
                         └──302──> /Audio-Books-website/a2/?src=qr&q=a2-book&s=<scan id>
                                         │ track.js
                                         └──> /e ──> events table (view, play unit, messenger tap)
```

| QR code | Link | Opens |
|---|---|---|
| `qr/a2-book-scan-qr*.png/svg` | `…workers.dev/q/a2-book` | `/a2/` |
| `qr/a1-book-scan-qr*.png/svg` | `…workers.dev/q/a1-book` | `/a1/` |

A new placement needs no code change, only a new QR: `python tracking/make_qr.py a2-flyer-nov` (the part before
the first dash picks the book). Codes with `test` in the name are our own tests; the queries below leave them out.
The QR codes printed before 24 Oct open the old A1 page (the site root) directly: they show up as `a1-old` page
views, without scan details.

**Stored:** time, QR code, country, region, city (from Cloudflare), device, OS, browser, new or returning (a random
id in a cookie on the link, or in the page's local storage). **Not stored:** IP address, name, phone number, raw
user agent. The privacy page says so.

**Free limits (Cloudflare free plan):** Workers 100,000 requests/day; D1 100,000 rows written and 5 million read per
day, 5 GB. One scan = 1 Worker request + 1 row; one page visit ≈ 2-4 rows.

## Files
- `worker.js`: the Worker (deployed as `parla-qr`; binding `DB` → D1 `parla-tracking`).
- `schema.sql`: the two tables (already created).
- `make_qr.py`: makes the QR images.

## Reading the numbers (Cloudflare → Storage & databases → D1 → parla-tracking → Console)

Times are stored in UTC milliseconds. Egypt is UTC+3 until Thu 29 Oct 2026, then UTC+2: change `'+3 hours'`
to `'+2 hours'` from 30 Oct.

Scans per day and QR code, and how many were new phones:
```sql
SELECT date(ts/1000, 'unixepoch', '+3 hours') AS day, code, COUNT(*) AS scans, SUM(is_new) AS new_phones
FROM scans WHERE code NOT LIKE '%test%' GROUP BY day, code ORDER BY day DESC;
```

Unique phones per QR code (a phone that scans five times counts once):
```sql
SELECT code, COUNT(*) AS scans, COUNT(DISTINCT visitor) AS phones
FROM scans WHERE code NOT LIKE '%test%' GROUP BY code;
```

Where the scans come from, and on what:
```sql
SELECT country, city, COUNT(*) AS scans FROM scans WHERE code NOT LIKE '%test%' GROUP BY country, city ORDER BY scans DESC;
SELECT os, device, browser, COUNT(*) AS scans FROM scans WHERE code NOT LIKE '%test%' GROUP BY os, device, browser ORDER BY scans DESC;
```

The funnel per QR code: scanned → page opened → played at least one unit → tapped Messenger:
```sql
SELECT s.code,
       COUNT(DISTINCT s.id) AS scanned,
       COUNT(DISTINCT CASE WHEN e.type = 'view' THEN s.id END) AS opened,
       COUNT(DISTINCT CASE WHEN e.type = 'play' THEN s.id END) AS played,
       COUNT(DISTINCT CASE WHEN e.type = 'messenger' THEN s.id END) AS messenger
FROM scans s LEFT JOIN events e ON e.scan_id = s.id
WHERE s.code NOT LIKE '%test%' GROUP BY s.code;
```

Most played units (which recordings people actually use):
```sql
SELECT page, unit, COUNT(*) AS plays, COUNT(DISTINCT visitor) AS people
FROM events WHERE type = 'play' AND (scan_id IS NULL OR scan_id NOT IN (SELECT id FROM scans WHERE code LIKE '%test%'))
GROUP BY page, unit ORDER BY plays DESC;
```

Visits to the old A1 page (the QR codes printed before 24 Oct):
```sql
SELECT date(ts/1000, 'unixepoch', '+3 hours') AS day, COUNT(*) AS visits, COUNT(DISTINCT visitor) AS people
FROM events WHERE page = 'a1-old' AND type = 'view' GROUP BY day ORDER BY day DESC;
```
