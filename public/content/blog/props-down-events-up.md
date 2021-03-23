---
slug: props-down-events-up
title: Props Down, Events Up
published: 2/20/2016, 5:18:23 PM
updated: 2/17/2019, 3:11:31 PM
_created: 2/20/2016, 12:37:14 PM
---

> Let's assume you're using some component-based Virtual DOM rendering library like [Preact](https://git.io/preact).
>
> Let's also assume you understand JSX - if you don't, check out my post, [WTF is JSX](/wtf-is-jsx).

Components are great, and they help us compose complex User Interfaces using an understandable hierarchy of independent, re-usable blocks of functionality.

However, in choosing to build these distinct pieces of our User Interface in isolation from eachother, any communication between components must be done through a defined API. This is important for retaining proper encapsulation, which is how we keep everything as independent as possible.  This has an implication that can be a little tricky when getting started, particularly for those coming from frameworks where you can "reach" between arbitrary areas of an application.

Component-based rendering has to a "golden rule" to enforce this separation: ==Don't access a component's state from outside of that component==. State is transient, and intended to be private to a component.

So... how do we share data between components?

It's simple: **Props Down, Events Up.**


---


## Props Down

> `props` are how data is passed **into** a Component.

This is exactly the same as how we pass props to elements in JSX:

```js
class Foo extends Component {
  render(props) {
    return <div data-a={ props.a } />;
  }
}

// Render Foo with an "a" value of "ehh":
render(<Foo a="ehh" />, document.body);
```

Of course, this works much the same for _Pure Functions_:

```js
const Foo = (props) => (
  <div data-a={ props.a } />
};

render(<Foo a="ehh" />, document.body);
```

You're not limited to just String `props`, JSX allows arbitrary JavaScript expressions as attribute values:

```js
<Foo a={ true } />
<Foo a={ [1, 2] } />

let someValue = 42;
<Foo a={ someValue } />
```


---


## Events Up

> `Events` are how data is passed **out of** a Component.

Events are just `props` where the value is a function, and the name _(generally)_ begins with `on*`.

Event handlers passed into a Component as `props` can be called whenever it suits, since they are just function references.


---


## Some Examples

You can proxy the handlers directly into the DOM as event listeners:

```js
class A extends Component {
  render({ onClick }) {
    return <button onClick={onClick}>Proxied</button>
  }
}
```

Or, hold on to them and call them later in response to something happening:

```js
class A extends Component {
  // whichever bind() mechanism you prefer:
  @bind
  handleClick(e) {
    let event = {
      x: e.pageX,  // you can pass anything to event handlers
      y: e.pageY   // though generally events are objects
    };
    this.props.onClick(event);
  }
  render() {
    return <button onClick={this.handleClick}>Manual</button>
  }
}
```


---


## Real-World Example

Let's create a component that shows a wrapped HTML input element, perhaps in order to apply some fancy styling.  We want to proxy the events from the HTML element to whichever Component invokes our wrapper component.


```js
class Child extends Component {
  constructor({ text }) {
    super();
    // copy text into state
    this.state = { text };
  }
  @bind
  handleInput(e) {
    // new value from the input
    let text = e.target.value;

    // update state to re-render
    this.setState({ text });

    // invoke the event handler we got passed as a prop:
    this.props.onInput({ text });
  }
  render({ }, { text }) {
    return <input value={text} onInput={this.handleInput} />;
  }
}

class Parent extends Component {
  @bind
  handleInput(e) {
    // e is whatever WrappedInput passed up
    let value = e.text;
    this.setState({ value });
  }
  render({ }, { value }) {
    return (
      <div>
        <Child text={value} onInput={this.handleInput} />
      </div>
    );
  }
}
```


---


## Linked State & Custom Events

You probably noticed that `handleInput()` method seems to just be doing what Preact's built-in [Linked State][1] feature does automatically for us.

In fact, we can absolutely use [linkState][1] to capture values from Custom Events passed up from Components. All we need to do is tell `linkState()` to look for the right property on the event object being passed up from the child Component.

If you're not familiar with [linkState()][1], it's a function that creates an event handler that, when called, updates a given property in state with a new value from the event.

The first parameter to `linkState()` is a keypath to assign to within the state object. The optional second parameter is a keypath at which to find the new state value within Event. When omitted, linkState tries to detect the value for you.

> `<a onClick={ linkState('foo', 'bar') }>`
>
> is roughly equivalent to:
>
> `<a onClick={ e => this.setState({ foo: e.bar }) }>`


Using `linkState()`, we can further simplify the parent component from the example to remove that verbose event handler altogether!

```js
class Parent extends Component {
  render({ }, { value }) {
    return (
      <div>
        <Child
          text={value}
          onInput={this.linkState('value', 'text')}
        />
      </div>
    );
  }
}
```


---


## Who Does #2 Work For

Lastly, observe that the `text` state value in `<WrappedInput>` is duplicated as `value` within `<Parent>`.

> This is often a clue that a component is trying to hold things in state that it realistically doesn't own.

Let's see if we can let the Parent component retain full control over that state - doing so will make our Child component simpler and more [deterministic][2].

Instead of managing state in the child component, we can just use whatever is passed to it as the `text` prop.

```js
class Parent extends Component {
  // parent owns its state:
  state = {
    value: 'Hello, World!'
  };
  render({ }, { value }) {
    return (
      <div>
        <Child
          text={value}
          onInput={this.linkState('value', 'text')}
        />
      </div>
    );
  }
}

class Child extends Component {
  @bind
  handleInput(e) {
    let text = e.target.value;
    this.props.onInput({ text });
  }
  render({ text }) {
    return <input value={text} onInput={this.handleInput} />;
  }
}
```

Here's a working version of that [on JSFiddle](https://jsfiddle.net/developit/vuj2yu6y/):

<iframe src="http://jsfiddle.net/developit/vuj2yu6y/embedded/result%2Cjs/" style="border:2px solid #CCC;width:100%;height:400px;"></iframe>


---

## Wrapping Things Up
*(bad pun)*

This is a reasonable example of the concept of Smart and Dumb Components. "Dumb" components like `<Child>` in our example are highly reusable because they contain little or no logic, and don't include side effects like fetching data. "Smart" components are a place to organize collections of "Dumb" components to meet your needs.


[1]: https://github.com/developit/preact/wiki/Linked-State
[2]: https://en.wikipedia.org/wiki/Deterministic_system