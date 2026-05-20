const CACHE_NAME = 'qb-imgs-v1';

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 只拦截图片请求（路径含 /img/）
  if (!url.includes('/img/')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      // 缓存未命中，带认证头请求 R2
      const authHeader = event.request.headers.get('X-Auth-Token');
      const req = authHeader
        ? event.request
        : new Request(event.request.url, {
            headers: event.request.headers,
          });

      const response = await fetch(req);
      if (response.ok) {
        cache.put(event.request.url, response.clone());
      }
      return response;
    }).catch(() => fetch(event.request))
  );
});

// 旧版本 SW 清理
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
