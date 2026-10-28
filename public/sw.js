// Service worker mínimo: só existe para o navegador reconhecer o app como
// instalável. Não guarda nada em cache, então o app sempre abre atualizado.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
