'use strict';

(function() {
	const CONFIG = {
		id: {
			widgetTemplate: 'widget-template',
			widgetIconTemplate: 'widget-icon-template',
			itemTemplate: 'item-template',
			widget: 'widget',
			widgetIcon: 'widget-icon',
			widgetIconCounter: 'widget-icon-counter',
			list: 'list',
			article: 'article-',
			articleLink: 'articleLink-',
			btnClose: 'btn-close'
		},
		class: {
			hide: 'hide',
			widget: 'widget',
			widgetIcon: 'widget-icon',
			widgetIconCounter: 'widget-icon__counter',
			item: 'item',
			article: 'article',
			articleHeader: 'article__header',
			articleInfo: 'article__info',
			articleIcon: 'article__icon',
			articleDatetime: 'article__datetime',
			articleAuthor: 'article__author',
			articleLink: 'article__link'
		},
		regexp: { articleLinkId: /^articleLink-\d+$/ },
		timeout: 5000,
		status: { ok: 200 },
		msg: {
			fail: 'Something went wrong...',
			error: 'Network related problem occured',
			timeout: 'Request exceeded the maximum time limit'
		},
		url: {
			news: 'https://raw.githubusercontent.com/akzhar/news-widget/main/src/data/news.json', // 'data/news.json',
			fonts: 'https://fonts.googleapis.com/css2?family=Oswald&display=swap',
			styles: 'css/widget.min.css',
			svg: 'img/sprite.min.svg',
			templates: 'templates.html'
		}
	};

	// namespace для экспорта модулей
	window.exports = { CONFIG }; 
})();