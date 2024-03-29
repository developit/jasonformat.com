---
slug: reusable-array-search-predicates
title: "Quick tip: reusable Array search predicates"
published: 6/6/2021, 3:26:00 PM
updated: 6/6/2021, 3:26:00 PM
---

JavaScript's `this` keyword doesn't get much love these days, but there's one fun way to use it that might convince folks to reconsider their lint rules.

To start, consider the following common examples of searching within an Array:

```js
const items = [{ id:10 }, { id:20 }, { id:42 }, { id:99 }, { id:100 }];

function getById(id) {
  return items.find(item => item.id === id);
}

function getNextId(id) {
  const index = items.findIndex(item => item.id === id);
  return items[index + 1]?.id;
}

function getSince(id) {
  return items.filter(item => item.id > id);
}
```

Each of the exported functions search for values based on dynamic criteria - `id` values provided as arguments.
By passing a new single-use search predicate to the Array method on every call, that function can access the criteria (which `id` to look for) from the parent function's scope.
This approach is also common for static criteria, perhaps because Arrow Functions make it syntactically convenient to express search predicates.

While convenient, creating a new predicate every time we want to search through an Array isn't particularly efficient.
From an ergonomic standpoint, inline functions can be a pain to test because they can't be invoked directly.
There are also some architectural trade-offs that can arise when inline functions are used heavily, since they can't be extracted or consolidated during bundle optimization, and many slight variations of the same function can compress poorly.

### Here, take `this`

There exists another option, and it might be intriguing to folks as a way to counter a few of the above issues.
Many of the standard Array methods like `map()` and `filter()` accept a second `thisValue` argument, which sets the value of `this` when calling the given predicate function:

```js
[].filter(function() {
  this;  // 'hello'
}, 'hello');
```

Any value can be provided for `thisValue` as an argument when invoking these Array methods, which gives us a way to supply an extra bit of information to a search function that wasn't available when it was created.
It's similar to binding a function before passing it to an Array method (`.filter(fn.bind(X))`).
One caveat to be aware of is that the value will be cast to an object - ideally, pass something that is already an object to avoid this causing equality issues or hurting performance.

Using the `items` Array from the first example, we can create a function that returns `true` for items with a given `id` value, and define that value when calling `.find()`:

```js
function itemHasId(item) {
  return item.id === this.value;  // we get to supply `this` each time we call find()
}

items.find(itemHasId, { value: 10 });  // { id:10 }
items.find(itemHasId, { value: 42 });  // { id:42 }
```

This approach works for all sorts of search functions you might think of:

```js
function isGreaterThan(item) {
  return item > this[0];
}
[5,10,15,20].findIndex(isGreaterThan, [10]); // 2

function hasSrc(element) {
  return element.src === this.href
}
[...document.querySelectorAll('img')].filter(hasSrc, new URL('/assets/icon.png', location.href));
```

It's can be easier to test this approach compared to more typical approaches that hard-code criteria into the search function or access it from an outer scope. I sometimes prefix the name of a search predicate with a `$` to indicate that it expects a comparison value to be provided via `this`.

Here's a more concrete example that uses a few reusable methods to search through an Array of blog posts:

```js
// Given an Array of objects:
const blogPosts = [
  { name:'one', tags:['a', 'b'], published: '2016-10-31' },
  { name:'two', tags:['c'], published: '2019-01-05' },
  { name:'three', tags:['b'], published: '2021-06-06' },
  ...
];

// Create reusable search predicates using `this`:
function $hasName(item) { return item.name === this.name }
function $hasTag(item) { return item.tags.includes(this.tag) }
function $publishedAfter(item) { return new Date(item.published) > this }

// ...and specify the comparison value dynamically:
blogPosts.find($hasName, { name: 'one' });      // {name:'one'…}
blogPosts.findIndex($hasName, { name: 'two' }); // 1

blogPosts.every($hasTag, { tag: 'b' });        // true
blogPosts.filter($hasTag, { tag: 'b' });       // [{name:'one'…}, {name:'three'…}]
blogPosts.filter($publishedAfter, new Date(2020, 12, 25));  // [{name:'three'…}]
```

### Performance, and word of warning

Unfortunately, the performance of this approach can be worse than using an Arrow Function without some restrictions. If the `thisValue` used is not an object, the cost of it being cast to one and the effect that has on later comparison will eclipse just using an inline function.

<img width="478" height="655" src="https://i.imgur.com/KQ4687e.png" alt="benchmark results showing thisValue is slower than other functionally equivalent options except when the value is an object reused on each invocation" style="display:block; margin:auto;">

<div style="text-align:center;">
  <a href="https://esbench.com/bench/60bd52876c89f600a5700cd1" target="_blank">Benchmark on ESBench</a>
</div>

<br>

If you're doing something performance-critical, it may be best to avoid this technique. However, this could potentially be a useful approach when implementing more complex searching logic, since the context object can have any number of properties controlling comparison behavior:

```js
function matches(item) {
  const expected = item[this.value];
  const actual = item[this.property];
  switch (this.comparator) {
    case '===': return actual === expected;
    case '>': return actual > expected;
    case '<': return actual < expected;
    case 'includes': return actual.includes(expected);
    case 'after': return new Date(actual) > expected;
  }
}

function compare(property, comparator, value) {
  return { property, comparator, value };
}

items.filter(matches, compare('id', '>', 40));

// borrowing from the previous example:
blogPosts.filter(matches, compare('tags', 'includes', 'b'));
blogPosts.filter(matches, compare('published', 'after', new Date(2020, 12, 15)));
```
