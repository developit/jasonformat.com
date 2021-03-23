---
slug: javascript-sleep
title: Real sleep() in JavaScript
published: 1/15/2021, 12:22:33 PM
updated: 1/15/2021, 12:26:45 PM
_created: 1/14/2021, 3:49:08 PM
---

The JavaScript language is single-threaded, which means that blocking that single thread for any period of time will prevent importing things like input handling and rendering. 

...but about blocking the thread when that thread is a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)?

It's possible to implement [sleep()](https://en.wikipedia.org/wiki/Sleep_(system_call)) in JavaScript. A naive implementation of sleep() might look like this:

```js
function sleep(t) {
  const start = Date.now();
  while (Date.now() - start < t);
}
```

This solution has an obvious problem: even if we do want to block a thread for a period of time, doing so using a loop will consume all of the CPU time available to the thread. For a Web Worker, that's generally going to be 100% of one of your machine's cores. The goal with `sleep()` is generally to pause our code for a period of time, but this naive implementation actually causes our code to take as much time as possible - the opposite of what we need!

#### XMLHttpRequest, old friend

Fortunately, there is another way to block a thread from JavaScript in the browser: synchronous XMLHttpRequest. Like a long-running `while()` loop, Synchronous XMLHttpRrequest blocks the thread and has a [uniquely negative impact on performance and UX](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests#synchronous_request). However, a Web Worker isn't a UI thread though, and there are cases where being able to "pause" a worker thread is genuinely useful. One that I'm particularly interested in is imposing resource limitations on modules.

We can use Synchronous XMLHttpRequest to pause JavaScript execution while waiting on a network resource. Requesting a URL thousands of times isn't ideal though, and since `sleep(t)` accepts a duration in milliseconds it's important to be able to "unpause" the thread after that amount of time has passed. One way to "unpause" is to set the `.timeout` property of the Synchronous XMLHttpRequest to our delay:

```js
function sleep(t) {
  const xhr = new XMLHttpRequest();
  xhr.timeout = Math.max(t, 10);
  xhr.open('GET', '/some-url-that-loads-forever', false);
  try {
    xhr.send();  // ignore the timeout error
  } catch (e) {}
}
```

If the URL requested above happens to return a response before we reach the timeout though, our `sleep()` function won't sleep long enough. We could use a loop to continually re-request the resource until we reach the specified sleep duration, but this solution would result in a potentially massive number of network requests. Deploying this in production would be a good way to DDoS whichever web server or CDN happens to be the target of those requests - not something I'd recommend! Thankfully, there's a way to intercept requests made by JavaScript - Service Worker.

##### Service Worker to prevent DDoS

A Service Worker could intercept the network requests made from our `sleep()` function's Synchronous XMLHttpRequest calls, preventing them from ever making their way out to the internet. Even more useful, the Service Worker can wait for a specific amount of time before returning an empty response for those network calls, which means we don't have to issue multiple requests in order to reach a given `sleep(t)` delay. Here's a Service Worker that does just that:

```js
// activate immediately:
addEventListener('install', () => self.skipWaiting());
addEventListener('activate', () => self.clients.claim());

addEventListener('fetch', e => {
  // we only handle requests to a special /SLEEP url:
  const url = new URL(e.request.url);
  if (url.pathname !== '/SLEEP') return;

  // wait ?t=X milliseconds, then return a 304:
  e.respondWith(new Promise(resolve => {
    const t = new URLSearchParams(u.search).get('t');
    const response = new Response(null, {status:304});
    setTimeout(resolve, t, response);
  }));
});
```

Once registered by calling `navigator.serviceWorker.register('/sw.js')`, the Service Worker will begin intercepting requests to a special `/SLEEP?t=0` URL. All we have to do is modify the `sleep()` function to request that URL with the correct duration:

```js
function sleep(t) {
  t = Math.max(10, t);
  const xhr = new XMLHttpRequest();
  xhr.timeout = t;
  x.open('GET', `/SLEEP?t=${t}`, false);
  try{ x.send(); } catch(e) {}
}
```

### Even better: `Atomics.wait()`

As pointed out by my astute co-workers [Derek](https://twitter.com/derekschuff) and [Shu](https://twitter.com/_shu), the somewhat recent JavaScript addition `Atomics.wait()` implements an optimized `sleep()` solution while waiting for a value to be changed within a `SharedArrayBuffer`. We can use this in a Worker thread to implement sleep _extremely_ effectively, without any Synchronous network requests or a Service Worker:

```js
const AB = new Int32Array(new SharedArrayBuffer(4));
function sleep(t) {
  Atomics.wait(AB, 0, 0, Math.max(1, t|0));
}
```

### Seeing it work

Great! Now we can use `sleep(500)` to pause a Web Worker for 500ms, without increased CPU usage:

<video playsinline autoplay controls loop width="720" height="562" style="max-width:100%; height:auto; margin:auto; background:#ddd; border:5px solid #ddd; box-sizing:border-box;">
<source type="video/mp4" src="https://i.imgur.com/vkQ3kC5.mp4">
</video>

<center><h4>

Interested? [Try the demo for yourself on Glitch](https://sleep-sw.glitch.me/).

</h4></center>

<br>
