import fs from 'fs/promises';
import yaml from 'yaml';

const SKIP_UNPUBLISHED = true;

(async file => {
	console.log(`Importing from ${file}`);
	const json = await fs.readFile(file, 'utf-8');
	let data = JSON.parse(json);
	if (!data.db || !data.db[0]) throw Error('Malformed: missing top-level `db` key.');
	console.log(`Restoring from Ghost data exported at ${new Date(data.db[0].meta.exported_on).toLocaleString()}.`);
	data = data.db[0].data;
	// console.log(Object.keys(data));

	const settings = data.settings.reduce(
		(acc, setting) => {
			let { key, value } = setting;
			try {
				value = JSON.parse(value);
			} catch (e) {}
			if (!/^(navigation|permalinks|cover|logo|title|description|postsPerPage)$/.test(key)) {
				if (key === 'ghost_head' || key === 'ghost_foot') {
					console.warn(`\n⚠️ Warning: ignoring ${key} configuration:\n${value.replace(/^/gm, '  ')}\n`);
				}
				return acc;
			}
			acc[key] = value;
			return acc;
		},
		{ title: null, description: null, logo: null }
	);

	await fs.writeFile('public/config.json', JSON.stringify(settings, null, '\t'));
	console.log(`✅ Wrote settings to public/config.json.\n`);

	const posts = data.posts.slice().sort((a, b) => +new Date(a.published_at) - +new Date(b.published_at));
	for (const post of posts) {
		if (SKIP_UNPUBLISHED === true && post.status !== 'published') {
			continue;
		}
		const meta = {
			slug: post.slug,
			status: post.status === 'published' ? null : post.status,
			featured: post.featured || null,
			title: post.title,
			description: post.description || post.meta_description,
			image: post.image,
			published: post.published_at && new Date(post.published_at).toLocaleString(),
			updated:
				post.updated_at && post.updated_at === post.published_at ? null : new Date(post.updated_at).toLocaleString(),
			_created: new Date(post.created_at).toLocaleString(),
			meta_title: post.meta_title,
			meta_description: post.meta_description
		};
		const m = {};
		for (let i in meta) if (meta[i] != null) m[i] = meta[i];
		const fm = yaml.stringify(m);
		const markdown = `---\n${fm}---\n\n${post.markdown}`;
		await fs.writeFile('public/content/blog/' + post.slug + '.md', markdown);
	}
})(process.argv[2]).catch(console.error);
