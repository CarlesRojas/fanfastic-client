/* eslint-disable no-restricted-globals */

console.log("Service worker loaded");

// #################################################
//   OFFLINE FALLBACK
// #################################################

const CACHE_NAME = "offline";
const OFFLINE_URL = "offline.html";

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
        })()
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            if ("navigationPreload" in self.registration) {
                await self.registration.navigationPreload.enable();
            }
        })()
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            (async () => {
                try {
                    // First, try to use the navigation preload response if it's supported.
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) return preloadResponse;

                    // Always try the network first.
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(OFFLINE_URL);
                    return cachedResponse;
                }
            })()
        );
    }
});

// #################################################
//   PUSH NOTIFICATIONS
// #################################################

self.addEventListener("push", function (event) {
    event.waitUntil(
        self.registration.pushManager.getSubscription().then(function () {
            return fetch("url").then(function () {
                if (!(self.Notification && self.Notification.permission === "granted")) return;

                const data = event.data.json();

                var title = "Check your progress!";
                var body = "Check the app to see how you are doing.";
                var tag = "error";
                var icon = "/logo512.png";

                //   STOP FASTING
                // #################################################
                if (data.id === "stopFasting") {
                    title = "Time to stop fasting!";
                    body = "Congrats on reaching your fasting goal.";
                    tag = "stopFasting";
                    icon = "/logo512.png";
                }

                //   START FASTING
                // #################################################
                else if (data.id === "startFasting") {
                    title = "Time to start fasting!";
                    body = "Stop eating and let you body rest.";
                    tag = "startFasting";
                    icon = "/logo512.png";
                }

                //   WEIGHT REMINDER
                // #################################################
                else if (data.id === "weightReminder") {
                    title = "Weight check!";
                    body = "Input your weight in the app.";
                    tag = "weightReminder";
                    icon = "/logo512.png";
                }

                return self.registration.showNotification(title, {
                    body,
                    icon,
                    tag,
                    badge: "/logo512.png", // need logo with 96x96 pixels
                    renotify: true,
                    vibrate: [300, 100, 400],
                });
            });
        })
    );
});

// #################################################
//   OPEN APP ON CLICK
// #################################################

const urlToOpen = new URL("https://fanfastic.netlify.app/").href;
self.addEventListener("notificationclick", (event) => {
    const promiseChain = self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return self.clients.openWindow(urlToOpen).then((client) => {
                return client.focus();
            });
        }
    });

    event.notification.close();
    event.waitUntil(promiseChain);
});
