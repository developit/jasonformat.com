---
slug: application-holotypes
title: "Application Holotypes: A Guide to Architecture Decisions"
description: Analyzing real-world apps is difficult. Classifying based on
  features & constraints enables targeted solutions to the problems faced by
  each.
published: 2/15/2019, 11:33:29 AM
updated: 12/1/2019, 4:03:06 PM
_created: 2/15/2019, 11:22:02 AM
meta_title: "Application Holotypes: A Guide to Architecture Decisions"
meta_description: Analyzing real-world apps is difficult. Classifying based on
  features & constraints enables targeted solutions to the problems faced by
  each.
---

<div align="center">
<video src="https://res.cloudinary.com/wedding-website/video/upload/ac_none,c_scale,w_800/v1550250966/holotypes_kmgtw4.mp4" width="400" style="max-height:300px;" autoplay playsinline muted loop></video>
</div>

Analyzing the characteristics of real-world applications is difficult. We often make generalizations about applications we see in the wild, both anecdotal and statistical: "Single-Page Applications are slower than multipage" or "apps with low TTI loaded fast". However, the extent to which these generalizations hold for the performance and architectural characteristics we care about varies. I believe one of the primary determinants of this variability are a product's features and design constraints, and classifying applications based on their features & constraints can enable more targeted and impactful solutions to the problems faced by each.

Constructing a set of named categories into which applications can be effectively grouped presents a challenge: it's difficult to predict all possible groups, and the boundaries set by each are subjective and likely to change over time. Furthermore, abstract groupings like this can be difficult to reason about or visualize. For example, what performance optimization techniques might we recommend to developers of "thick-client, page-centric rich media applications with offline browsing and user contribution"? It's much easier to frame discussions in the concrete, asking instead what we might recommend to developers of "Instagram-like apps".

In order to establish this framing, we can construct a list of holotype applications. These can either be representative of the web as it exists today, or predicated on changes we foresee developers making in response to trends and platform initiatives. To make things easier, holotypes representing portions of the web's long tail of historical and legacy content can be more general, whereas those representing current and upcoming applications can be more narrowly scoped to allow for more specific recommendations.


## Meet the Holotypes

Each holotype application is accompanied by a rough category name, additional real-world examples, as well as the characteristics & constraints that define its architecture. Ideal implementation and delivery techniques are also provided, based on the architectural context.

#### 🎪 Social Networking Destinations

**Holotype:**  Facebook  
**Examples:**  LinkedIn, Reddit, Google+  
**Characteristics:**  multifaceted, sub-applications, infinite scrolling content, user contribution, realtime updates, notifications  
**Constraints:**  extended session depth, large scale, realtime updates, resource contention from embedded content, nested applications, SEO  
**Ideal Implementation:**  Single-Page Application with prerendering of shell and landing pages.  
**Ideal Delivery:**  PWA in standalone display mode. TWA.

#### 🤳 Social Media Applications

**Holotype:**  Instagram  
**Examples:** Youtube, Twitter  
**Characteristics:**  rich media, infinite scrolling content, user contribution, realtime updates, notifications, embeddability, embedded content  
**Constraints:**  extended session depth, realtime updates, resource contention from embedded content, uninterruptible media playback, SEO  
**Ideal Implementation:**  Single-Page Application with app shell prerendering & caching.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 🛍 Storefronts

**Holotype:**  Amazon  
**Examples:**  Bestbuy, Newegg, Shopify(-based stores)  
**Characteristics:**  search, payments, discoverability, filtering & sorting  
**Constraints:**  shallow to medium session depth, small interactions, high cart/checkout dropoff, SEO  
**Ideal Implementation:**  Server-rendered site with CSR/SPA takeover or turbolinks-style transitions.  
**Ideal Delivery:**  PWA in default display mode.

#### 📰 Content Websites

**Holotype:**  CNN  
**Examples:**  FT, BBC, BuzzFeed, Engadget, Salon, Smashing Magazine, The Onion  
**Characteristics:**  discoverability, rich media, embedded content  
**Constraints:**  shallow session depth (~1), resource contention from ads & multivariate testing, SEO  
**Ideal Implementation:**  Server-rendered site with turbolinks-style transitions.  
**Ideal Delivery:**  PWA in default display mode.

