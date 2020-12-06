(function() {
	const CONFIG = window.exports.CONFIG;
	const xhr = window.exports.xhr;

	const loadStyles = () => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = CONFIG.url.styles;
		document.head.appendChild(link);
	};

	const loadFonts = () => {
		const style = document.createElement('style');
		style.textContent = `@import url("${CONFIG.url.fonts}");`;
		document.head.appendChild(style);
	};

	const onSpriteLoad = (data) => {
		const div = document.createElement('div');
		div.classList.add(CONFIG.class.hide);
		div.innerHTML = data;
		document.body.appendChild(div);
	};

	const onTemplatesLoad = (data) => {
		const div = document.createElement('div');
		div.classList.add(CONFIG.class.hide);
		div.id = 'templates';
		div.innerHTML = data;
		document.body.appendChild(div);
	};

	const load = (cb) => {
		loadStyles();
		loadFonts();
		xhr.getRequest(CONFIG.url.svg, 'text/plain', onSpriteLoad).send();
		xhr.getRequest(CONFIG.url.templates, 'text/plain', (data) => {
			onTemplatesLoad(data);
			xhr.getRequest(CONFIG.url.news, 'application/json', (data) => {
				cb(data);
			}).send();
		}).send();
	};

	window.exports.loader = { load };
})();