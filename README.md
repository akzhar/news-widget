# news widget
Виджет новостной ленты: https://akzhar.github.io/news-widget

### Подключение виджета
`<script src="js/news-widget.min.js"></script>`

### Описание
Скрипт загружает набор данных, из которых формируется лента новостей. Одно сообщение ленты содержит поля:
```
    ...
    	{
    		"title": "Заголовок новости",
    		"author": "Автор",
    		"datetime": "Дата и время",
    		"link": "Ссылка на подробности"
    	},
    ...
```
После загрузки данных в правом нижнем углу страницы появляется иконка [ <img src="https://raw.githubusercontent.com/akzhar/news-widget/main/src/img/favicon.png" alt="bell" title="bell" width="14"/> ] с отображением количества сообщений в ленте. При клике на иконку открывается виджет со списком новостей. Виджет можно закрыть с помощью кнопки в правом верхнем углу страницы или клавишей Escape. При переходе по ссылке соответствующее сообщение в ленте отмечается как прочитанное.

### Конфиг файл
В файле [./src/js/config.js](https://github.com/akzhar/news-widget/blob/main/src/js/config.js) находится конфиг виджета. В переменной `CONFIG.url` хранятся ссылки на загружаемые виджетом ресурсы:
```
    ...
		url: {
			news: 'data/news.json', // набор данных с новостями
			fonts: 'https://fonts.googleapis.com/css2?family=Oswald&display=swap', // шрифт
			styles: 'css/widget.min.css', // файл css стилей
			svg: 'img/sprite.min.svg', // инлайн спрайт с svg иконками
			templates: 'templates.html' // шаблоны html
		}
	...
```