// parla-qr: tracked QR links and page events for Parla Italiano (Cloudflare Workers + D1, free tier).
//
//   GET  /q/<code>   a QR scan: saved to D1, then a redirect to the book's audio page.
//                    <code> = <book>-<where>, e.g. a2-book, a1-book, a2-flyer-nov. The part before the first
//                    dash picks the page; anything after it names where the QR was printed.
//   POST /e          a page event sent by the audio pages: view, play (a unit), messenger (the Messenger button).
//   GET  /health     "ok"
//
// Stored per scan: time, which QR, country/region/city (from Cloudflare), device, OS, browser, and whether this
// phone scanned before (a random id in a cookie on this link only). No IP address, no name, no raw user agent.
// Needs a D1 binding named DB (Settings → Bindings).

const PAGES = {
  a1: "https://bavlywilliam.github.io/Audio-Books-website/a1/",
  a2: "https://bavlywilliam.github.io/Audio-Books-website/a2/",
};
const FALLBACK = "https://bavlywilliam.github.io/Audio-Books-website/";
const PAGE_ORIGIN = "https://bavlywilliam.github.io";
const COOKIE = "pq_vid";
const EVENT_TYPES = new Set(["view", "play", "messenger"]);
const EVENT_PAGES = new Set(["a1", "a2", "a1-old"]);
// Link previews (WhatsApp, Facebook, Telegram...) and crawlers are not people scanning a code.
const BOT_RE = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|slack|discord|curl|wget|python|headless/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/health") return new Response("ok", { headers: { "cache-control": "no-store" } });
    if (path.startsWith("/q/") && (request.method === "GET" || request.method === "HEAD")) {
      return scan(request, env, ctx, decodeURIComponent(path.slice(3)).toLowerCase());
    }
    if (path === "/e") {
      if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }), request);
      if (request.method === "POST") return pageEvent(request, env, ctx);
    }
    return Response.redirect(FALLBACK, 302);
  },
};

async function scan(request, env, ctx, code) {
  code = code.replace(/[^a-z0-9-]/g, "").slice(0, 40) || "unknown";
  const book = code.split("-")[0];
  const page = PAGES[book] || FALLBACK;
  const ua = request.headers.get("user-agent") || "";
  const isBot = request.method === "HEAD" || BOT_RE.test(ua);
  const cookie = readCookie(request.headers.get("cookie") || "", COOKIE);
  const visitor = cookie || randomId(16);
  const scanId = randomId(10);
  const target = new URL(page);
  target.searchParams.set("src", "qr");
  target.searchParams.set("q", code);
  if (!isBot) target.searchParams.set("s", scanId);
  const headers = new Headers({ location: target.toString(), "cache-control": "no-store" });
  if (!isBot) {
    headers.append("set-cookie", `${COOKIE}=${visitor}; Max-Age=34560000; Path=/; Secure; HttpOnly; SameSite=Lax`);
    const cf = request.cf || {};
    const d = device(ua);
    ctx.waitUntil(env.DB.prepare(
      "INSERT INTO scans (id, ts, code, target, visitor, is_new, country, region, city, device, os, browser) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(scanId, Date.now(), code, PAGES[book] ? book : "unknown", visitor, cookie ? 0 : 1,
           cf.country || null, cf.region || null, cf.city || null, d.device, d.os, d.browser).run()
      .catch((e) => console.log("scan insert failed", e && e.message)));
  }
  return new Response(null, { status: 302, headers });
}

async function pageEvent(request, env, ctx) {
  const origin = request.headers.get("origin") || "";
  if (origin && origin !== PAGE_ORIGIN) return cors(new Response("origin", { status: 403 }), request);
  let body;
  try {
    body = JSON.parse((await request.text()).slice(0, 2000));
  } catch (_) {
    return cors(new Response("bad json", { status: 400 }), request);
  }
  const type = String(body.t || "");
  const page = String(body.p || "");
  if (!EVENT_TYPES.has(type) || !EVENT_PAGES.has(page)) return cors(new Response("bad event", { status: 400 }), request);
  const clean = (v, n) => (v == null || v === "" ? null : String(v).replace(/[^A-Za-z0-9_-]/g, "").slice(0, n) || null);
  const ua = request.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) return cors(new Response(null, { status: 204 }), request);
  const cf = request.cf || {};
  const d = device(ua);
  ctx.waitUntil(env.DB.prepare(
    "INSERT INTO events (ts, type, page, unit, scan_id, visitor, src, country, device, os) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(Date.now(), type, page, clean(body.u, 4), clean(body.s, 20), clean(body.v, 32), clean(body.src, 20),
         cf.country || null, d.device, d.os).run()
    .catch((e) => console.log("event insert failed", e && e.message)));
  return cors(new Response(null, { status: 204 }), request);
}

function cors(response, request) {
  const origin = request.headers.get("origin");
  response.headers.set("access-control-allow-origin", origin === PAGE_ORIGIN ? PAGE_ORIGIN : PAGE_ORIGIN);
  response.headers.set("access-control-allow-methods", "POST, OPTIONS");
  response.headers.set("access-control-allow-headers", "content-type");
  response.headers.set("cache-control", "no-store");
  return response;
}

function device(ua) {
  const os = /android/i.test(ua) ? "Android" : /iphone|ipad|ipod/i.test(ua) ? "iOS" : /windows/i.test(ua) ? "Windows"
    : /mac os/i.test(ua) ? "Mac" : /linux/i.test(ua) ? "Linux" : "Other";
  const tablet = /ipad|tablet/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua));
  const mobile = !tablet && /mobi|iphone|android/i.test(ua);
  const browser = /fban|fbav|instagram/i.test(ua) ? "Facebook/Instagram app" : /edg\//i.test(ua) ? "Edge"
    : /samsungbrowser/i.test(ua) ? "Samsung" : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari"
    : /firefox|fxios/i.test(ua) ? "Firefox" : "Other";
  return { device: tablet ? "tablet" : mobile ? "mobile" : "desktop", os, browser };
}

function readCookie(header, name) {
  const m = header.match(new RegExp("(?:^|;\\s*)" + name + "=([A-Za-z0-9]{8,40})"));
  return m ? m[1] : null;
}

function randomId(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, bytes * 2);
}
