---
slug: element-worklet
title: Element Worklet
published: 1/20/2021, 12:46:33 PM
updated: 1/20/2021, 12:46:33 PM
_created: 1/14/2021, 5:30:25 PM
---

I've been contemplating ways to build more resilient web applications. One consistent issue that seems to crop up in my explorations is that we have no way to execute JavaScript at a given priority.

We can write asynchronous code, but this doesn't provide a general-purpose resiliency primitive.

#### Un-yield-y

It is possible to write code that "yields" to allow other code to execute. Writing everything as async functions can accomplish this in specific cases, though only promise chains can be interrupted and it lacks any form of scheduling. This technique relies entirely on authors writing code to be interruptible, explicitly indicating where interruption may occur.

In addition to being opt-in, code that uses async/await, Promises or callbacks is still largely synchronous. The code between each point of asynchrony (await, Promise, callback) can't be interrupted. The following example function can only yield in a single location, the remaining code executes synchronously:

```js
async function amazing() {
  let items = [];
  let seen = new Set();
  for (let i=0; i<1000; i++) {
    let item = await db.get(i);
            // ^ yielding can only occur here
    if (!seen.has(item.name)) {
      seen.add(item.name);
      items.push(item);
    }
  }
  return items;
}
```

Combined with the fact that most JavaScript doesn't use async/await or even Promises, makes it insufficient as a general-purpose resiliency primitive. **Most of the JavaScript executed by browsers is synchronous.**

#### Why yield?

There is no language or platform feature that allows for interrupting arbitrary synchronous work in order to prioritize other work. There are a few reasons why we might want such a feature, but the one I find most compelling is to apply resiliency paradigms to _existing_ web code. Effectively, we want the ability to interrupt code wasn't written to be interrupted in order to allocate more time to executing high-priority code.

```js
function veryGoodCode() {
  const start = Date.now();
  while (Date.now() - start < 1000) {} // 🧐
  generateRevenue(); // 💸
}
```

The code we run from npm modules, third-party embeds and ads is all given access to the same pool of computing power as an application's core functionality. Multi-process improvements in the browser like [out-of-process iframes](https://www.chromium.org/developers/design-documents/oop-iframes) address this for certain types of content embedded from other origins, which can mitigate the performance impact of things like ads. Unfortunately, we don't have a similar solution for our own applications.

Applications are usually composed out of many distinct parts, but each part currently has the ability to impact the performance of all other parts. **We are missing a platform primitive for composing JavaScript modules while imposing performance constraints**.

# Proposal: Element Worklet

