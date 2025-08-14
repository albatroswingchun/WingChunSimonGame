/* Wing Chun Simon – Service Worker */
const CACHE_NAME = "wcsimon-cache-v2";

/* Liste de fichiers minimum pour que l’appli démarre hors-ligne */
const ASSETS = [
  "/",                 // si ton hébergeur sert index.html à la racine
  "/index.html",
  "/manifest.webmanifest",

  // Icônes PWA
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",

  // Fonts (si tu veux les mettre en dur, sinon commentaire)
  // "https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap",
];

/* — Installation : on pré-cache le cœur de l’appli — */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* — Activation : on supprime les vieux caches — */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

/* — Stratégie de cache :
   - mêmes-origines (même domaine) → cache-first
   - autres domaines (CDN, Google Fonts, Imgur, etc.) → network-first avec repli cache
*/
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // On ne gère que GET
  if (req.method !== "GET") return;

  if (url.origin === self.location.origin) {
    // CACHE FIRST (fichiers statiques de ton site)
    event.respondWith(
      caches.match(req).then((res) => res || fetch(req).then((live) => {
        // met en cache à la volée
        const copy = live.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return live;
      }))
    );
  } else {
    // NETWORK FIRST (ressources externes)
    event.respondWith(
      fetch(req).then((live) => {
        const copy = live.clone();
        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        return live;
      }).catch(() => caches.match(req)) // si offline → version cache si dispo
    );
  }
});
