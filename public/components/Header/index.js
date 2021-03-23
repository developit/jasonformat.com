import { useMemo, useReducer, useState, useCallback } from 'preact/hooks';
import config from '../../config.json';
import styles from './style.module.scss';

function useDarkMode() {
	const [darkMode, setDarkMode] = useReducer((state, c) => {
		if (c == null) {
			state = null;
		} else if (typeof c === 'boolean') {
			state = c;
		} else {
			state = state !== true;
		}
		if (state) document.documentElement.setAttribute('dark', '');
		else document.documentElement.removeAttribute('dark');
		return state;
	}, null);
	const mq = useMemo(() => {
		try {
			const mq = matchMedia('(prefers-color-scheme: dark)');
			mq.onchange = e => update(e.matches);
			return mq;
		} catch (e) {}
	}, []);
	const [auto, update] = useState((mq && mq.matches) || false);
	return [darkMode == null ? auto : darkMode, setDarkMode];
}

export default function Header() {
	const [darkMode, toggleDarkMode] = useDarkMode();

	return (
		<header class={styles.header}>
			<nav>
				<a href="/">
					<img src={config.logo} class={styles.logo} title="Home" />
				</a>
				<a href="/blog">Blog</a>
			</nav>
			<nav class={styles.right}>
				<a href="https://twitter.com/_developit" target="_blank" rel="noopener" title="Twitter">
					<TwitterIcon />
				</a>
				<a href="https://github.com/developit" target="_blank" rel="noopener" title="GitHub">
					<GitHubIcon />
				</a>
				<input class={styles.dark} type="checkbox" checked={darkMode} onClick={toggleDarkMode} title="Dark Mode" />
			</nav>
		</header>
	);
}

/** @returns {import('preact').FunctionComponent} */
function icon(path) {
	return props => (
		<svg width="24" height="24" viewBox="0 0 24 24" {...props}>
			<path d={path} />
		</svg>
	);
}

const GitHubIcon = icon(
	'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
);

const TwitterIcon = icon(
	'M24 4.6c-.9.3-1.8.6-2.8.7a5 5 0 002.1-2.7c-1 .6-2 1-3 1.2a5 5 0 00-8.5 4.5A14 14 0 011.7 3a5 5 0 001.5 6.6c-.8 0-1.6-.2-2.2-.6A5 5 0 005 14a5 5 0 01-2.3 0 5 5 0 004.6 3.5 9.9 9.9 0 01-7.3 2A14 14 0 0021.5 7.1 10 10 0 0024 4.6z'
);
