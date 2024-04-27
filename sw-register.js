//Main thread for registering service worker

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("./serviceworker.js");
}