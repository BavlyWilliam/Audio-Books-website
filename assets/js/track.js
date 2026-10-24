// Parla Italiano: counts page visits, unit plays and Messenger taps for the QR tracking (tracking/worker.js).
// No cookies and no personal data: a random id in this browser's local storage tells new visitors from returning
// ones, and "s" (the scan id the QR link adds to the address) ties a visit to the scan that opened it.
(function () {
  var ENDPOINT = "https://parla-qr.bavlywilliamwork.workers.dev/e";
  var me = document.currentScript;
  var page = (me && me.getAttribute("data-page")) || "a2";
  var qs = new URLSearchParams(location.search);
  var scan = qs.get("s") || "";
  var src = qs.get("src") || (document.referrer ? "link" : "direct");

  function get(store, k) { try { return window[store].getItem(k); } catch (e) { return null; } }
  function put(store, k, v) { try { window[store].setItem(k, v); } catch (e) {} }

  var visitor = get("localStorage", "pi-vid");
  if (!visitor) {
    visitor = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    put("localStorage", "pi-vid", visitor);
  }
  if (scan) put("sessionStorage", "pi-scan", scan); else scan = get("sessionStorage", "pi-scan") || "";

  function send(type, unit) {
    var body = JSON.stringify({ t: type, p: page, u: unit || "", s: scan, v: visitor, src: src });
    try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return; } catch (e) {}
    try { fetch(ENDPOINT, { method: "POST", body: body, mode: "cors", keepalive: true }); } catch (e) {}
  }

  send("view");

  var played = {};
  [].forEach.call(document.querySelectorAll("audio"), function (a, i) {
    a.addEventListener("play", function () {
      var li = a.closest(".unit, [id^='unit-']");
      var unit = li && li.id ? li.id.replace("unit-", "") : String(i + 1);
      if (played[unit]) return;  // one play per unit per visit
      played[unit] = 1;
      send("play", unit);
    });
  });

  // The Messenger button: count the tap, and pass the scan id in the ref so a chat can be traced to its scan.
  [].forEach.call(document.querySelectorAll('a[href*="m.me/"]'), function (link) {
    if (scan) {
      try {
        var u = new URL(link.href);
        u.searchParams.set("ref", (u.searchParams.get("ref") || "AUDIO") + "-" + scan);
        link.href = u.toString();
      } catch (e) {}
    }
    link.addEventListener("click", function () { send("messenger"); });
  });
})();
