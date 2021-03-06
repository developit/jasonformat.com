import config from './config.json';
import posts from 'content:./content/blog';

export async function write(filename, fs) {
	let xml = await render(<Feed filename={filename} posts={posts} />, { fs });
	xml = '<?xml version="1.0" encoding="utf-8"?>\n' + xml;
	await fs.writeFile('dist/' + filename, xml);
}

const toISO = date => new Date(`${date} GMT${config.tz}`).toISOString().replace('.000Z', config.tz.replace(/(\d\d)$/, ':$1'));

const Feed = ({ filename, posts = [] }) => (
	<feed xmlns="http://www.w3.org/2005/Atom">
		<id>{config.origin}/</id>
		<title>{config.title}</title>
		<updated>{toISO(posts[0].updated || posts[0].published)}</updated>
		<logo>{config.origin}{config.logo}</logo>
		<link href={config.origin + '/' + filename} rel="self" />
		{posts.map(post => <Post post={post} />)}
	</feed>
);

async function Post({ post }, { fs }) {
	const html = await (await fetch(`/content/blog/${post.name}.md`)).text();
	let { html: content, meta } = extractMeta(html);
	const image = meta.image || post.image;
	if (image) content = `<img src="${escape(image)}" alt="${escape(post.title)}"><br />\n\n${content}`;
	return (
		<entry>
			<id>{config.origin}/{post.name}</id>
			<updated>{toISO(post.updated || post.published)}</updated>
			<title>{post.title}</title>
			<link href={config.origin + '/' + post.name} />
			<author><name>Jason Miller</name></author>
			<summary>{post.description}</summary>
			<content type="html" dangerouslySetInnerHTML={{ __html: `<![CDATA[\n${content}\n]]>` }} />
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
	if (vnode == null || typeof vnode === 'boolean') return '';
	if (typeof vnode !== 'object') return escape(String(vnode));
	if (Array.isArray(vnode)) return (await Promise.all(vnode.map(v => render(v, context)))).join('');
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
			str = str + ' ' + i + (value === true ? '' : `="${escape(value)}"`);
		}
	}
	let inner = '';
	if (html) {
		inner = html.__html || '';
	} else if (children) {
		inner = await render(children, context);
	}
	if (inner) {
		str = str + '>' + inner + '</' + type + '>';
	} else {
		str = str + ' />';
	}
	return str;
}

function noop() {}

function doRender(props, state, context) {
	return this._render(props, context);
}

function escape(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}