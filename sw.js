const CACHE_NAME = 'tapago-cache-v1.1'; // Atualizado para forçar o download da nova imagem

// Ficheiros essenciais para guardar na memória do telemóvel
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './img/TaPago.png',
  './img/TaPagoOk.png'
];

// 1. Instalação: Guarda os ficheiros base no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Ficheiros guardados no cache com sucesso');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpa caches antigos (qualquer versão que não seja a CACHE_NAME atual)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceção (Fetch): Tenta carregar do cache primeiro, senão vai à internet
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no cache, devolve imediatamente (Offline)
        if (response) {
          return response;
        }

        // Se não encontrou, vai à internet e guarda no cache para a próxima vez
        return fetch(event.request).then(fetchResponse => {
          // Apenas guarda requisições válidas e não extensões do Chrome
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic' || event.request.url.startsWith('chrome-extension')) {
            return fetchResponse;
          }

          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return fetchResponse;
        });
      }).catch(() => {
        // Se estiver offline e não tiver o recurso no cache, falha silenciosamente
        console.log('Sem internet e recurso não encontrado no cache.');
      })
  );
});
