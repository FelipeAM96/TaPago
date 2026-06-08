const CACHE_NAME = 'financas-app-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './img/PatoPay_Transparente.png'
  // Bibliotecas como Tailwind e Chart.js são cacheadas em runtime, 
  // mas o shell principal é salvo aqui.
];

// Instalação: Salva os arquivos iniciais no cache do celular
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos se houver atualizações
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Interceptador de requisições: Responde com cache se offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Retorna do cache se encontrar, senão vai para a rede
      return cachedResponse || fetch(event.request);
    })
  );
});
