// import posts from 'dir:../../content/blog';
import posts from 'content:../../content/blog';
import config from '../../config.js';
import styles from './style.module.scss';

export default function Blog({ page = 0, count = config.postsPerPage, moreText = '' }) {
	count = Math.min(posts.length, Math.max(0, Math.round(count || 5)));
	page = Math.round(page || 0);
	const start = Math.max(0, Math.min(posts.length - count, page * count));
	const next = start < posts.length - count ? page + 1 : null;
	const prev = start > 0 ? page - 1 : null;
	return (
		<section class={'content ' + styles.blog}>
			{posts.slice(start, start + count).map(post => {
				const url = '/' + post.name;
				return (
					<div class={styles.post}>
						<div>
							<a href={url}>{post.title || post.name}</a>
							<p>{post.description}</p>
						</div>
						{post.image && <img src={post.image} alt="" />}
					</div>
				);
			})}
			<footer>
				<a class={styles.newer} disabled={prev == null} href={prev ? `/blog/${prev}` : '/blog'}>
					← Newer Posts
				</a>
				<a class={styles.older} disabled={next == null} href={next != null && `/blog/${next}`}>
					{moreText || 'Older Posts →'}
				</a>
			</footer>
		</section>
	);
}
