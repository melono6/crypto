'use strict';
const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    'index.html',
    './', // Alias for index.html
    '/',
    'offline.html',
    'assets/css/styles.css',
    'assets/js/index.js'
];

const devEnvs = [
    'http://localhost:8000'
];

const extensionCache = [
    'css',
    'js',
    'png',
    'gif',
    'json',
    'svg',
    'mp4',
    'ogg',
    'webp',
    'webm'
];

const DEBUG = devEnvs.indexOf(self.location.origin) > -1 ? true : false;

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => cache.addAll(PRECACHE_URLS))
        .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function (event) {
    let extension = event.request.url.split('.').pop();
    
    if (event.request.url.startsWith(self.location.origin) && event.request.method === 'GET' && !DEBUG) {
        var requestURL = new URL(event.request.url);
        var freshResource = fetch(event.request).then(function (response) {
            var clonedResponse = response.clone();
            // Don't update the cache with error pages!
            if (response.ok) {
                // All good? Update the cache with the network response
                caches.open(RUNTIME).then(function (cache) {
                    cache.put(event.request, clonedResponse);
                });
            }
            return response;
        }).catch(() => {
            return cache.match('offline.html');
        });
        var cachedResource = caches.open(RUNTIME).then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || freshResource;
            });
        }).catch(function (e) {
            return freshResource;
        });
        event.respondWith(cachedResource);
    }
});
