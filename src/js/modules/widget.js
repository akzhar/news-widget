(function() {
	const CONFIG = window.exports.CONFIG;
	const loader = window.exports.loader;
	const render = window.exports.render;

	class Widget {
		contructor() {
			this._news = undefined;
			this._unreadCount = undefined;
		}

		get news() { return this._news; }
		set news(value) { this._news = value; }
		get unreadCount() { return this._unreadCount; }
		set unreadCount(value) { this._unreadCount = value; }

		init() {
			const onLoad = this.onLoad.bind(this);
			loader.load(onLoad);
		}

		onLoad(data) {
			const news = JSON.parse(data);
			this.news = news;
			this.unreadCount = news.length;
			this.render();
			this.addListeners();		
		}

		render() {
			// если браузер поддерживает тег <template>
			if ('content' in document.createElement('template')) {
				render.renderUsingTemplates(this.news);
			} else {
				render.renderWidget(this.news);
				render.removeTemplates(this.news);
			}
		}

		addListeners() {
			document.querySelector(`#${CONFIG.id.widgetIcon}`).addEventListener('click', this.show);
			document.querySelector(`#${CONFIG.id.btnClose}`).addEventListener('click', this.hide);
			document.querySelector(`#${CONFIG.id.list}`).addEventListener('click', (evt) => {
				if (evt.target.tagName === 'A' && CONFIG.regexp.articleLinkId.test(evt.target.id)) this.onArticleLinkClick(evt.target.id);
			});
			window.addEventListener('keydown', (evt) => {
				if (evt.key === 'Escape' || evt.key === 'Esc') this.hide();
			});
		}

		onArticleLinkClick(linkId) {
			const id = Widget.getNewsIdByArticleLinkId(linkId);
			if (!this.news[id].isRead) {
				this.news[id].isRead = true;
				this.unreadCount--;
				const articleId = Widget.getArticleIdByNewsId(id);
				render.markArticleAsRead(articleId);
				render.updateWidgetIcon(this.unreadCount);
			}
		}
		
		show() { render.showWidget(); }

		hide() { render.hideWidget(); }

		static getNewsIdByArticleLinkId(id) { return +id.slice(id.indexOf('-') + 1, id.length); }

		static getArticleIdByNewsId(id) { return `#${CONFIG.id.article}${id}`; }
	}

	window.exports.Widget = Widget;
})();