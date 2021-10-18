import { hydrate, ErrorBoundary, LocationProvider, Router } from 'preact-iso';
import Header from './components/Header/index.js';
import Home from './components/Home/index.js';
import NotFound from './components/NotFound/index.js';
import Blog from './components/Blog/index.js';
import BlogPost from './components/BlogPost/index.js';
import './analytics.js';
import './styles/markdown.scss';

let didPush = false;
if (typeof window !== 'undefined') {
	let o = history.pushState;
	history.pushState = function () {
		didPush = true;
		return o.apply(history, arguments);
	};
}

function resetScroll() {
	if (didPush) window.scrollTo(0, 0);
	didPush = false;
}

export function App() {
	return (
		<LocationProvider>
			<div class="app">
				<Header />
				<ErrorBoundary>
					<Router onLoadEnd={resetScroll}>
						<Home path="/" />
						<Blog path="/blog/:page?" />
						<BlogPost path="/:slug" />
						<NotFound default />
					</Router>
				</ErrorBoundary>
			</div>
		</LocationProvider>
	);
}

hydrate(<App />);

export async function prerender(data) {
	const fs = await eval('u=>import(u)')('fs/promises');
	globalThis.fetch = async url => {
		const text = () => fs.readFile('dist/' + String(url).replace(/^\//, ''), 'utf-8');
		return { text, json: () => text().then(JSON.parse) };
	};
	await (await import('./rssfeed.js')).write('rss.xml', fs);
	const { default: prerender } = await import('preact-iso/prerender');
	return await prerender(<App {...data} />);
}
