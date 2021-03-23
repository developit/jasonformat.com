---
slug: umd-is-dead-long-live-umd
title: UMD is Dead! Long Live UMD!
published: 3/21/2017, 10:56:21 PM
updated: 2/17/2019, 3:13:18 PM
_created: 3/21/2017, 6:57:25 PM
---

In the front-end world, we've been publishing modules as UMD (Universal Module Definition) for quite some time - at least [6 years](https://github.com/umdjs/umd/commit/d0657cb76bdef3e6f267895a20fb18181a0d3d58). That's a longevity we don't often see in this industry, and we owe the proponents and upholders of the UMD spec a debt of gratitude.

The UMD format has served the community well - it's the lingua franca of modules, and has generally enabled us to ignore format interoperability as module consumers.  Given that the value provided by UMD is clear, we should collectively spend a bit of time evaluating options for modernizing UMD in order to adapt to the next set of technologies being adopted.

ES Modules are here, and with them we've accepted a definitive syntax for expressing dependencies - `import` and `export`.  The community is now rallying around this syntax, and exploring new solutions like `import()` that account for dynamic dependencies.

Since these new features can never be made to work with UMD, I would like to propose we modernize the UMD format by removing support for <abbr title="Asynchronous Module Definition">AMD</abbr>.

Why remove AMD? Partly to encourage the emergence of new solutions that better interoperate with ES Modules (default imports in particular), and party to keep the UMD format consistent with its original goal:

> "Modules which can work anywhere, be that on the client, on the server or anywhere else.
>
> [..] compatibility with the most popular script loaders of the day."

AMD is no longer a popular format, making it a likely distant fourth contender to ES Modules, CommonJS and globals.  The problems AMD solves have been moved elsewhere - typically into the realm of module bundlers like Webpack and Rollup.  Instead of asynchronous loading as a feature of our chosen module formats, it's an implementation detail of our chosen bundler.

Here's what UMD looks like today:

```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object') {
    module.exports = factory();
  } else {
    root.greatLibrary = factory();
  }
}(this, function () {
  var exports = {};
  return exports;
}));
```

Here's what I'm proposing we run with moving forward for the general case:

```js
(function (root, factory) {
  if (typeof module === 'object') {
    module.exports = factory();
  } else {
    root.greatLibrary = factory();
  }
}(this, function () {
  var exports = {};
  return exports;
}));
```

At 137b (minified & gzipped), we're down to a fairly decent size for this little wrapper - however, this is just the start.

Here's an optimized version for modules that contain a single function - a common case. Often modules are just a single export of something like a factory function, which means they don't need the wrapper function to encapsulate module-level variables.  For these, we can cut the size nearly in half:

```js
// this is already a global in the browser!
function myGreatLibrary() {
  // does great things here
}
// attempt to export for CommonJS
try { module.exports = myGreatLibrary; } catch (e) {}
```

The above code is 79 bytes when minified and gzipped - that's not very much overhead at all!  It's important to note that the above case is not well-suited to modules with dependencies, since it doesn't differentiate between global and CommonJS uses.  For modules with dependencies, use the first proposed format.

### Via Rollup

Here's an example rollup configuration that uses [rollup-plugin-memory](https://github.com/TrySound/rollup-plugin-memory) to produce a bundle set up similarly to the above:

```js
import memory from 'rollup-plugin-memory';

// OR: require('./package.json').name
const NAME = 'preact';

export default {
  entry: 'src/entry.js',
  useStrict: false,
  // wrap everything in a function:
  format: 'iife',
  plugins: [
    // inject our bundle logic around the real entry:
    memory({
      path: 'src/entry.js',
      contents: `
        import lib from './index';
        if (typeof module!='undefined') module.exports = lib;
        else self.${NAME} = lib;
      `
    })
  ]
}
```

You can tweak the configuration to suit your library's particular set up. For example, if you export a single wrapper function, you might set `format` to `es` (ES Modules), but then use `memory` to export nothing, instead using the optimized option from above:

```js
contents: `
  import myFunction from './index';
  try { module.exports = myFunction; } catch (e) {}
`
```

---

So, we've dropped AMD from the mix here. Despite that, because CommonJS and globals are supported our bundle will still load perfectly via Webpack, a `<script>` tag, `importScripts` `rollup-plugin-commonjs`, etc.  For Webpack 2 and Rollup itself we're producing these <abbr title="New Module Definition">NMD</abbr> using ES Modules, so these bundled libraries don't even get used.

I think this would be a nice change to see in the modules we all rely on. Do you?