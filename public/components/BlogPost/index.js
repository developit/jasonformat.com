import { lazy } from 'preact-iso';
// import posts from 'content:../../content/blog';
import '../../styles/prism.css';
import config from '../../config.json';

function DisplayBlogPost({ html, meta }) {
	document.title = `${meta.title} - ${config.title}`;
	const head = self.wmr && self.wmr.ssr && self.wmr.ssr.head;
	if (meta.description && head && head.elements) {
		head.elements.clear();
		head.elements.add({ type: 'meta', props: { name: 'description', content: meta.description } });
	}
	const pub = new Date(meta.published);
	const [, month, day, year] = pub.toDateString().split(' ');
	return (
		<div class="post">
			<div class="post-meta">
				{meta.image && <img src={meta.image} alt="" decoding="async" />}
				<h1>{meta.title}</h1>
				<time title={pub + ''}>{`${month} ${day}, ${year}`}</time>
			</div>
			<div class="content md" dangerouslySetInnerHTML={{ __html: html }} />
			<footer>
				<h5>There used to be comments here.</h5>
				<p>
					Instead, <a href="https://mastodon.social/@developit">toot</a> or <a href="https://twitter.com/_developit">tweet me</a> your comments.
				</p>
			</footer>
		</div>
	);
}

function extractMeta(html) {
	let meta = {};
	html = html.replace(/^\n*<!--\s*({.*?})\s*-->\n*/, (s, json) => {
		meta = JSON.parse(json);
		return '';
	});
	return { html, meta };
}

const loaders = {};
export default function BlogPost({ params = {}, ...props }) {
	const { slug = '' } = params;
	let C = loaders[slug];
	if (!C) {
		C = loaders[slug] = lazy(async () => {
			// const { url } = posts.find(p => p.name === slug);
			const url = `/content/blog/${slug}.md`;
			const res = await fetch(url);
			const html = await res.text();
			const parsed = extractMeta(html);
			return props => <DisplayBlogPost {...parsed} {...props} />;
		});
	}
	return <C {...props} slug={slug} />;
}
