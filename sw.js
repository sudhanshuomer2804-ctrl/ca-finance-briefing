const CACHE_NAME = "ca-finance-briefing-v2026-09-23-2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];


/* INSTALL */

self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)
      .then(cache =>
        cache.addAll(CORE_ASSETS)
      )

  );

  self.skipWaiting();

});


/* ACTIVATE */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()
      .then(keys =>

        Promise.all(

          keys
            .filter(key =>
              key !== CACHE_NAME
            )
            .map(key =>
              caches.delete(key)
            )

        )

      )

  );

  self.clients.claim();

});


/* FETCH */

self.addEventListener("fetch", event => {

  const request = event.request;

  /*
   * Never cache Google Apps Script API calls.
   * This is critical because the briefing must remain current.
   */

  if (
    request.url.includes("script.google.com") ||
    request.url.includes("script.googleusercontent.com")
  ) {

    event.respondWith(
      fetch(request)
    );

    return;

  }


  /*
   * Navigation:
   * Network first, then cached index.
   */

  if (
    request.mode === "navigate"
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          const copy =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache =>
              cache.put(
                request,
                copy
              )
            );

          return response;

        })
        .catch(() =>
          caches.match(
            "./index.html"
          )
        )

    );

    return;

  }


  /*
   * Static assets:
   * Cache first.
   */

  event.respondWith(

    caches
      .match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request);

      })

  );

});


/* PUSH NOTIFICATIONS */

self.addEventListener(
  "push",
  event => {

    let data = {};

    try {

      data =
        event.data
          ? event.data.json()
          : {};

    } catch (error) {

      data = {
        title: "CA Finance Briefing",
        body: "New briefing available."
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
        "./icon.svg",

      badge:
        "./icon.svg",

      data:
        data.url ||
        "./"

    };


    event.waitUntil(

      self.registration.showNotification(
        title,
        options
      )

    );

  }
);


/* NOTIFICATION CLICK */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const target =
      event.notification.data ||
      "./";


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(clientList => {

        for (const client of clientList) {

          if (
            "focus" in client
          ) {

            client.navigate(target);

            return client.focus();

          }

        }

        if (
          clients.openWindow
        ) {

          return clients.openWindow(
            target
          );

        }

      })

    );

  }
);
