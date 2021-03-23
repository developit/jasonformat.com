import Blog from '../Blog/index.js';
import config from '../../config.json';
import styles from './style.module.scss';

export default function Home() {
	return (
		<section class="home">
			<header class={styles.jumbotron}>
				{config.cover && <div class={styles.cover} style={{ backgroundImage: `url(${config.cover})` }} />}
				<h1>{config.title}</h1>
				<p>{config.description}</p>
			</header>
			<Blog moreText="More Posts →" />
		</section>
	);
}
