import config from './config.json';
import posts from 'content:./content/blog';

export async function write(filename, fs) {
	let xml = await render(<Feed posts={posts} />, { fs });
	xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
	await fs.writeFile('build/' + filename, xml);
}

const Feed = ({ posts = [] }) => (
	<feed xmlns="http://www.w3.org/2005/Atom">
		<id>{config.origin}</id>
		<title>{config.title}</title>
		<updated>{new Date().toISOString()}</updated>
		<logo>{config.origin}{config.avatar}</logo>
		{posts.map(post => <Post post={post} />)}
	</feed>
);

async function Post({ post }, { fs }) {
	const html = await (await fetch(`/content/blog/${post.name}.md`)).text();
	const { html: content, meta } = extractMeta(html);
	const image = meta.image || post.image;
	return (
		<entry>
			<id>{post.name}</id>
			<updated>{post.updated || post.published}</updated>
			<title>{post.title}</title>
			<link href={config.origin + '/' + post.name} />
			{image && <image url={image} />}
			<summary>{post.description}</summary>
			<content type="html" dangerouslySetInnerHTML={{ __html: `<![CDATA[${content}]]>` }} />
		</entry>
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

async function render(vnode, context) {
	if (typeof vnode !== 'object') return escape(String(vnode));
	if (Array.isArray(vnode)) return Promise.all(vnode.map(v => render(v, context)));
	let type = vnode.type;
	if (typeof type === 'function') {
		let c;
		if (type.prototype && type.prototype.render) c = await new type(vnode.props, context);
		else c = { _render: type, render: doRender };
		c.__d = true;
		c.setState = c.forceUpdate = noop;
		let rendered = await c.render(c.props = vnode.props, c.state = c.state || {}, c.context = context);
		if (c.getChildContext) context = Object.assign({}, context, c.getChildContext());
		return render(rendered, context);
	}
	if (!type || /[^\w:]/.test(type)) throw Error('invalid type: ' + type);
	let str = '<' + type;
	let children, html;
	for (let i in vnode.props) {
		let value = vnode.props[i];
		if (i === 'children') children = value;
		else if (i === 'dangerouslySetInnerHTML') html = value;
		else if (value != null && (value !== false || /^ar/.test(i))) {
			str = str + ' ' + i + (value === true ? '' : `"${escape(value)}"`);
		}
	}
	if (html) {
		str = str + (html.__html || '');
	} else if (children) {
		str = str + await render(children, context);
	}
	str = str + '</' + type + '>';
	return str;
}

function noop() {}

function doRender(props, state, context) {
	return this._render(props, context);
}

function escape(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}