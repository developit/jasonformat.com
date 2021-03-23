---
slug: wtf-is-jsx
featured: true
title: WTF is JSX
published: 7/7/2015, 1:19:00 PM
updated: 2/17/2019, 3:14:33 PM
_created: 7/7/2015, 12:01:14 PM
meta_title: WTF is JSX
---

JSX is actually quite straightforward: take 1 minute and read this, and you'll understand everything there is to know about this interesting alternative to templates.

_Alternative title: "Living with JSX"_


The Pragma
----------

You declare this per-file or per-function to tell your transpiler (eg: Babel) the name of a function that should be called _at runtime_ for each node (see [Transpilation](#Transpilation)).

In the example below, we are saying "inject calls to an `h()` function for each node":

```js
/** @jsx h */
```

---

Transpilation
-------------

If you're not using a transpiler yet, you should be. Writing, debugging, testing and running JavaScript is all more effective when using ES6/ES2015. [Babel](http://babeljs.io) is the most popular and highly recommended transpiler out there, so I'll assume that's what you are using.

Along with converting your ES6/ES7+ syntax to JavaScript-of-today, Babel includes support for transpiling JSX ==right out of the box==. You don't need to add or change anything to use this feature.

It's easiest to see how this works by looking at a very simple example:

**Before:** _(the code you write)_

```js
/** @jsx h */
let foo = <div id="foo">Hello!</div>;
```

**After:** _(the code you run)_

```js
var foo = h('div', {id:"foo"}, 'Hello!');
```

You might be looking at that second code snippet thinking it wouldn't be so bad just building UI using functions...

This is why I started to get on board with JSX: if it disappeared off the face of the earth, writing the output by hand would still be pretty comfortable.


> **JSX is just a sugar for a syntax that's _already_ pretty decent.**

People even use it for whole projects: [hyperscript]


----


Let's Build a JSX Renderer
--------------------------

First, we'll need to define that `h()` function our transpiled code is calling.

You can call this whatever you want, I use `h()` because the original idea for this type of "builder" function was called [hyperscript] ("hyper~~text~~" + "~~java~~script").

```js
function h(nodeName, attributes, ...args) {
  	let children = args.length ? [].concat(...args) : null;
  	return { nodeName, attributes, children };
}
```

Ok, that was easy.

> *Unfamiliar with ES6/ES2015?*
>
> * That `...` in the arguments list is a *rest param*. It collects "the rest" of the arguments into an Array.
> * The `concat(...args)` bit is a *spread operator*: it takes that Array and expands it into arguments to `concat()`. The use of `concat()` here is to collapse any nested Arrays of child nodes.


Now we have these nested JSON objects our `h()` function spits out, so we end up with a "tree" like this:

```js
{
  nodeName: "div",
  attributes: {
    "id": "foo"
  },
  children: ["Hello!"]
}
```


So we just need a function that accepts that format and spits out actual DOM nodes:

```js
function render(vnode) {
    // Strings just convert to #text Nodes:
    if (vnode.split) return document.createTextNode(vnode);

    // create a DOM element with the nodeName of our VDOM element:
    let n = document.createElement(vnode.nodeName);

    // copy attributes onto the new node:
    let a = vnode.attributes || {};
    Object.keys(a).forEach( k => n.setAttribute(k, a[k]) );

    // render (build) and then append child nodes:
    (vnode.children || []).forEach( c => n.appendChild(render(c)) );

    return n;
}
```

Sweet. It's not hard to understand how that works.
If it helps, you can think of "Virtual DOM" as a very simple configuration for how to build a given DOM structure.

> The benefit of virtual DOM is that it is extremely lightweight. Small objects referring to other small objects, a structure composed by easily optimizable application logic.
>
> This also means it is not tied to any rendering logic or slow DOM methods.


---


Using JSX
---------

We know that JSX is transformed into `h()` function calls.  
Those function calls create a simple "Virtual" DOM tree.  
We can use the `render()` function to make a matching "real" DOM tree.  
Here's what that looks like:

```js
// JSX -> VDOM:
let vdom = <div id="foo">Hello!</div>;

// VDOM -> DOM:
let dom = render(vdom);

// add the tree to <body>:
document.body.appendChild(dom);
```

##### Partials, Iteration & Logic: No new Syntax

> Instead of the limited concepts introduced by template languages, we have all of JavaScript.

"Partials" are a concept introduced by logicless/limited-logic template engines to re-use chunks of a view across differing contexts.

Iteration is something each new template language seems to re-invent (I'm as guilty as anyone). With JSX, there is no one-off syntax to learn: iterate how you would anywhere else in your JavaScript program. You pick the iteration style that best suits a given task: `[].forEach()`, `[].map()`, `for` and `while` loops, etc.

Logic, like iteration, is something template languages love to re-invent. On one hand, logicless templates provide a very poor means of embedding logic into a view: limited constructs like `{{#if value}}` push logic into a controller layer, encouraging bloat. This circumvents building a language for describing more complex logic, avoiding predictability & security pitfalls.

On the opposite end of the spectrum, engines that use code-generation - _a technique that ranges from gross to unforgivable_ - often boast the ability to execute arbitrary JavaScript expressions for logic or even iteration. Here is a good enough reason to avoid this at all costs: your code is being ripped out of its original location _(perhaps a module, a closure or within markup)_ and evaluated "somewhere else". That's not predictable or secure enough for me.

> JSX allows _all_ of of JavaScript's language features, without relying on generating grotesque code in a build step and without `eval()` & friends.

```js
// Array of strings we want to show in a list:
let items = ['foo', 'bar', 'baz'];

// creates one list item given some text:
function item(text) {
    return <li>{text}</li>;
}

// a "view" with "iteration" and "a partial":
let list = render(
  <ul>
    { items.map(item) }
  </ul>
);
```

`render()` returns a DOM node (the `<ul>` in the above case), so we just need to place that into the DOM:

```js
document.body.appendChild(list);
```


---

Putting it Together
-------------------

Here's the full source for the little virtual DOM renderer and a view that uses it.
A CodePen with some styling is available below.

```js
const ITEMS = 'hello there people'.split(' ');

// turn an Array into list items: 
let list = items => items.map( p => <li> {p} </li> );
 
// view with a call out ("partial") to generate a list from an Array:
let vdom = (
    <div id="foo">
        <p>Look, a simple JSX DOM renderer!</p>
        <ul>{ list(ITEMS) }</ul>
    </div>
);
 
// render() converts our "virtual DOM" (see below) to a real DOM tree:
let dom = render(vdom);
 
// append the new nodes somewhere:
document.body.appendChild(dom);
 
// Remember that "virtual DOM"? It's just JSON - each "VNode" is an object with 3 properties.
let json = JSON.stringify(vdom, null, '  ');

// The whole process (JSX -> VDOM -> DOM) in one step:
document.body.appendChild(
    render( <pre id="vdom">{ json }</pre> )
);
```


[Codepen Demo](http://codepen.io/developit/pen/aOYywe)
--------------

<iframe height="600" scrolling="no" src="//codepen.io/developit/embed/aOYywe/?height=600&theme-id=16424&default-tab=result" frameborder="no" style="width:100%;"></iframe>


[hyperscript]: https://github.com/dominictarr/hyperscript