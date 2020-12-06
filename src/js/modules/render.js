(function() {
	const CONFIG = window.exports.CONFIG;

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

	// вставка виджета, используя тэг template
	const renderUsingTemplates = (news) => {
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
			const newsElem = getNewsElemUsingTemplates(newsItem, index, itemElem);
			newsList.appendChild(newsElem);
		});

		document.body.appendChild(iconElem);
		document.body.appendChild(widgetElem);
	};

	const getNewsElemUsingTemplates = (newsItem, index, newsElem) => {
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
		link.id = `${CONFIG.id.articleLink}${index}`;
		article.id = `${CONFIG.id.article}${index}`;

		return newsElem;
	};

	// вставка виджета из скрипта без использования <template>
	const renderWidget = (news) => {
		const iconElem = 
		`<div class="widget-icon widget-icon--show widget-icon--animate" id="widget-icon" title="You have ${news.length} unread news">
			<output class="widget-icon__counter" id="widget-icon-counter">${news.length}</output>
			<svg width="14" height="14">
				<use xlink:href="#bell"></use>
			</svg>
		</div>`;

		const widgetElem =
		`<div class="widget" id="widget">
			<ul class="widget__list list" id="list">${getListOfItems(news)}</ul>
			<button class="btn-close" id="btn-close" aria-label="Close widget button" title="Close widget"></button>
		</div>`;

		document.body.innerHTML += iconElem;
		document.body.innerHTML += widgetElem;
	};

	const getListOfItems = (news) => {
		return news.reduce((newsList, newsItem, index) => newsList + getItemElem(newsItem, index), '');
	};

	const getItemElem = (newsItem, index) => {
		const itemElem = 
		`<li class="list__item item">
			<div class="item__wrapper">
				<article class="article" id="${CONFIG.id.article}${index}">
					<div class="article__icon article__icon--number"><span>${index + 1}</span></div>
					<div class="article__icon article__icon--read" title="Read">
						<svg width="14" height="14">
							<use xlink:href="#view"></use>
						</svg>
					</div>
					<header class="article__header">${newsItem.title}</header>
					<div class="article__info">
						<div class="article__icon" title="Published">
							<svg width="14" height="14">
								<use xlink:href="#clock"></use>
							</svg></div>
						<datetime class="article__datetime">${newsItem.datetime}</datetime>
						<div class="article__icon" title="Author">
							<svg width="14" height="14">
								<use xlink:href="#user"></use>
							</svg>
						</div>
						<span class="article__author">${newsItem.author}</span>
					</div>
					<a class="article__link" href="${newsItem.link}" target="_blank" id="${CONFIG.id.articleLink}${index}">Подробнее</a>
				</article>
			</div>
		</li>`;

		return itemElem;
	};

	// если не убрать шаблоны, то в IE обработчик вешается на тег внутри самого <template>
	// сам тег <template> в IE не удалить, т.к. IE его не может найти в документе
	const removeTemplates = () => {
		const templates = document.querySelector('#templates');
		templates.parentNode.removeChild(templates);
	};

	window.exports.render = { renderUsingTemplates, renderWidget, removeTemplates, updateWidgetIcon, markArticleAsRead, hideWidget, showWidget };
})();