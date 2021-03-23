---
slug: how-css-modules-work-today
title: How CSS Modules Work (today)
published: 1/10/2016, 4:59:11 PM
updated: 2/17/2019, 3:12:08 PM
_created: 1/10/2016, 4:41:31 PM
---

Here's a quick intro to how you can make use of [CSS Modules] today, using Webpack's awesome [css-loader].

First off, let's make sure we're on the same page.  We want to colocate our CSS styles with our components, because they are already coupled anyway.  I'll be using `less` today, but this applies to raw CSS, LESS, SCSS, etc.

### Folder Structure

```
components/
  foo/
    index.js
    style.less
```


### The Styles

First off, let's write some LESS:

```css
.foo {
    padding: 10px;

    header.bar {
        color: black;
        font-size: 200%;
    }
}
```

... pretty standard LESS. The classNames are super generic, which is normally a horrible idea, but CSS modules are going to namespace everything so that collisions are extremely unlikely.


### Importing CSS Modules

In order to use modular CSS, we need to "import" the styles.  This process transforms the CSS rules, namespacing all classes. As with normal imports, [css-loader] then injects your stylesheet into the document.  The big difference here is that there is an actual value returned from our import, which is an object mapping of *local* CSS class names to their *namespaced* versions.


```js
import style from './style.less';

export default class Foo extends Component {
    render() {
        return (
            <div class={ style.foo }>
                <header class={ style.bar }>Sup</header>
                etc
            </div>
        );
    }
}
```

If you were to `console.log(style)`, you would see that in addition to "injecting" your CSS into the document, the import actually returns a mapping of class names to local class names:

```js
console.log(style);
{ foo:"foo_foo_abcde", bar:"foo_bar_abcde" }
```

> **How this works:**  When you `import` the less/css/scss file, it gets added as a stylesheet _(somewhere, handled internally by [css-loader])_.  Your classnames will be transformed to "local" (namespaced) classnames.  You can control how this works, but the most common way is to transform `.class` into `filename_class_[hash:0:5]`.  This keeps things namespaced _(by file)_, versioned _(via the truncated hash)_, and readable _(the original class name is still there)_.


All of this means that when you set `class={style.foo}` in your JSX _(or any other form of markup)_, you're setting it to the _local_ version of that named class, `class="foo_foo_abcde"`.

---

In order for all of this to work, you need to tell [css-loader] that you want to use [CSS Modules]:

```js
module: {
  loaders: [
    {
      test: /\.(less|css)$/,
      loader: [
        'style',
        'css?modules&importLoaders=1',
        'less'   // if you want .less support
      ].join('!')
    }
  ]
}
```

If you want to customize the imported "local" names, you can supply a simple template string for the `localIdentName` option:

```js
css?modules&importLoaders=1&localIdentName=[local]_[hash:base64:5]
```

Think this seems worth it?

[CSS Modules]: https://github.com/css-modules/css-modules
[css-loader]: https://github.com/webpack/css-loader
