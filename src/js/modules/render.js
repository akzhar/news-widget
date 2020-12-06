(function() {
	const CONFIG = window.exports.CONFIG;

	const getNewsElem = (newsItem, index, newsElem) => {
		const article = newsElem.querySelector(`.${CONFIG.class.article}`);
		const number = article.querySelector(`.${CONFIG.class.articleIcon}--number > span`);
		const header = article.querySelector(`.${CONFIG.class.articleHeader}`);
		const info = article.querySelector(`.${CONFIG.class.articleInfo}`);
		const link = article.querySelector(`.${CONFIG.class.articleLink}`);
		const datetime = info.querySelector(`.${CONFIG.class.articleDatetime}`);
		const author = info.querySelector(`.${CONFIG.class.articleAuthor}`);

		number.textContent = index + 1;
		header.innerHTML = newsItem.title;
		datetime.textContent = newsItem.datetime;
		author.textContent = newsItem.author;
		link.href = newsItem.link;
		link.id = `newsLink-${index}`;
		article.id = `news-${index}`;

		return newsElem;
	};

	// для современных браузеров - вставка виджета через тэг template
	const widgetModern = (news) => {
		const iconTemplate = document.querySelector(`#${CONFIG.id.widgetIconTemplate}`);
		const iconElem = iconTemplate.content.querySelector(`.${CONFIG.class.widgetIcon}`).cloneNode(true);
		const counter = iconElem.querySelector(`#${CONFIG.id.widgetIconCounter}`);
		iconElem.title = `You have ${news.length} unread news`;
		counter.textContent = news.length;

		const widgetTemplate = document.querySelector(`#${CONFIG.id.widgetTemplate}`);
		const widgetElem = widgetTemplate.content.querySelector(`.${CONFIG.class.widget}`).cloneNode(true);
		const newsList = widgetElem.querySelector(`#${CONFIG.id.list}`);
		const itemTemplate = document.querySelector(`#${CONFIG.id.itemTemplate}`);
		const itemCard = itemTemplate.content.querySelector(`.${CONFIG.class.item}`);

		news.forEach((newsItem, index) => {
			const itemElem = itemCard.cloneNode(true);
			const newsElem = getNewsElem(newsItem, index, itemElem);
			newsList.appendChild(newsElem);
		});

		document.body.appendChild(iconElem);
		document.body.appendChild(widgetElem);
	};

	const updateWidgetIcon = (unreadCount) => {
		const iconElem = document.querySelector(`#${CONFIG.id.widgetIcon}`);
		const counter = iconElem.querySelector(`#${CONFIG.id.widgetIconCounter}`);
		if (unreadCount) {
			iconElem.title = `You have ${unreadCount} unread news`;
			counter.textContent = unreadCount;
		} else {
			iconElem.title = 'You have no unread news yet';
			iconElem.classList.remove(`${CONFIG.class.widgetIcon}--animate`);
			counter.classList.add(`${CONFIG.class.widgetIconCounter}--hide`);
		}
	};

	const markArticleAsRead = (articleId) => {
		const article = document.querySelector(articleId);
		const readIcon = article.querySelector(`.${CONFIG.class.articleIcon}--read`);
		article.classList.add(`${CONFIG.class.article}--read`);
		readIcon.classList.add(`${CONFIG.class.articleIcon}--read--show`);
	};

	const showWidget = () => {
		document.querySelector(`#${CONFIG.id.widgetIcon}`).classList.remove(`${CONFIG.class.widgetIcon}--show`);
		document.querySelector(`#${CONFIG.id.widget}`).classList.add(`${CONFIG.class.widget}--show`);	
	};

	const hideWidget = () => {
		document.querySelector(`#${CONFIG.id.widgetIcon}`).classList.add(`${CONFIG.class.widgetIcon}--show`);
		document.querySelector(`#${CONFIG.id.widget}`).classList.remove(`${CONFIG.class.widget}--show`);	
	};

	// все что ниже для IE - вставка виджета из скрипта (без template)

	const SVG = {
		notification: '<svg id="notification" width="14" height="14" viewBox="0 0 512 512"><path d="M467.812 431.851l-36.629-61.056a181.363 181.363 0 01-25.856-93.312V224c0-67.52-45.056-124.629-106.667-143.04V42.667C298.66 19.136 279.524 0 255.993 0s-42.667 19.136-42.667 42.667V80.96C151.716 99.371 106.66 156.48 106.66 224v53.483c0 32.853-8.939 65.109-25.835 93.291L44.196 431.83a10.653 10.653 0 00-.128 10.752c1.899 3.349 5.419 5.419 9.259 5.419H458.66c3.84 0 7.381-2.069 9.28-5.397 1.899-3.329 1.835-7.468-.128-10.753zm-278.997 37.482C200.847 494.464 226.319 512 255.993 512s55.147-17.536 67.179-42.667H188.815z"></path></svg>'
	};

	const widgetIE = (news) => {
		const widgetElem = `<div class="news-widget">
								<div class="news-icon" id="news-icon" title="You have ${news.length} unread news">
									<output class="news-icon__counter" id="news-counter">${news.length}</output>
									${SVG.notification}
								</div>
								<ul class="news-widget__news-list news-list" id="news-list">
									${getListIE(news)}
								</ul>
							</div>`;
		document.body.innerHTML += widgetElem;
	};

	const getListIE = (news) => {
		return news.reduce((newsList, newsItem) => newsList + getItemElemIE(newsItem), '');
	};

	const getItemElemIE = (newsItem) => {
		return `<li class="news-list__news-item news-item">
					<h5 class="news-item__header">${newsItem.title}</h5>
					<p><b>Author:</b> ${newsItem.author}</p>
					<time><b>Published:</b> ${newsItem.datetime}</time>
					<a href="${newsItem.link}">Link to the whole article...</a>
				</li>`;
	};

	// если не убрать шаблоны, то в IE обработчик вешается на тег внутри самого template
	// сам template в IE не удалить, т.к. IE его не может найти в документе
	const removeTemplates = () => {
		const templates = document.querySelector('#templates');
		templates.parentNode.removeChild(templates);
	};

	window.exports.render = { widgetModern, widgetIE, removeTemplates, updateWidgetIcon, markArticleAsRead, hideWidget, showWidget };
})();