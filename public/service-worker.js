console.log("Service worker loaded");

// eslint-disable-next-line
self.addEventListener("push", (event) => {
    const data = event.data.json();

    // eslint-disable-next-line
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
    });
});
