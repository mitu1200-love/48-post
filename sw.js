// キャッシュ名。ファイルの中身を大きく更新したときは、この数字を
// 1つ上げてください（例: v1 → v2）。上げると古いキャッシュが破棄され、
// 全ユーザーの端末で新しい内容に更新されます。
const CACHE_NAME = "setlist-app-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./members.js",
  "./songs.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// stale-while-revalidate: まずキャッシュを即返し、裏側で最新版を取りに行って
// 次回アクセス用に保存する。オフラインでも開けて、オンライン時は自然に更新される。
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) cache.put(event.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
