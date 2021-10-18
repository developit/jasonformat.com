---
slug: preact-ama-on-sideway
title: Preact AMA on Sideway
published: 7/7/2017, 12:38:24 PM
updated: 7/7/2017, 12:39:27 PM
_created: 7/7/2017, 12:34:36 PM
---

> 🎤 This was originally published as [Preact.js with Jason Miller](https://sideway.com/room/aY) on Sideway.

---

[Preact](https://preactjs.com) is a **fast 3kB** alternative to React with the same API, providing the thinnest possible Virtual DOM abstraction on top of the DOM.

In this conversation, Preact's author [Jason Miller](https://twitter.com/_developit) discusses the project goals, progress, the relationship with the larger React community, and his plans for the future.

---

> What's the Preact origin story? How did it come to be?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Preact started out as a way for me to learn how React worked internally.  I've always felt a little uncomfortable using things without fully understanding their internals, so I needed to code out a basic version of a DOM diff algorithm in order to grasp how it affected my application development.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** It started out as a Codepen, and actually lived there for quite a bit until a rough 1.0.  I genuinely love starting out libraries (and even apps) that way, since it keeps you on your toes.  Break something and it'll take the whole tab down (unless you turn off autorun, but that's no fun haha).


> At what point did it turn into an actual framework? What made you decide to switch over to using that instead of React?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I actually wasn't really a React user prior to building Preact!  I was a Web Components guy.  The platform I used for the 2 years prior to writing Preact was a custom DOM implementation sitting on top of the real DOM, and it had support for Custom Elements and Shadow DOM and all that stuff.  I really liked that development paradigm and the shareability of Web Components, but I didn't like having to use things like innerHTML to get things done.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I'd say Preact turned into a framework ("became a thing") around December of 2014 (double check the year on that one).  I used it to build an email client and was thrilled with the performance and how quick it was to work with.  I recall thinking "how could I ever use a different paradigm now?".


> At the time, was it already tracking the React API?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** The initial versions on Codepen were basically "inspired by".  I knew the names and most of the externally visible concepts from React's docs, and I liked them so I used those names and borrowed some concepts.  Until December / 2.x though, it was more of a similarity than any hope of parity.  It took me a while to decide whether that was even something I cared about or not.  In the end I'm happy Preact shares so much of its interface with React because it's wonderful for those familiar with React to be able to re-use their skills in places they might not have been able to before.


> If you really are Canadian, does preact stand for Poutine React?

> **- [James Kyle](https://sideway.com/user/thejameskyle)**

> (or, what does the P stand for?)


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Haha.  Everyone asks what it means - I have the worst answer imaginable for that question: it doesn't really mean anything.  I think when I was trying to come up with witty names I ended up getting quite sick of thinking about it and just wanted to buy the domain name so I could be done with it.  I had been sitting on "preact" as some sort of combination of "puny" or "petit" (french for "small") "react", but the logic there is lost to the sands of time.  It might have been something about "getting there first" (referring to small bundle size?) "re+act" vs "pre+act" - you can tell from my explanation though, it was not rooted in logic.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I'd be willing to invent sufficient backstory to support Kyle's Poutine React naming idea.  That one could stick.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** oh also - if anyone is ever in the Toronto area and wants to drive for an hour (it happens a lot), this is the best poutine place around: http://www.charred.ca


> How big is the Preact community? Both in terms of contributors, developers using it, and product deployments.


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** It's actually a little larger than people might realize.  In terms of contributors, most of the activity in preact-compat (the "full React compatibility" layer) is coming from people who are not me, and that's awesome.  Developers who have used React extensively often have good insight into issues when they arise in that repo.  Preact's core has seen some awesome contributions too, we've had people rework test harnesses and write lots more tests (much needed), submit PRs not just for bug fixes but to suggest/add entirely new behaviors like Paul Lewis's PR for fully async rendering of siblings.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** On the usage side of things, I'm aware of quite a few companies that now rely on Preact for real-world applications.  There's obviously Housing.com, Tencent, TicTail - those are pretty public about their usage of Preact.  My employer uses it extensively as well, and a few other companies I'm not sure I'm allowed to mention publicly yet!  There are some people making use of Preact for things I hadn't even thought of before - last week the lovely people of Zeit were investigating using Preact to render Hyper (a desktop app!). That's some of the cool things I'm aware of.


> Is this still a hobby free-time project for you, or has it turned into a more of a work-time effort?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** ahh - the question of the year for 2016 honestly. Preact is definitely past the point of counting as a hobby project or spare-time-only now.  My employer depends on it, as do lots of other developers and their respective employers.  For me, I think the moment where Preact officially outgrew spare-time status was when I started getting the first major contributions and issues coming in.  Now it's more or less part of my daily job, though indirectly.  When there's a bug in Preact it's often worth stopping and looking into even if it means shelving something else I'm working on.  It could be an issue for Synacor or anyone else using the library, so it gets a fairly high priority on my todo list.


> How sacred is the **3Kb** part of the Preact tag line?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** If I'm honest, it's priority #1 and the main metric by which I judge a Preact release.  3kb as a line in the sand isn't the most meaningful number, but I think it's incredibly important to set boundaries on development when taking performance into account in a holistic way.  If Preact added all of the features anyone had ever wanted to its core, it wouldn't be a very modular solution for developers looking to put together their own stack.  It would also make it difficult for people to use just the parts they need (or like!).  One good example of that is createClass and PropTypes not being included in the library - these are things that can really easily be bolted on, the former doesn't even require any hooks from Preact to implement.  So they are available as separate npm modules for people to install when they want that type of functionality.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I think size limits can seem a little arbitrary to people, and I understand why sometimes it could be confusing or even frustrating that a library cuts a line between features and size.  However, Preact's value comes from that size - it's the small way to use Virtual DOM.  Without that 3kb line in the sand, it would just be too tempting to add features without properly weighing their net benefit.


> If size wasn't a goal, would you just use React or are there other reasons you prefer to use Preact (other than it's your own framework and everything that allows)?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Awesome question - short answer is probably not.  Part of that is because I'm human, and thus biased towards using things I create.  That's actually something I've been actively working on over the past 2 years, and part of the reason I do so much Open Source work.  If I want to create, I need to create in public and consume equally as much in order to recognize the value in others' work.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** In terms of reasoning, Preact is both a solution for size, and to a much lesser degree a collection of changes I wanted to make to the React API for my own liking.  The first is passing (props, state, context) to component render methods - that was something Preact had on day 1, it just seemed so obvious to me.  There are others, too - dropping PropTypes (since there are so many other ways to accomplish interface typing these days), and automatically passing context through the tree instead of having to declare a need for it.  These are things that got baked into Preact early in its life, and they haven't been removed because they either help with the size aspect, or are just nice to work with.


> How should developers determine whether Preact's lack of virtual events is fine for them?

> **- [Owen Campbell-Moore](https://sideway.com/user/owencm)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I love this question, because it's actually not one I've answered publicly yet.  For those not aware, Preact uses the DOM's event system directly instead of abstracting it.  That means things like capturing and bubbling work the way the browser defines, Preact just proxies your event handlers to addEventListener() and friends.  When you consider that I came from Web Components land, I think this makes a lot of sense - I'm quite familiar with DOM events, their nomenclature and semantics make sense to me.  Adding an abstraction that changes any of those meanings, or changes how the events interact with other libraries on a web page actually hurts my ability to understand what's going on.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** So, I would say developers should determine this based on how familiar or comfortable they are with DOM events.  If you came from jQuery and/or Backbone, or use Web Components, etc - you will will very comfortable with Preact's event handling because it's what you've already been using.  If you're a hardcore React developer though, and maybe if that's where you started your in-browser development experience, using Preact means getting better acquainted with the DOM events underpinning your application.  Things like onChange vs onInput - differences between the names and meanings in React and the DOM - those are the differences between React and Preact.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** It's probably also worth noting that preact-compat attempts to smooth over those naming and semantics differences by normalizing events during rendering.


> Is preact-compat a custom module or is it just a fork of existing react code?

> **- [Mark Struck](https://sideway.com/user/mark_struck)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Ah this one's less philosophical - it's all custom code.  preact-compat is actually one very long reverse-engineering exercise.  I used to alias it in for React in demos for various React Component libraries like Material UI and just look for problems.  When I found a problem I'd add a fix to preact-compat, and eventually it grew into a layer that paves over most of the differences between the two libraries.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** There is one shared dependency though, and I hope it becomes more directly shared in the future: PropTypes.  preact-compat depends on the `proptypes` module from npm, which is a refactored version of the PropTypes implementation from React I extracted from React 0.14.  I hope at some point the React team chooses to make PropTypes an external module - if they do, I've got the name on npm and I'm happy to give it to them!


> Do you have a plan to handle React Fiber's ability to return different types such as arrays in preact-compat?

> **- [Kye Hohenberger](https://sideway.com/user/tkh)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** That's actually much more likely to be implemented in preact itself, rather than preact-compat.  Returning an Array from render() was not something I'd ever had in mind when building Preact, so when I heard that was going to become a thing I started slowly making some of the necessary changes to support that behavior.  It touches a lot of areas of the library, but the worst offender was the implementation of Pure Functional Component diffing.  PFC's are (were?) ephemeral in Preact for a long time.  In Preact 8 (coming soon!), that has been changed and they are diffed using the same codepath as classful Components.  This means dealing with alternative return types from `render()` only affects one spot in the renderer, which makes it a lot easier to deal with.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** The other reason this particular issue is troublesome is that Preact diffs very differently from React - it diffs your Virtual DOM tree against the actual DOM tree.  Instead of diffing the array return value of `render()`, Preact is going to have to store fragments on DOM elements and diff within those.  It's by no means infeasible, but it's a little more difficult because of how the diff is designed.


> Do you think there are strong reasons for a team to choose Preact over React, or there use cases better suited to both?

> **- [Jason Quense](https://sideway.com/user/monasticpanic)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I think it's really a decision every team has to make, either when starting out a project (ideal), or when encountering issues along the way (still workable).  React is an excellent library and has a great ecosystem.  There will always be great arguments in favor of choosing React.  Preact caters to some different use-cases than React though, so for a lot of teams there is actually very little choice.  Anecdotally, the team I work on builds widgets that get embedded into other companies' websites - this is a really great use-case for Preact, because of the self-contained nature of the library and obviously because of the size advantage.  You can use Preact to render tiny little parts of a page, and not have to worry about event interoperability or bundle size - those are things Preact actively takes care of for you.


> Do you worry optimizing Preact for existing JS engine quirks will prevent the engines from evolving in good directions as it will slow down in benchmarks against frameworks / libs with these optimizations?

> **- [Owen Campbell-Moore](https://sideway.com/user/owencm)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Yes. I definitely optimize *in* Chrome, and I tend to favor V8 because the team has been so supportive of developers and open about how their engine works.  Tools like IRHydra don't really exist for other engines, so it's not practical to optimize for other engines to the same extent.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** That being said, I do run all of my benchmarks in different browsers to make sure a performance optimization for one doesn't have the opposite effect on another.  I'm not sure how common it is to do that, but I think it's valuable.  In the early days of Preact I actually had made the mistake of adding V8-specific optimizations that hurt performance in Firefox.  That as a valuable lesson, and since then I've made sure to track performance metrics across a wider spectrum of engines.  This is especially true for Internet Explorer - old versions of IE are already going to be some of the slowest to run JavaScript, so adding performance optimizations for modern browsers that negatively impact performance in IE9 can really hurt users stuck on that browser.


> What's next on your plate for Preact?


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Version 8 is the next big thing.  It's a breaking change, though not the kind that makes you pull your hair out.  One big thing is the rewrite of Pure Functional Component handling - that's done but waiting to be released.  Another is dropping support for Object values in the `class` (/`className`) prop - that was causing issues for styling solutions that rely on Objects with overridden `toString()` methods to serialize classes dynamically during rendering.  The last one, and probably the largest of the changes coming up, is that it looks like we're going to drop DOM element recycling.  That might sound crazy, but it's actually become rather unnecessary since Preact 4 or 5.  Around that time, the way Components are rendered was changed so that their generated DOM is recycled based on component type.  Unless people are building apps entirely without any form of components, it's unlikely the element recycler is even doing much work!  This was only made more true by the PFC changes, since now they're nicely tracked in the Virtual DOM tree for their own recycling.


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Aside from that, I'm working on some things that aren't part of Preact itself.  A CLI for building PWA's with Preact that "just works" out-of-the-box is one of those things, though it's really early.  I'm also looking at ways to improve DX.


> Is Preacts diffing between Virtual DOM and the real DOM slower than React's diffing algorithm?

> **- [Mark Struck](https://sideway.com/user/mark_struck)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** It would be, except Preact caches data on DOM elements so that it doesn't touch them except to update.  That was one of the optimizations that came out of the Codepen era.  Profiling while running animations made it really obvious that touching the DOM in order to diff was a bad idea ;)


> I have another naming suggestion:
https://uploads.sideway.com/r/aY/7W:syfAmu:Advx/full

> **- [James Kyle](https://sideway.com/user/thejameskyle)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Looks like I need to buy react-s.com (it's available!)

> Is there any thing the community can do to help make Preact better!?

> **- [Peter Piekarczyk](https://sideway.com/user/peterpme)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Yes! Help write tests. Build UI frameworks around it. Use Preact and give feedback.  Build tooling that makes your life easier when working with it.  Everyone who uses Preact is helping make it better, because your feedback guides all the development.


> Do you think React and Preact will ever converge together down the road?

> **- [Peter Piekarczyk](https://sideway.com/user/peterpme)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Not converge, but I think React will eventually work to address some of the use-cases Preact is advantageous for right now.  That benefits everyone, so it makes me happy.  With Fiber and simplified custom renderers, it might be possible to build a lightweight render (a "preact react renderer"!) that brings the two projects closer than they could be today.


> Have you built any Preact apps that leveraged Redux? Also, what is your opinion on Redux?

> **- [Mark Struck](https://sideway.com/user/mark_struck)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** I have built some demos, a hackathon project and a few other odds and ends.  I really love the idea of Redux and the code is a joy to read.  However, since I started building Preact apps using regular old Component state, that's still where my brain likes to go when I get down to work.  I think an ideal case for me would be a mix of Redux for holding intentionally centralized state, and component-local state for UI-specific things.  Who knows though, every app is different!


> Thanks Jason! This has been great. We (Sideway) have been looking at Preact for a while and I know it's something we would like to use for the obvious size reduction.


> **- [Eran Hammer](https://sideway.com/user/eranhammer)**

**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Awesome! There's a Slack group by the way, where lots of these types of discussions happen at random throughout the day: https://preact-slack.now.sh


**[Eran Hammer](https://sideway.com/user/eranhammer):** And with that, goodbye!


**[Jason Miller 🦊⚛](https://sideway.com/user/developit):** Thanks for the opportunity to answer some great questions!