#### 📨 [PIM](https://en.wikipedia.org/wiki/Personal_information_management) Applications

**Holotype:**  Gmail  
**Examples:**  Google Calendar, Outlook.com, Fastmail  
**Characteristics:**  thick-client, infinite lists, embedded content, rich text editing, sanitization, MDI, storage, offline & sync, notifications  
**Constraints:**  extended session length, sensitive & largely uncacheable data, high security risk, often offline  
**Ideal Implementation:**  Single Page App with app shell caching.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 📝 Productivity Applications

**Holotype:**  Google Docs  
**Examples:**  Office.com, Zoho, Dropbox, Box  
**Characteristics:**  thick-client, rich text editing, offline & sync, filesystem, clipboard, storage, image manipulation, embedded content  
**Constraints:**  extended session length and multiple concurrent sessions favor client-side implementation.  
**Ideal Implementation:**  Single Page App. Consider app shell caching. Unload page between apps.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 🎧 Media Players

**Holotype:**  Spotify  
**Examples:**  Youtube Music, Google Play Music, Tidal, Soundcloud, Pandora, Deezer  
**Characteristics:**  rich media, thick-client, infinite scrolling content, filtering & sorting, notifications, OS integration, offline, embeddability  
**Constraints:**  extended session length, playback must continue as the user navigates.  
**Ideal Implementation:**  Single Page App with app shell prerendering & caching. Server-render &lt;head&gt; for discovery.  
**Ideal Delivery:** PWA in standalone display mode.

#### 🎨 Graphical Editors

**Holotype:**  Figma  
**Examples:**  AutoCAD, Tinkercad, Photopea, Polarr  
**Characteristics:**  3D rendering & GPU, image manipulation, fullscreen & pointer capture, MDI, storage, offline, filesystem, threads, wasm  
**Constraints:**  long session length, sensitivity to input & rendering latency, large objects/files  
**Ideal Implementation:**  Single Page App. Separate lighter browsing UI from editor.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 👨‍🎤 Media Editors

**Holotype:**  Soundtrap  
**Examples:**  Looplabs  
**Characteristics:**  Audio processing, device integration (midi,usb), storage, offline, filesystem, threads, wasm  
**Constraints:**  long session length, low-latency DSP, low-latency media recording & playback, large file sizes/IO  
**Ideal Implementation:**  Single Page App. Separate lighter browsing UI from editor.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 👩‍💻 Engineering Tools

**Holotype:**  Codesandbox  
**Examples:**  Codepen, Jupyter Notebook, RStudio, StackBlitz  
**Characteristics:**  thick-client, MDI, storage, offline, filesystem, threads, embedded content  
**Constraints:**  extremely long session length, low-latency text input, large memory footprint, custom input handling and text rendering, security of preview content  
**Ideal Implementation:**  Single Page App. Consider separating browsing UI from editor.  
**Ideal Delivery:**  PWA in standalone display mode.

#### 🎮 Immersive / AAA Games

**Holotype:**  Stadia  
**Examples:**  Heraclos, Duelyst, OUIGO  
**Characteristics:**  3D rendering & GPU, P2P, audio processing, fullscreen & pointer capture, storage, offline, filesystem, threads, device integration (gamepad), wasm  
**Constraints:**  long session length (highly interactive), immersion, extremely sensitive to input and rendering latency, requires consistent or stepped FPS, extreme asset sizes  
**Ideal Implementation:**  Single Page App  
**Ideal Delivery:**  PWA in fullscreen display mode.

#### 👾 Casual Games

**Holotype:**  Robostorm  
**Examples:**  Tank Off, War Brokers, GoreScript, Air Wars, ".io games"  
**Characteristics:**  2D & 3D rendering & GPU, P2P, audio processing, storage, offline, embeddability  
**Constraints:**  long session length, sensitive to input and rendering latency, needs consistent/stepped FPS  
**Ideal Implementation:**  Single Page App  
**Ideal Delivery:**  embedded in another site, or PWA in fullscreen display mode.


> Think I'm missing representation for a category?
>
> Missing a good example? Comment or tweet your suggestions!
