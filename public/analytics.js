const b = 'UA-6031694-16';
const z = 'https://www.google-analytics.com/collect';
function m(r) {
	let t,
		x,
		s = [];
	for (t in r) if ((x = r[t]) || x === 0) s.push(encodeURIComponent(t) + '=' + encodeURIComponent(x));
	return s.join('&');
}
function n(r, s, t, u, v, w, x) {
	try {
		var cid = localStorage.cid || (localStorage.cid = Math.random().toString(36));
	} catch (e) {}
	let A = m({
		v: 1,
		ds: 'web',
		tid: b,
		cid: cid,
		t: r || 'pageview',
		dr: document.referrer,
		dt: document.title,
		dl: location.origin + location.pathname + location.search,
		ul: (navigator.language || '').toLowerCase(),
		de: document.characterSet,
		sr: typeof screen != 'undefined' ? screen.width + 'x' + screen.height : undefined,
		vp: typeof visualViewport != 'undefined' ? visualViewport.width + 'x' + visualViewport.height : undefined,
		ec: s,
		ea: t,
		el: u,
		ev: v,
		exd: w,
		exf: typeof x != 'undefined' && false == !!x ? 0 : undefined
	});
	if (navigator.sendBeacon) navigator.sendBeacon(z, A);
	else {
		let y = new XMLHttpRequest();
		y.open('POST', z, true);
		y.send(A);
	}
}
if (typeof window != 'undefined') {
	n();
	const i = history.pushState;
	history.pushState = function () {
		return setTimeout(n, 10), i.apply(history, arguments);
	};
	window.ma = {
		trackEvent(r, s, t, u) {
			n('event', r, s, t, u);
		},
		trackException(e) {
			n('event', 'Exception', ((e.error && e.error.stack) || e.error) + '', e.error && e.error.message);
		}
	};
	addEventListener('error', ma.trackException);
}
