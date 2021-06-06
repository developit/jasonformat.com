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

Using the `items` Array from the first example, we can create a function that returns `true` for items with a given `id` value, and define that value when calling `.find()`:

```js
function itemHasId(item) {
  return item.id === this;  // we get to supply `this` each time we call find()
}

items.find(itemHasId, 10);  // { id:10 }
items.find(itemHasId, 42);  // { id:42 }
```

This approach works for all sorts of search functions you might think of:

```js
function isGreaterThan(item) {
  return item > this;
}
[5,10,15,20].findIndex(isGreaterThan, 10); // 2

function hasSrc(element) {
  return element.src === new URL(this, location.href).href
}
[...document.querySelectorAll('img')].filter(hasSrc, '/assets/icon.png');
```

It's also easier to test than more typical approaches of hard-code criteria into the search function or accessing it from an outer scope.
I sometimes prefix the name of a search predicate with a `$` to indicate that it expects a comparison value to be provided via `this`.
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
function $hasName(item) { return item.name === this }
function $hasTag(item) { return item.tags.includes(this) }
function $publishedAfter(item) { return new Date(item.published) > this }

// ...and specify the comparison value dynamically:
blogPosts.find($hasName, 'one');      // {name:'one'…}
blogPosts.findIndex($hasName, 'two'); // 1

blogPosts.every($hasTag, 'b');        // true
blogPosts.filter($hasTag, 'b');       // [{name:'one'…}, {name:'three'…}]
blogPosts.filter($publishedAfter, new Date(2020, 12, 25));  // [{name:'three'…}]
```

### Word of Warning

Unfortunately, the performance of this approach is generally worse than using an Arrow Function without some additional optimization work:

![benchmark results showing thisValue is slower than other functionally equivalent options except when the value is an object reused on each invocation](https://i.imgur.com/KQ4687e.png)

If you're doing something performance-critical, it's probably best to avoid this technique. However, it _is_ possible to squeeze some potentially valuable performance out of `thisValue` by passing a shared object reference:

```js
function itemHasId(item) {
  return item.id === this.value;
}

const criteria = {};

items.find(itemHasId, (criteria.value = 10, criteria));
items.find(itemHasId, (criteria.value = 42, criteria));
```

This could potentially be a useful approach when implementing more complex searching logic, since the context object can have any number of properties controlling comparison behavior:

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

const criteria = {};
function compare(property, comparator, value) {
  criteria.property = property;
  criteria.comparator = comparator;
  criteria.value = value;
}

items.filter(matches, compare('id', '>', 40));

// borrowing from the previous example:
blogPosts.filter(matches, compare('tags', 'includes', 'b'));
blogPosts.filter(matches, compare('published', 'after', new Date(2020, 12, 15)));
```
