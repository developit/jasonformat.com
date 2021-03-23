import dir from '@wmr-plugins/directory-import';
import markdown from './plugins/markdown.js';
import content from './plugins/content.js';
import prism from './public/lib/prism.js';

/** @param {import('wmr').Options} config */
export default function (config) {
	dir(config);
	content(config);
	markdown(config, {
		// gfm: true,
		// breaks: true,
		// headerIds: true,
		// smartLists: true,
		// smartyPants: true,
		highlight(code, lang) {
			try {
				return prism.highlight(code, prism.languages[lang], lang);
			} catch (e) {
				return code.replace(/[<>&]/g, s => (s == '<' ? '&lt;' : s == '>' ? '&gt;' : '&amp;'));
			}
		}
	});
}
