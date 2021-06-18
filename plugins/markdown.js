import marked from 'marked';
import yaml from 'yaml';
import { promises as fs } from 'fs';
import path from 'path';

export default function markdownPlugin({ plugins, root, prod }, opts) {
	plugins.push(markdownRollupPlugin({ root, prod, ...opts }));
}
markdownPlugin.rollup = markdownRollupPlugin;

const FRONT_MATTER_REG = /^\s*---\n\s*([\s\S]*?)\s*\n---\n/i;
const TITLE_REG = /^\s*#\s+(.+)\n+/;
async function processMarkdown(filename, opts) {
	let meta = {};
	let content = await fs.readFile(filename, 'utf-8');
	content = content.replace(FRONT_MATTER_REG, (s, fm) => {
		meta = yaml.parse('---\n' + fm.replace(/^/gm, '  ') + '\n') || meta;
		return '';
	});
	content = content.replace(TITLE_REG, s => {
		if (!meta.title) return (meta.title = s), '';
		if (meta.title.toLowerCase().trim() === s.toLowerCase().trim()) return '';
		return s;
	});
	// meta.title = meta.title || (content.match(TITLE_REG) || [])[1];
	// meta.description = meta.description || content.replace(TITLE_REG, '').match(/^\n*([^\n]+)/)[1];
	let html = marked(content, opts);
	if (!meta.image) {
		const start = content.match(/^([^\n]*\n+){1,10}/g)[0];
		const img = start.match(/<img(?: [^>]*?)? src=(['"]?)(.*?)\1(?: [^>]*?)?[ /]*>/);
		meta.image = img && img[2];
	}
	html = '<!--' + JSON.stringify(meta) + '-->\n' + html;
	return html;
}

/**
 *  markdown plugin for Rollup / WMR
 *  @example
 *  import html from 'markdown:./pages';
 */
function markdownRollupPlugin({ root, prod, ...opts }) {
	return {
		name: 'markdown',
		async resolveId(id, importer) {
			if (id[0] === '\0') return;
			if (id.startsWith('markdown:')) id = id.slice(9);
			else if (!id.endsWith('.md')) return;
			if (importer) importer = importer.replace(/^[\0\b]\w+:/g, '');
			// if (!prod) {
			// 	try {
			// 		// const resolved = await this.resolve(id, importer, { skipSelf: true });
			// 		const resolved = path.resolve(cwd || '.', path.dirname(importer), id);
			// 		const html = await processMarkdown(resolved, opts);
			// 		return `data:text/javascript,${encodeURIComponent('export default ' + JSON.stringify(html))}`;
			// 		// const code = await p.load.call(this, `\0markdown:${path.join(path.dirname(importer), id)}`);
			// 		// return `data:text/javascript,${encodeURIComponent(code)}`;
			// 	} catch (err) {
			// 		console.log('failed to resolve: ', err);
			// 	}
			// }
			return `\0markdown:${path.join(path.dirname(importer), id)}`;
			// const resolved = await this.resolve(id, importer, { skipSelf: true });
			// if (resolved) return '\0markdown:' + resolved.id;
			// if (id.endsWith('.md')) return '\0markdown:' + path.join(path.dirname(importer), id);
			// if (id.endsWith('.md')) {
			//   return this.resolve(id + '.js', importer, { skipSelf: true });
			// }
		},
		async load(id) {
			// if (!id.endsWith('.md')) return;
			// if (!id.endsWith('.md.js')) return;
			// id = id.replace(/\.js$/g, '');
			// const html = marked(await fs.readFile(id, 'utf-8'), opts);
			// return `export default ${JSON.stringify(html)}`;

			if (!id.startsWith('\0markdown:')) return;
			id = path.resolve(root || '.', id.slice(10));

			this.addWatchFile(id);
			const html = await processMarkdown(id, opts);

			// if (!prod) {
			// 	return `export default ${JSON.stringify(html)};`;
			// }

			// console.log(path.relative(cwd || '.', id));
			const fileId = this.emitFile({
				type: 'asset',
				name: path.relative(root || '.', id),
				fileName: path.relative(root || '.', id),
				source: html
			});
			return `export default import.meta.ROLLUP_FILE_URL_${fileId}`;
		}
		// transform(code, id) {
		// 	code = code.replace(/(\bimport\s*\(\s*)(.*?)(\s*\))/g, (s, b, arg, a) => {
		// 		// arg = arg.replace(/(?:\/\*[\s\S]*?\*\/|\/\/.*(\n))/g, '$1');
		// 		arg = arg.replace(/\s*\/\*[\s\S]*?\*\/\s*/g, '');
		// 		let scheme;
		// 		arg = arg.replace(/^(['"`])([a-z0-9-]+)\:(\.*\/)/, (s, q, _scheme, start) => {
		// 			scheme = _scheme;
		// 			return q + start;
		// 		});
		// 		if (scheme) arg += '+"?_scheme=' + scheme + '"';
		// 		console.log(b, arg, a);
		// 		return b + arg + a;
		// 		// return s;
		// 	});
		// 	return { code, map: null };
		// }
	};
}
