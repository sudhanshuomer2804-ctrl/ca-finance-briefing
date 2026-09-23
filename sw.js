const CACHE_NAME = "ca-finance-briefing-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
  );

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

  const request = event.request;

  /*
   * HTML navigation:
   * ALWAYS try the network first.
   * This prevents GitHub Pages from serving
   * an old cached index.html.
   */

  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, copy);
            });

          return response;

        })
        .catch(() => {

          return caches.match(request)
            .then(cached => {

              return cached ||
                caches.match("./index.html");

            });

        })

    );

    return;
  }


  /*
   * Other assets:
   * Cache first, then network.
   */

  event.respondWith(

    caches.match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {

            if (
              response &&
              response.status === 200 &&
              response.type === "basic"
            ) {

              const copy =
                response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, copy);
                });

            }

            return response;

          });

      })

  );

});


/* =========================================================
   PUSH NOTIFICATIONS
========================================================= */

self.addEventListener("push", event => {

  let data = {};

  try {

    data =
      event.data
        ? event.data.json()
        : {};

  } catch (error) {

    data = {
      title: "CA Finance Briefing",
      body: event.data
        ? event.data.text()
        : "New briefing available."
    };

  }


  const title =
    data.title ||
    "CA Finance Briefing";


  const options = {

    body:
      data.body ||
      "Your latest finance briefing is ready.",

    icon:
      data.icon ||
      "./icon.svg",

    badge:
      data.badge ||
      "./icon.svg",

    data: {
      url:
        data.url ||
        "./"
    },

    tag: "ca-finance-briefing",

    renotify: true

  };


  event.waitUntil(

    self.registration.showNotification(
      title,
      options
    )

  );

});


/* =========================================================
   NOTIFICATION CLICK
========================================================= */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const targetUrl =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./";


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(clientList => {

        for (
          const client of clientList
        ) {

          if (
            "focus" in client
          ) {

            client.navigate(
              targetUrl
            );

            return client.focus();

          }

        }


        if (
          clients.openWindow
        ) {

          return clients.openWindow(
            targetUrl
          );

        }

      })

    );

  }
);
