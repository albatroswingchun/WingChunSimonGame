const CACHE_NAME = "wcsimon-cache-v2";          // ← incrémente si tu modifies des fichiers
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  // ajoute ici tes images/sons/JS importants pour le offline
];

// Installation : pré-cache + prise en main immédiate
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activation : nettoyage des vieux caches + contrôle clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Réseau avec cache (cache falling back to network)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).catch(() => {
        // Fallback navigation hors-ligne : renvoie index.html pour les SPA
        if (req.mode === "navigate") return caches.match("./index.html");
      })
    )
  );
});
