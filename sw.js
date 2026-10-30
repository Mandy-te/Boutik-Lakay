/* ============================================================
   Boutique Lakay — service worker

   Deux raisons d'exister, dans cet ordre :
   1. La data mobile coûte cher en Haïti. Le squelette de l'app ne
      doit se télécharger qu'une fois.
   2. C'est la condition pour que l'app s'installe sur l'écran
      d'accueil, et plus tard pour qu'elle passe en magasin Android
      et iOS sans réécriture.

   Règle de prudence : on ne met JAMAIS en cache les requêtes
   Supabase. Un prix, un stock ou une commande servis depuis un
   cache périmé, c'est un litige au comptoir. Les données ont leur
   propre cache de secours, explicite, dans api.js.
   ============================================================ */

const VERSION = 'bl-v1.0.0';

const SQUELETTE = [
  './',
  './index.html',
  './config.js',
  './payments.js',
  './api.js',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(VERSION).then(function (c) {
      // addAll échoue en entier si un seul fichier manque : on tolère.
      return Promise.all(SQUELETTE.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (k) {
        return k === VERSION ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  const req = ev.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Supabase, et tout ce qui porte des données : jamais de cache ici.
  if (url.hostname.indexOf('supabase') !== -1) return;

  // Polices et librairie : cache-first, elles ne changent pas.
  if (url.hostname.indexOf('fonts.g') !== -1 || url.hostname.indexOf('jsdelivr') !== -1) {
    ev.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (rep) {
          if (rep && rep.status === 200) {
            const copie = rep.clone();
            caches.open(VERSION).then(function (c) { c.put(req, copie); });
          }
          return rep;
        });
      })
    );
    return;
  }

  // Le reste (nos propres fichiers) : on sert le cache tout de suite
  // et on rafraîchit en arrière-plan, pour que l'app s'ouvre même
  // sans réseau et reste à jour dès qu'il revient.
  if (url.origin === self.location.origin) {
    ev.respondWith(
      caches.match(req).then(function (hit) {
        const reseau = fetch(req).then(function (rep) {
          if (rep && rep.status === 200) {
            const copie = rep.clone();
            caches.open(VERSION).then(function (c) { c.put(req, copie); });
          }
          return rep;
        }).catch(function () {
          return hit || caches.match('./index.html');
        });
        return hit || reseau;
      })
    );
  }
});
