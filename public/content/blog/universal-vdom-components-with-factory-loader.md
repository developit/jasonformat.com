---
slug: universal-vdom-components-with-factory-loader
title: Universal VDOM Components with factory-loader
published: 3/25/2017, 2:49:35 PM
updated: 2/17/2019, 3:11:10 PM
_created: 3/25/2017, 2:25:38 PM
---

There is a commonly known issue in the React/etc community that we haven't been able to piece together a solution for yet.  I think I might have stumbled onto a decent way to solve the problem, in the form of a 5-line Webpack loader I'm tentatively calling `factory-loader`.

Here's the gist: we know Dependency Injection is a reasonable solution to the problem, it's just not something anyone would want to adopt because it's verbose.

Here's an example of a component written in the "ideal" style - a factory that allows us to inject the Virtual DOM library of our choosing when we consume the module:

```js
// foo.js
export default vdom => {
  return class Foo extends vdom.Component {
    render() {
      return <div />
      //     ^ produces vdom.createElement('div')
    }
  }
}
```

This is pretty workable on the component authoring side of things - instead of importing a specific Virtual DOM library, we export a function that lets the consumer of the module pass it to us. This removes the tight coupling a component normally has to one specific VDOM implementation.

On the consuming side though, this can get pretty out of hand:

```js
import preact from 'preact';
import createFoo from './foo';  // from above

// now we have to create a preact-bound Foo ourselves:
const Foo = createFoo(preact);

render(<Foo />)  // as you would have before
```

It seems alright to do this for one component, but if you've worked in a sufficiently complex codebase, things would not scale well. In a module with 10 or 20 component imports, that's a whole lot of boilerplate. That's a barrier to adoption of the technique, and the likely reason why I've never even seen a component authored this way - it's unprecedented and causes extra work for the consumer, and there aren't convenient shortcuts to make things easier.

So, maybe we can solve this and figure out a clean way to use these library-agnostic VDOM Components without things getting ugly...  enter `factory-loader`.

---

## Factory Loader

`factory-loader` is a tiny Webpack loader that invokes the module it is applied to, passing it another module as an argument.  What's that useful for?  Dependency Injection!  Maybe this is how we can solve the VDOM fragmentation issue.

```js
// invoke the result of require(./foo)
// .. with require(preact) as an argument.
import foo from 'factory-loader?module=preact!./foo';

// in other words, do this:
var foo = require('./foo')( require('preact') );
```

---

#### How does it work?

In essence, factory loader creates a proxy module that does this:

```js
var factory = require('some-module')
module.exports = factory(require('module-to-inject'));
```

The actual implementation is very small - 5 lines:

```js
(module.exports = function() {}).pitch = function(req) {
  var m = require("loader-utils").parseQuery(this.query).module
  this.cacheable && this.cacheable()
  return "var f=require("+JSON.stringify("!!"+req)+");"+
    "module.exports=(f.default||f)(require("+JSON.stringify(m)+"))"
}
```

For the purposes of this post, let's assume this is an npm module called `factory-loader`.

---

#### Example

Here's a library-agnostic VDOM component. Notice that it doesn't import React or any Virtual DOM library. It simply takes the VDOM library as an argument:

**awesome-list.js:**

```js
/** @jsx createElement */
export default ({ createElement, Component }) => {
  // Example pure functional Component:
  const Item = props => (
    <li>{props.item}</li>
  );

  // Example stateful/classful Component:
  return class AwesomeList extends Component {
    render() {
      return (
        <ul>
          { this.props.items.map( item =>
            <Item item={item} />
          ) }
        </ul>
      );
    }
  }
}
```

Normally the JSX pragma there would be in a babelrc or similar, I've just left it inline to make it obvious that JSX is being transpiled to a function call we've accepted as an argument (`createElement()`).

So, with the above library-agnostic VDOM Component, let's use `factory-loader` to import it without any boilerplate. This essentially is a "late binding" of the component to (in this case) Preact:

**app.js:**

```js
// import Preact for use in our module:
import { h, render } from 'preact';

// Import awesome-list, invoke it with preact and grab the result:
import AwesomeList from 'factory-loader?module=preact!./awesome-list';

// AwesomeList is now a Preact component!

render(
  <AwesomeList items={['a', 'b', 'c']} />
, document.body);
```

---

#### Recap

To recap - `factory-loader` is extremely simple. It just does this:

```js
var factory = require('whatever-you-called-it-on.js')
module.exports = factory(require('value-of-module-parameter.js'));
```

In the `AwesomeList` example we just walked through, the loader creates this little proxy module for us behind-the-scenes:

```js
var f = require('./awesome-list');
module.exports = (f.default || f)(require('preact'));
```

_(the `factory.default || factory` bit there accounts for ES Module default exports in Webpack 2)_


I think this is fairly easy to follow, and solves the DI problem we've been avoiding for quite some time.  What do you think?