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

// À incrémenter à chaque mise en ligne : c'est ce numéro qui purge
// l'ancien cache. Sans ça, un correctif reste invisible sur les
// téléphones qui ont déjà ouvert l'app une fois.
const VERSION = 'bl-v2.9.1';

const SQUELETTE = [
  './',
  './index.html',
  './config.js',
  './payments.js',
  './api.js',
  './haiti.js',
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

  // Nos propres fichiers : le RÉSEAU D'ABORD, le cache en secours.
  //
  // L'inverse (cache d'abord, rafraîchi en arrière-plan) économise de la
  // data, mais il rend chaque correctif invisible pendant un chargement :
  // on corrige un bug, l'utilisateur recharge, et il revoit le bug. En
  // phase de mise au point c'est insupportable, et le squelette ne pèse
  // que quelques dizaines de kilooctets. Hors ligne, le cache prend le
  // relais exactement comme avant.
  if (url.origin === self.location.origin) {
    ev.respondWith(
      fetch(req).then(function (rep) {
        if (rep && rep.status === 200) {
          const copie = rep.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copie); });
        }
        return rep;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          if (hit) return hit;
          // Replier sur l'accueil seulement pour une navigation : sinon un
          // agent hors ligne recevrait l'app publique à l'URL de gestion.
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        });
      })
    );
  }
});
