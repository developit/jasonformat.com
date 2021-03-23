---
slug: my-webpack-boilerplate
title: My ES2015 + LESS Webpack Setup
published: 10/28/2015, 11:00:00 PM
updated: 10/28/2015, 11:36:29 PM
_created: 10/28/2015, 11:00:05 PM
---

> **Foreword:** I generally do these things as Gists, but I figured this one is such a common question it would be worthwhile posting here.

Let's talk about Webpack for a sec. It's great and I think there comes a point in many projects where you step slightly beyond what Browserify and its plugin ecosystem are able to do (ancient non-npm dependencies, etc).  Often times the best solution is still Browserify, just with some tweaking - maybe you need to fork that module and refactor it a bit to properly export things.

What if there was a way to make Webpack behave as simply as Browserify, right out of the box?  That's where I'm at. It's annoying to switch back and forth depending on the project, when I'm generally using these two tools to accomplish the same task.

Here's what I now use when starting a new Webpack-based app project _(not for libraries, for just use Browserify)_:

##### Install Webpack & Friends

```sh
npm i -D webpack webpack-dev-server babel babel-loader less-loader css-loader style-loader autoprefixer-loader
```

##### Add NPM-Scripts

```js
"scripts": {
  "dev": "WEBPACK=webpack-dev-server npm run build -s",
  "build": "${webpack:-webpack} src/index.js --output-path build --output-file bundle.js -d --module-bind 'js=babel' --module-bind 'less=style!css!autoprefer!less'"
}
```

... then run them via `npm run dev` and `npm run build`.


---


## Full Webpack Setup

This is a basic Webpack project template for a web app written in ES6 & LESS.

This assumes you have a directory structure as follows:

```
package.json
webpack.config.js
src/
  index.js
  static/
    index.html
```

---

#### Installation

**1. Clone the repo and start your own:**

```sh
git clone git@gist.github.com:3c83db422f03ef66ea36.git
rm -rf .git
git init
```

**2. Install dependencies:**

```sh
npm install
```

That's it.

#### Development Workflow

**Start the live-reload dev server:**

```sh
PORT=8080 npm run dev
```

Open up http://localhost:8080/webpack-dev-server/ to see your app.
The app gets reloaded as files change.

#### Deployment Workflow

To deploy your static app, upload the contents of `build/` to a web server.

Or, push this repo to heroku. `http-server` is used to serve the files in `build/`.

Or, and like the best option, deploy this to Firebase. Use this [firebase.json](https://gist.github.com/developit/b27ad8af7eacf92d2ef9).

#### `package.json`

<script src="https://gist.github.com/developit/042c6c87f34c4f211072.js"></script>

#### `webpack.config.js`

<script src="https://gist.github.com/developit/83fca68d58cc3dbad909.js"></script>