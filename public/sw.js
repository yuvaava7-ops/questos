// Minimal service worker: makes QuestOS installable and shows a friendly page
// when the device is offline. Game data is always fetched live (no caching),
// so quests and XP can never be stale.
const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QuestOS - offline</title><style>html,body{height:100%;margin:0;background:#0b0820;color:#f4f1ff;font-family:monospace;display:flex;align-items:center;justify-content:center;text-align:center}h1{color:#ffd24a;font-size:18px;letter-spacing:.1em}p{color:#b9b4e6;max-width:30ch;line-height:1.5}</style></head><body><div><h1>NO SIGNAL</h1><p>You are offline. Reconnect to continue your quest.</p></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () => new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    ),
  );
});
