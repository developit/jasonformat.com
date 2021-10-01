// import posts from 'dir:../../content/blog';
import posts from 'content:../../content/blog';
import config from '../../config.json';
import styles from './style.module.scss';

export default function Blog({ params = {}, count = config.postsPerPage, moreText = '' }) {
	document.title = `Blog - ${config.title}`;

	let { page = 0 } = params;
	count = Math.min(posts.length, Math.max(0, Math.round(count || 5)));
	page = Math.round(page || 0);
	const start = Math.max(0, Math.min(posts.length - count, page * count));
	const next = start < posts.length - count ? page + 1 : null;
	const prev = start > 0 ? page - 1 : null;
	return (
		<section class={'content ' + styles.blog}>
			{posts.slice(start, start + count).map(post => {
				const url = '/' + post.name;
				const thumb =
					post.image && post.image.replace(/image\/upload\/([a-z]+_\w+(,[a-z]+_\w+)*\/)?/, 'image/upload/c_thumb,f_auto,q_60,g_face,h_200,w_400/');
				const pub = new Date(post.published);
				const [, month, day, year] = pub.toDateString().split(' ');
				return (
					<div class={styles.post}>
						<div>
							<a href={url}>{post.title || post.name}</a>
							<time title={pub + ''}>{`${month} ${day}, ${year}`}</time>
							<p>{post.description}</p>
						</div>
						{thumb && <img src={thumb} alt="" loading="lazy" width="400" height="200" />}
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
