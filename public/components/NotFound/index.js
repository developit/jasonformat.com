import config from '../../config.json';

const NotFound = () => {
	document.title = config.title;

	return (
		<section className="content">
			<h1>404: Not Found</h1>
			<p>It's gone :(</p>
		</section>
	);
}

export default NotFound;