I drafted a proposal a while back and shared to various browser engineers, called [Element Worklet](https://github.com/developit/element-worklet). The proposal uses the existing concept of a [Worklet](https://developer.mozilla.org/en-US/docs/Web/API/Worklet), which is a standalone ECMAScript Module that executes in an isolated environment. This isolation means Worklets can be executed wherever is most suitable: Audio Worklets run on the audio rendering thread, Paint Worklets run on the compositor thread.

Element Worklets are a new type of Worklet that can register Custom Elements. The code for an Element Worklet has access to a limited subset of the DOM API, which allows code to register one or more Custom Elements using the standard `customElements.define()` method. Custom Elements registered by a worklet must inherit from a global `WorkletElement` class, and are only able to render into their Shadow DOM (as well as being able to set their own attributes).

Custom Elements registered by an Element Worklet are called "worklet-backed elements". These can be used on the main thread like any standard Custom Element, and can also be referenced from within the Shadow DOM of other worklet-backed elements, enabling arbitrary composition.

#### Example

The following example shows how a `<code-editor>` element can be built as an Element Worklet. Doing so encapsulates the code editor implementation so that its performance is not impacted by the surrounding page. It also ensures the page's performance is not impacted by the editor.

First, an HTML page includes the `<code-editor>` element in its markup the same as it would for a Custom Element. Then, a `code-editor.js` worklet module script is loaded using `addModule()`:

<div class="code-title"><code>index.html</code></div>

```html
<code-editor value="function foo(){}"></code-editor>

<script>
  customElements.addModule('/code-editor.js');
</script>
```

The `code-editor.js` module is loaded in a new JavaScript context, separate from the page and its JavaScript. The module declares a Custom Element class that extends `WorkletElement`, and uses the `connectedCallback()` lifecycle method to instantiate [CodeMirror](https://codemirror.net) within its Shadow DOM. The element also observes "value" attribute changes to update the editor text. Finally, the Custom Element is registered via `customElements.define()`.

<div class="code-title"><code>code-editor.js</code></div>

```js
import CodeMirror from 'https://unumd.glitch.me/codemirror';

class CodeEditor extends WorkletElement {
  static get observedAttributes() {
    return ['value'];
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'closed' });

    this.editor = CodeMirror(shadow, {
      value: this.getAttribute('value')
    });
  }

  attributeChangedCallback(name, prev, value) {
    if (name === 'value') this.editor.setValue(value);
  }
}

customElements.define('code-editor', CodeEditor);
```

Once the worklet module has finished executing and `customElements.define()` is called, the `code-editor` element is upgraded on the main thread.

#### Data Sharing

Custom Element properties set from the main thread are not reflected on a `WorkletElement`, only attributes. Attribute changes are observed the same as they are in Custom Elements, declared via a static `observedAttributes` property on the element's constructor. Attribute changes changes invoke `attributeChangedCallback()` on the WorkletElement instance, and may be batched.

Complex data and transferrables can also be shared. The main thread and worklet instances of a WorkletElement each have a `port` property, which are ports of an MessageChannel specific to that instance, and can be used for message passing. This is similar to how `processor.port` is provided by audio worklet's AudioWorkletNode/AudioWorkletProcessor.

#### Use Cases

**Ads:** Advertisements currently use iframes for encapsulation, a technique of increasing cost as the effects of Spectre mitigations make their way into browsers. Element Worklet could provide a lightweight alternative to iframes for this use-case.

**Third Party Embeds:** Embedded content like comment widgets, chats and helpdesks all of these currently use some combination of same-origin scripting and iframes, usually mixing origins (eg: a script in the embedder context communicating with an iframe from the embedee's context). Moving from `<script>` + `<iframe>` to Element Worklet seems like a reasonable fit for this case.

**AMP:** The semantics defined in this proposal map reasonably well to `<amp-script>`, and a prototype of Element Worklet has been built using [worker-dom](https://github.com/ampproject/worker-dom), the library that underpins `<amp-script>`. AMP's approach is much more broadly applicable than Element Worklet, seeking to support arbitrary third-party code running in a sandboxed DOM environment. However, it's possible a solution like worker-dom would be able to leverage something like Element Worklet to simplify Element registration and upgrades, and to mitigate transfer overhead between threads.

**Lazy Loading:** Component-based frameworks and libraries strive to provide solutions for lazily downloading, instantiating and rendering portions of an application. This process is entirely implemented in userland, which has the unfortunate side effect of making it invisible to the browser. In certain scenarios, it may be possible to use Element Worklet as the underly mechanism for lazily loading and rendering pieces of a component-based User Interface.

**UI Component Libraries:** If this model can be shown to provide performance guarantees for Element registration, upgrade and rendering, it's possible a UI library would choose to provide their components as worklet-backed Elements through the use of one or more Element Worklets. This could have interesting implications for performance, since it would provide a way to impose performance guarantees. This is a safety net developers do not currently have for prebuilt modules. The (large) portions of a typical app that are defined by code installed from npm would have less ability to negatively impact the performance of first-party code.

#### Feasibility

The hard part with such a broad proposal like this is making it something that would be feasible to implement. Part of the design of Element Worklet is aimed at avoiding implementation issues, like the use of a minimal DOM subset and exclusively asynchronous interaction between threads.

As part of investigating whether Element Worklet could be implemented at all, I've created an [Element Worklet prototype](#prototype). The prototype also demonstrates how Element Worklet could be used to control the performance impact of UI components, in addition to insulating their performance from the page.

#### Open Questions

This proposal glosses over a some details that would be important were it to be implemented in a browser:

- What DOM APIs should be available to Element Worklet code? Can `WorkletElement` provide a sufficient API surface to allow current libraries and approaches to be reused with minimal modification?

- How would a Worklet obtain information that required the main thread to perform layout? (we need `async getBoundingClientRect()` and friends!)

- Is the level of encapsulation too limiting? Does it fail to meet the needs of the most obvious use-cases like embedded video players?

- Should Element Worklet provide an analog for Custom Element property getters/setters? Could custom properties/methods defined on a WorkletElement subclass be reflected asynchronously on the main thread in the style of Comlink? This seems important for handling complex data types without attribute serialization schemes.

- Would it be possible to accept a "priority" option during Element Worklet registration? This would unlock a host of use-cases in which worklet code could be considered untrusted from a performance standpoint. The same option would be valuable when instantiating Web Workers.

#### Prototype

I have created a prototype implementation of Element Worklet using [worker-dom](https://github.com/ampproject/worker-dom/). The video below shows a page with two Element Worklets registered. One of the worklets intentionally executes long-running JavaScript that destroys performance. However, because each Element Worklet is executed on its own thread, only instances of the poor-performing worklet are affected. The page and the other worklets (in blue) remain responsive.

<video playsinline autoplay controls loop width="960" height="1028" loading="lazy" style="max-width:100%; height:auto; margin:auto; background:#ddd; border:5px solid #ddd; box-sizing:border-box;">
<source type="video/mp4" src="https://i.imgur.com/MYIogxs.mp4">
</video>

In the second half of the video, both worklets are transformed by a Service Worker that injects execution tracking around every expression. When a worklet spends too long executing JS without yielding, its thread [is put to sleep](/javascript-sleep). This pauses execution of the slow worklet, limiting its performance impact and preserving more resources for the page and other worklets.

This demonstrates the proposed "priority" option for Element Worklet registration, which limits the performance impact of elements backed by a given worklet. In the demo, this results in a 10x reduction in CPU usage measured by Task Manager, from around 70% to just 7%.

<center><h4>

[try the Element Worklet prototype](https://element-worklet.glitch.me/) on Glitch →

</h4></center>

<center><h4>

[view the spec proposal](https://github.com/developit/element-worklet) on GitHub →

</h4></center>

<br>

<style>
  .code-title {
    margin-bottom:-.8em;
  }
  .code-title code {
    font-weight: bold;
    padding: .2em 1em;
    border: none;
    background: #E3EDF3;
    color: #434D53;
    border-radius: 3px 3px 3px 0;
  }
</style>