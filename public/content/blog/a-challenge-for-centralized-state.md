---
slug: a-challenge-for-centralized-state
title: A Challenge for Centralized State
published: 1/20/2017, 12:58:37 PM
updated: 2/17/2019, 3:14:00 PM
_created: 1/20/2017, 12:45:43 PM
---

I build distributed frontends using components ([preact] components, but that's not important).  Components are a great unit of composition when the structure of a system cannot be statically determined.  We often simplify state management by centralizing it, but does that negatively impact our ability to compose things at runtime?

### Prerequisite: SplitPoint

In this post, I'm going to brazenly pretend there exists a common definition for a `<SplitPoint>` component:

> `SplitPoint` invokes an async `load()` function (passed as a prop), then renders result as its child.

A horribly naive implementation of this component might look like this:

```js
class SplitPoint extends Component {
  constructor({ load }) {
    load().then( Child => this.setState({ Child }) )
  }
  render() {
    let { Child } = this.state
    let { load, ...props } = this.props
    return <Child {...props} />
  }
}
```

We can use this component to lazy-load (webpack-)chunked components on first render.

In Webpack (2!) this might look like:

```js
<SplitPoint load={ () => import('./SomeComponent') } />
```

However, we can just as easily emulate this without actual code loading, using a function that returns a `Promise` resolving to a Component:

```js
// a "chunk": a Promise that resolves to a Component
const loadComponent = () => Promise.resolve(
  class SomeComponent extends Component {
    render() { return <div>whatever</div> }
  }
)

<SplitPoint load={ () => loadComponent() } />
                 // ^ unnecessary? yes.
```

The main point here is that we can asynchronously pull in new components and render them into the Virtual DOM tree,
simply by wrapping them in a `<SplitPoint />` and chunking the Component definition.


### Using Lazy-Loaded Components

Here's an example of what it looks like to use lazily-loaded Components in a more real-world setting:

```js
const Sidebar = () => (
  <aside>
    <SplitPoint load={ () => import('./Ad') } />
    <SplitPoint load={ () => import('./Map') } />
    <SplitPoint load={ () => import('./Nearby') } />
    <SplitPoint load={ () => import('./AnotherAd') } />
  </aside>
)
```

... rendering `<Sidebar />` actually triggers network calls to go get the necessary components, and when they resolve they are rendered in-place.

**The same technique is used to chunk routes, pages, etc.**


### But Centralized State!

Now let's say we're using something like Redux for a centralized store.

Our components are going to pull initial state from that central store, and `subscribe()` to to changes to update in response.

The components in our Sidebar were `Ad`, `Map`, `Nearby` and `AnotherAd` (revenue is important). Let's ignore the Ads (everyone does) and focus on `Map` and `Nearby`. Both of these Components want to use the same `location` value from the centralized store.

That `location` value isn't free, though - its existence in that store includes a bunch of code to:

- fetch the user's location from an IP address
- geolocate them using browser APIs
- save location preferences to localStorage; or if signed in,
- save an authenticated user's location preferences to a service somewhere

_... that might be a nontrivial amount of code._

If we're building a sufficiently large application, there will come a time when the functionality associated with values
in the store would be worth splitting out into chunks, to be loaded on-demand.

Or, perhaps we don't know ahead of time _(at build time)_
if there will even be Components in this application that rely on that `location` value at all?  Maybe their existence in the UI is determined at runtime by something like a CMS, authentication status, or flags?

The solution here would be to code-split the logic around that `location` value so that it's only downloaded and executed when the application actually needs to use it.  However, how do we know that the application needs to access `location`?

```js
// getters on `state`?
@connect( state => ({
  location: state.location
}) )
export default class Map extends Component {
  render() {
    this.props.location   // accessed synchronously
    return <div>a map</div>
  }
}
```

You might be inclined to say this:

> "hey, that's easy! just have Map load the reducer and inject it into the store."

... and I might be inclined to agree - except it's quite possible our other `location`-using component, `<Nearby>`, might be rendered first. Or maybe `<Map>` won't be rendered at all.  Do we have both components load and inject that code-splitted business logic into the store when they are first mounted?

I hope you weren't reading this expecting a solution or even a library that solves this problem magically, since I have neither. Maybe you do?


[preact]: https://github.com/developit/preact