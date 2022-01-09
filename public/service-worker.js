console.log("Service worker loaded");

// eslint-disable-next-line
self.addEventListener("push", (event) => {
    // eslint-disable-next-line
    if (!(self.Notification && self.Notification.permission === "granted")) {
        return;
    }
    const data = event.data.json();

    if (data.id === "stopFasting") {
        var title = "Time to stop fasting!";
        var body = "Congrats on reaching your fasting goal.";
        var icon = "/logo512.png";
    } else if (data.id === "startFasting") {
        title = "Time to start fasting!";
        body = "Go for it!";
        icon = "/logo512.png";
    }

    // title: "Time to stop fasting!",
    // body: "This is the text of the notification.",
    // icon: "http://image.ibb.co/frYOFd/tmlogo.png",

    // eslint-disable-next-line
    self.registration.showNotification(title, {
        body: body,
        icon: icon,
    });
});
