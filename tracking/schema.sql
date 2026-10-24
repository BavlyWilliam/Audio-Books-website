-- Parla Italiano QR tracking (Cloudflare D1, free tier). One row per QR scan, one row per page event.
-- No IP addresses and no names are stored: a visitor is a random id kept in a cookie (scans) or in the
-- page's local storage (events).
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  code TEXT NOT NULL,
  target TEXT NOT NULL,
  visitor TEXT NOT NULL,
  is_new INTEGER NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT
);
CREATE INDEX IF NOT EXISTS scans_ts ON scans(ts);
CREATE INDEX IF NOT EXISTS scans_code ON scans(code);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  type TEXT NOT NULL,
  page TEXT NOT NULL,
  unit TEXT,
  scan_id TEXT,
  visitor TEXT,
  src TEXT,
  country TEXT,
  device TEXT,
  os TEXT
);
CREATE INDEX IF NOT EXISTS events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS events_scan ON events(scan_id);
