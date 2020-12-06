'use strict';

(function () {
  var CONFIG = {
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
    "class": {
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
    regexp: {
      articleLinkId: /^articleLink-\d+$/
    },
    timeout: 5000,
    status: {
      ok: 200
    },
    msg: {
      fail: 'Something went wrong...',
      error: 'Network related problem occured',
      timeout: 'Request exceeded the maximum time limit'
    },
    url: {
      news: 'https://raw.githubusercontent.com/akzhar/news-widget/main/src/data/news.json',
      // 'data/news.json',
      fonts: 'https://fonts.googleapis.com/css2?family=Oswald&display=swap',
      styles: 'css/widget.min.css',
      svg: 'img/sprite.min.svg',
      templates: 'templates.html'
    }
  }; // namespace для экспорта модулей

  window.exports = {
    CONFIG: CONFIG
  };
})();
"use strict";

(function () {
  var CONFIG = window.exports.CONFIG;

  var reject = function reject(msg) {
    alert(msg);
    throw new Error(msg);
  }; // ф-ция принимает ссылку, тип загружаемоего ресурса и обработчик успешного запроса
  // ф-ция возвращает объект xhr с методом send()


  var getRequest = function getRequest(url, contentType, resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.timeout = CONFIG.timeout;
    xhr.addEventListener('error', function () {
      return reject(CONFIG.msg.error);
    });
    xhr.addEventListener('timeout', function () {
      return reject(CONFIG.msg.timeout);
    });
    xhr.addEventListener('load', function () {
      if (xhr.status != CONFIG.status.ok) reject("".concat(CONFIG.msg.fail, "\n").concat(xhr.status, ": ").concat(xhr.statusText));
      resolve(xhr.responseText);
    });
    return xhr;
  };

  window.exports.xhr = {
    getRequest: getRequest
  };
})();
"use strict";

(function () {
  var CONFIG = window.exports.CONFIG;
  var xhr = window.exports.xhr;

  var loadStyles = function loadStyles() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CONFIG.url.styles;
    document.head.appendChild(link);
  };

  var loadFonts = function loadFonts() {
    var style = document.createElement('style');
    style.textContent = "@import url(\"".concat(CONFIG.url.fonts, "\");");
    document.head.appendChild(style);
  };

  var onSpriteLoad = function onSpriteLoad(data) {
    var div = document.createElement('div');
    div.classList.add(CONFIG["class"].hide);
    div.innerHTML = data;
    document.body.appendChild(div);
  };

  var onTemplatesLoad = function onTemplatesLoad(data) {
    var div = document.createElement('div');
    div.classList.add(CONFIG["class"].hide);
    div.id = 'templates';
    div.innerHTML = data;
    document.body.appendChild(div);
  };

  var load = function load(cb) {
    loadStyles();
    loadFonts();
    xhr.getRequest(CONFIG.url.svg, 'text/plain', onSpriteLoad).send();
    xhr.getRequest(CONFIG.url.templates, 'text/plain', function (data) {
      onTemplatesLoad(data);
      xhr.getRequest(CONFIG.url.news, 'application/json', function (data) {
        cb(data);
      }).send();
    }).send();
  };

  window.exports.loader = {
    load: load
  };
})();
"use strict";

(function () {
  var CONFIG = window.exports.CONFIG;

  var updateWidgetIcon = function updateWidgetIcon(unreadCount) {
    var iconElem = document.querySelector("#".concat(CONFIG.id.widgetIcon));
    var counter = iconElem.querySelector("#".concat(CONFIG.id.widgetIconCounter));

    if (unreadCount) {
      iconElem.title = "You have ".concat(unreadCount, " unread news");
      counter.textContent = unreadCount;
    } else {
      iconElem.title = 'You have no unread news yet';
      iconElem.classList.remove("".concat(CONFIG["class"].widgetIcon, "--animate"));
      counter.classList.add("".concat(CONFIG["class"].widgetIconCounter, "--hide"));
    }
  };

  var markArticleAsRead = function markArticleAsRead(articleId) {
    var article = document.querySelector(articleId);
    var readIcon = article.querySelector(".".concat(CONFIG["class"].articleIcon, "--read"));
    article.classList.add("".concat(CONFIG["class"].article, "--read"));
    readIcon.classList.add("".concat(CONFIG["class"].articleIcon, "--read--show"));
  };

  var showWidget = function showWidget() {
    document.querySelector("#".concat(CONFIG.id.widgetIcon)).classList.remove("".concat(CONFIG["class"].widgetIcon, "--show"));
    document.querySelector("#".concat(CONFIG.id.widget)).classList.add("".concat(CONFIG["class"].widget, "--show"));
  };

  var hideWidget = function hideWidget() {
    document.querySelector("#".concat(CONFIG.id.widgetIcon)).classList.add("".concat(CONFIG["class"].widgetIcon, "--show"));
    document.querySelector("#".concat(CONFIG.id.widget)).classList.remove("".concat(CONFIG["class"].widget, "--show"));
  }; // вставка виджета, используя тэг template


  var renderUsingTemplates = function renderUsingTemplates(news) {
    var iconTemplate = document.querySelector("#".concat(CONFIG.id.widgetIconTemplate));
    var iconElem = iconTemplate.content.querySelector(".".concat(CONFIG["class"].widgetIcon)).cloneNode(true);
    var counter = iconElem.querySelector("#".concat(CONFIG.id.widgetIconCounter));
    iconElem.title = "You have ".concat(news.length, " unread news");
    counter.textContent = news.length;
    var widgetTemplate = document.querySelector("#".concat(CONFIG.id.widgetTemplate));
    var widgetElem = widgetTemplate.content.querySelector(".".concat(CONFIG["class"].widget)).cloneNode(true);
    var newsList = widgetElem.querySelector("#".concat(CONFIG.id.list));
    var itemTemplate = document.querySelector("#".concat(CONFIG.id.itemTemplate));
    var itemCard = itemTemplate.content.querySelector(".".concat(CONFIG["class"].item));
    news.forEach(function (newsItem, index) {
      var itemElem = itemCard.cloneNode(true);
      var newsElem = getNewsElemUsingTemplates(newsItem, index, itemElem);
      newsList.appendChild(newsElem);
    });
    document.body.appendChild(iconElem);
    document.body.appendChild(widgetElem);
  };

  var getNewsElemUsingTemplates = function getNewsElemUsingTemplates(newsItem, index, newsElem) {
    var article = newsElem.querySelector(".".concat(CONFIG["class"].article));
    var number = article.querySelector(".".concat(CONFIG["class"].articleIcon, "--number > span"));
    var header = article.querySelector(".".concat(CONFIG["class"].articleHeader));
    var info = article.querySelector(".".concat(CONFIG["class"].articleInfo));
    var link = article.querySelector(".".concat(CONFIG["class"].articleLink));
    var datetime = info.querySelector(".".concat(CONFIG["class"].articleDatetime));
    var author = info.querySelector(".".concat(CONFIG["class"].articleAuthor));
    number.textContent = index + 1;
    header.innerHTML = newsItem.title;
    datetime.textContent = newsItem.datetime;
    author.textContent = newsItem.author;
    link.href = newsItem.link;
    link.id = "".concat(CONFIG.id.articleLink).concat(index);
    article.id = "".concat(CONFIG.id.article).concat(index);
    return newsElem;
  }; // вставка виджета из скрипта без использования <template>


  var renderWidget = function renderWidget(news) {
    var iconElem = "<div class=\"widget-icon widget-icon--show widget-icon--animate\" id=\"widget-icon\" title=\"You have ".concat(news.length, " unread news\">\n\t\t\t<output class=\"widget-icon__counter\" id=\"widget-icon-counter\">").concat(news.length, "</output>\n\t\t\t<svg width=\"14\" height=\"14\">\n\t\t\t\t<use xlink:href=\"#bell\"></use>\n\t\t\t</svg>\n\t\t</div>");
    var widgetElem = "<div class=\"widget\" id=\"widget\">\n\t\t\t<ul class=\"widget__list list\" id=\"list\">".concat(getListOfItems(news), "</ul>\n\t\t\t<button class=\"btn-close\" id=\"btn-close\" aria-label=\"Close widget button\" title=\"Close widget\"></button>\n\t\t</div>");
    document.body.innerHTML += iconElem;
    document.body.innerHTML += widgetElem;
  };

  var getListOfItems = function getListOfItems(news) {
    return news.reduce(function (newsList, newsItem, index) {
      return newsList + getItemElem(newsItem, index);
    }, '');
  };

  var getItemElem = function getItemElem(newsItem, index) {
    var itemElem = "<li class=\"list__item item\">\n\t\t\t<div class=\"item__wrapper\">\n\t\t\t\t<article class=\"article\" id=\"".concat(CONFIG.id.article).concat(index, "\">\n\t\t\t\t\t<div class=\"article__icon article__icon--number\"><span>").concat(index + 1, "</span></div>\n\t\t\t\t\t<div class=\"article__icon article__icon--read\" title=\"Read\">\n\t\t\t\t\t\t<svg width=\"14\" height=\"14\">\n\t\t\t\t\t\t\t<use xlink:href=\"#view\"></use>\n\t\t\t\t\t\t</svg>\n\t\t\t\t\t</div>\n\t\t\t\t\t<header class=\"article__header\">").concat(newsItem.title, "</header>\n\t\t\t\t\t<div class=\"article__info\">\n\t\t\t\t\t\t<div class=\"article__icon\" title=\"Published\">\n\t\t\t\t\t\t\t<svg width=\"14\" height=\"14\">\n\t\t\t\t\t\t\t\t<use xlink:href=\"#clock\"></use>\n\t\t\t\t\t\t\t</svg></div>\n\t\t\t\t\t\t<datetime class=\"article__datetime\">").concat(newsItem.datetime, "</datetime>\n\t\t\t\t\t\t<div class=\"article__icon\" title=\"Author\">\n\t\t\t\t\t\t\t<svg width=\"14\" height=\"14\">\n\t\t\t\t\t\t\t\t<use xlink:href=\"#user\"></use>\n\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<span class=\"article__author\">").concat(newsItem.author, "</span>\n\t\t\t\t\t</div>\n\t\t\t\t\t<a class=\"article__link\" href=\"").concat(newsItem.link, "\" target=\"_blank\" id=\"").concat(CONFIG.id.articleLink).concat(index, "\">\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435</a>\n\t\t\t\t</article>\n\t\t\t</div>\n\t\t</li>");
    return itemElem;
  }; // если не убрать шаблоны, то в IE обработчик вешается на тег внутри самого <template>
  // сам тег <template> в IE не удалить, т.к. IE его не может найти в документе


  var removeTemplates = function removeTemplates() {
    var templates = document.querySelector('#templates');
    templates.parentNode.removeChild(templates);
  };

  window.exports.render = {
    renderUsingTemplates: renderUsingTemplates,
    renderWidget: renderWidget,
    removeTemplates: removeTemplates,
    updateWidgetIcon: updateWidgetIcon,
    markArticleAsRead: markArticleAsRead,
    hideWidget: hideWidget,
    showWidget: showWidget
  };
})();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function () {
  var CONFIG = window.exports.CONFIG;
  var loader = window.exports.loader;
  var _render = window.exports.render;

  var Widget = /*#__PURE__*/function () {
    function Widget() {
      _classCallCheck(this, Widget);
    }

    _createClass(Widget, [{
      key: "contructor",
      value: function contructor() {
        this._news = undefined;
        this._unreadCount = undefined;
      }
    }, {
      key: "init",
      value: function init() {
        var onLoad = this.onLoad.bind(this);
        loader.load(onLoad);
      }
    }, {
      key: "onLoad",
      value: function onLoad(data) {
        debugger;
        var news = JSON.parse(data);
        this.news = news;
        this.unreadCount = news.length;
        this.render();
        this.addListeners();
      }
    }, {
      key: "render",
      value: function render() {
        // если браузер поддерживает тег <template>
        if ('content' in document.createElement('template')) {
          _render.renderUsingTemplates(this.news);
        } else {
          _render.renderWidget(this.news);

          _render.removeTemplates(this.news);
        }
      }
    }, {
      key: "addListeners",
      value: function addListeners() {
        var _this = this;

        document.querySelector("#".concat(CONFIG.id.widgetIcon)).addEventListener('click', this.show);
        document.querySelector("#".concat(CONFIG.id.btnClose)).addEventListener('click', this.hide);
        document.querySelector("#".concat(CONFIG.id.list)).addEventListener('click', function (evt) {
          if (evt.target.tagName === 'A' && CONFIG.regexp.articleLinkId.test(evt.target.id)) _this.onArticleLinkClick(evt.target.id);
        });
        window.addEventListener('keydown', function (evt) {
          if (evt.key === 'Escape' || evt.key === 'Esc') _this.hide();
        });
      }
    }, {
      key: "onArticleLinkClick",
      value: function onArticleLinkClick(linkId) {
        var id = Widget.getNewsIdByArticleLinkId(linkId);

        if (!this.news[id].isRead) {
          this.news[id].isRead = true;
          this.unreadCount--;
          var articleId = Widget.getArticleIdByNewsId(id);

          _render.markArticleAsRead(articleId);

          _render.updateWidgetIcon(this.unreadCount);
        }
      }
    }, {
      key: "show",
      value: function show() {
        _render.showWidget();
      }
    }, {
      key: "hide",
      value: function hide() {
        _render.hideWidget();
      }
    }, {
      key: "news",
      get: function get() {
        return this._news;
      },
      set: function set(value) {
        this._news = value;
      }
    }, {
      key: "unreadCount",
      get: function get() {
        return this._unreadCount;
      },
      set: function set(value) {
        this._unreadCount = value;
      }
    }], [{
      key: "getNewsIdByArticleLinkId",
      value: function getNewsIdByArticleLinkId(id) {
        return +id.slice(id.indexOf('-') + 1, id.length);
      }
    }, {
      key: "getArticleIdByNewsId",
      value: function getArticleIdByNewsId(id) {
        return "#".concat(CONFIG.id.article).concat(id);
      }
    }]);

    return Widget;
  }();

  window.exports.Widget = Widget;
})();
"use strict";

var widget = new window.exports.Widget();
widget.init();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyIsInhoci5qcyIsImxvYWRlci5qcyIsInJlbmRlci5qcyIsIndpZGdldC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSEE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmV3cy13aWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDT05GSUcgPSB7XG4gICAgaWQ6IHtcbiAgICAgIHdpZGdldFRlbXBsYXRlOiAnd2lkZ2V0LXRlbXBsYXRlJyxcbiAgICAgIHdpZGdldEljb25UZW1wbGF0ZTogJ3dpZGdldC1pY29uLXRlbXBsYXRlJyxcbiAgICAgIGl0ZW1UZW1wbGF0ZTogJ2l0ZW0tdGVtcGxhdGUnLFxuICAgICAgd2lkZ2V0OiAnd2lkZ2V0JyxcbiAgICAgIHdpZGdldEljb246ICd3aWRnZXQtaWNvbicsXG4gICAgICB3aWRnZXRJY29uQ291bnRlcjogJ3dpZGdldC1pY29uLWNvdW50ZXInLFxuICAgICAgbGlzdDogJ2xpc3QnLFxuICAgICAgYXJ0aWNsZTogJ2FydGljbGUtJyxcbiAgICAgIGFydGljbGVMaW5rOiAnYXJ0aWNsZUxpbmstJyxcbiAgICAgIGJ0bkNsb3NlOiAnYnRuLWNsb3NlJ1xuICAgIH0sXG4gICAgXCJjbGFzc1wiOiB7XG4gICAgICBoaWRlOiAnaGlkZScsXG4gICAgICB3aWRnZXQ6ICd3aWRnZXQnLFxuICAgICAgd2lkZ2V0SWNvbjogJ3dpZGdldC1pY29uJyxcbiAgICAgIHdpZGdldEljb25Db3VudGVyOiAnd2lkZ2V0LWljb25fX2NvdW50ZXInLFxuICAgICAgaXRlbTogJ2l0ZW0nLFxuICAgICAgYXJ0aWNsZTogJ2FydGljbGUnLFxuICAgICAgYXJ0aWNsZUhlYWRlcjogJ2FydGljbGVfX2hlYWRlcicsXG4gICAgICBhcnRpY2xlSW5mbzogJ2FydGljbGVfX2luZm8nLFxuICAgICAgYXJ0aWNsZUljb246ICdhcnRpY2xlX19pY29uJyxcbiAgICAgIGFydGljbGVEYXRldGltZTogJ2FydGljbGVfX2RhdGV0aW1lJyxcbiAgICAgIGFydGljbGVBdXRob3I6ICdhcnRpY2xlX19hdXRob3InLFxuICAgICAgYXJ0aWNsZUxpbms6ICdhcnRpY2xlX19saW5rJ1xuICAgIH0sXG4gICAgcmVnZXhwOiB7XG4gICAgICBhcnRpY2xlTGlua0lkOiAvXmFydGljbGVMaW5rLVxcZCskL1xuICAgIH0sXG4gICAgdGltZW91dDogNTAwMCxcbiAgICBzdGF0dXM6IHtcbiAgICAgIG9rOiAyMDBcbiAgICB9LFxuICAgIG1zZzoge1xuICAgICAgZmFpbDogJ1NvbWV0aGluZyB3ZW50IHdyb25nLi4uJyxcbiAgICAgIGVycm9yOiAnTmV0d29yayByZWxhdGVkIHByb2JsZW0gb2NjdXJlZCcsXG4gICAgICB0aW1lb3V0OiAnUmVxdWVzdCBleGNlZWRlZCB0aGUgbWF4aW11bSB0aW1lIGxpbWl0J1xuICAgIH0sXG4gICAgdXJsOiB7XG4gICAgICBuZXdzOiAnaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fremhhci9uZXdzLXdpZGdldC9tYWluL3NyYy9kYXRhL25ld3MuanNvbicsXG4gICAgICAvLyAnZGF0YS9uZXdzLmpzb24nLFxuICAgICAgZm9udHM6ICdodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PU9zd2FsZCZkaXNwbGF5PXN3YXAnLFxuICAgICAgc3R5bGVzOiAnY3NzL3dpZGdldC5taW4uY3NzJyxcbiAgICAgIHN2ZzogJ2ltZy9zcHJpdGUubWluLnN2ZycsXG4gICAgICB0ZW1wbGF0ZXM6ICd0ZW1wbGF0ZXMuaHRtbCdcbiAgICB9XG4gIH07IC8vIG5hbWVzcGFjZSDQtNC70Y8g0Y3QutGB0L/QvtGA0YLQsCDQvNC+0LTRg9C70LXQuVxuXG4gIHdpbmRvdy5leHBvcnRzID0ge1xuICAgIENPTkZJRzogQ09ORklHXG4gIH07XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgQ09ORklHID0gd2luZG93LmV4cG9ydHMuQ09ORklHO1xuXG4gIHZhciByZWplY3QgPSBmdW5jdGlvbiByZWplY3QobXNnKSB7XG4gICAgYWxlcnQobXNnKTtcbiAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgfTsgLy8g0YQt0YbQuNGPINC/0YDQuNC90LjQvNCw0LXRgiDRgdGB0YvQu9C60YMsINGC0LjQvyDQt9Cw0LPRgNGD0LbQsNC10LzQvtC10LPQviDRgNC10YHRg9GA0YHQsCDQuCDQvtCx0YDQsNCx0L7RgtGH0LjQuiDRg9GB0L/QtdGI0L3QvtCz0L4g0LfQsNC/0YDQvtGB0LBcbiAgLy8g0YQt0YbQuNGPINCy0L7Qt9Cy0YDQsNGJ0LDQtdGCINC+0LHRitC10LrRgiB4aHIg0YEg0LzQtdGC0L7QtNC+0Lwgc2VuZCgpXG5cblxuICB2YXIgZ2V0UmVxdWVzdCA9IGZ1bmN0aW9uIGdldFJlcXVlc3QodXJsLCBjb250ZW50VHlwZSwgcmVzb2x2ZSkge1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgY29udGVudFR5cGUpO1xuICAgIHhoci50aW1lb3V0ID0gQ09ORklHLnRpbWVvdXQ7XG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlamVjdChDT05GSUcubXNnLmVycm9yKTtcbiAgICB9KTtcbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigndGltZW91dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiByZWplY3QoQ09ORklHLm1zZy50aW1lb3V0KTtcbiAgICB9KTtcbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIuc3RhdHVzICE9IENPTkZJRy5zdGF0dXMub2spIHJlamVjdChcIlwiLmNvbmNhdChDT05GSUcubXNnLmZhaWwsIFwiXFxuXCIpLmNvbmNhdCh4aHIuc3RhdHVzLCBcIjogXCIpLmNvbmNhdCh4aHIuc3RhdHVzVGV4dCkpO1xuICAgICAgcmVzb2x2ZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcbiAgICByZXR1cm4geGhyO1xuICB9O1xuXG4gIHdpbmRvdy5leHBvcnRzLnhociA9IHtcbiAgICBnZXRSZXF1ZXN0OiBnZXRSZXF1ZXN0XG4gIH07XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgQ09ORklHID0gd2luZG93LmV4cG9ydHMuQ09ORklHO1xuICB2YXIgeGhyID0gd2luZG93LmV4cG9ydHMueGhyO1xuXG4gIHZhciBsb2FkU3R5bGVzID0gZnVuY3Rpb24gbG9hZFN0eWxlcygpIHtcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSBDT05GSUcudXJsLnN0eWxlcztcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICB9O1xuXG4gIHZhciBsb2FkRm9udHMgPSBmdW5jdGlvbiBsb2FkRm9udHMoKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IFwiQGltcG9ydCB1cmwoXFxcIlwiLmNvbmNhdChDT05GSUcudXJsLmZvbnRzLCBcIlxcXCIpO1wiKTtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgfTtcblxuICB2YXIgb25TcHJpdGVMb2FkID0gZnVuY3Rpb24gb25TcHJpdGVMb2FkKGRhdGEpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmNsYXNzTGlzdC5hZGQoQ09ORklHW1wiY2xhc3NcIl0uaGlkZSk7XG4gICAgZGl2LmlubmVySFRNTCA9IGRhdGE7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICB9O1xuXG4gIHZhciBvblRlbXBsYXRlc0xvYWQgPSBmdW5jdGlvbiBvblRlbXBsYXRlc0xvYWQoZGF0YSkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChDT05GSUdbXCJjbGFzc1wiXS5oaWRlKTtcbiAgICBkaXYuaWQgPSAndGVtcGxhdGVzJztcbiAgICBkaXYuaW5uZXJIVE1MID0gZGF0YTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gIH07XG5cbiAgdmFyIGxvYWQgPSBmdW5jdGlvbiBsb2FkKGNiKSB7XG4gICAgbG9hZFN0eWxlcygpO1xuICAgIGxvYWRGb250cygpO1xuICAgIHhoci5nZXRSZXF1ZXN0KENPTkZJRy51cmwuc3ZnLCAndGV4dC9wbGFpbicsIG9uU3ByaXRlTG9hZCkuc2VuZCgpO1xuICAgIHhoci5nZXRSZXF1ZXN0KENPTkZJRy51cmwudGVtcGxhdGVzLCAndGV4dC9wbGFpbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBvblRlbXBsYXRlc0xvYWQoZGF0YSk7XG4gICAgICB4aHIuZ2V0UmVxdWVzdChDT05GSUcudXJsLm5ld3MsICdhcHBsaWNhdGlvbi9qc29uJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgY2IoZGF0YSk7XG4gICAgICB9KS5zZW5kKCk7XG4gICAgfSkuc2VuZCgpO1xuICB9O1xuXG4gIHdpbmRvdy5leHBvcnRzLmxvYWRlciA9IHtcbiAgICBsb2FkOiBsb2FkXG4gIH07XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgQ09ORklHID0gd2luZG93LmV4cG9ydHMuQ09ORklHO1xuXG4gIHZhciB1cGRhdGVXaWRnZXRJY29uID0gZnVuY3Rpb24gdXBkYXRlV2lkZ2V0SWNvbih1bnJlYWRDb3VudCkge1xuICAgIHZhciBpY29uRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRJY29uKSk7XG4gICAgdmFyIGNvdW50ZXIgPSBpY29uRWxlbS5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQud2lkZ2V0SWNvbkNvdW50ZXIpKTtcblxuICAgIGlmICh1bnJlYWRDb3VudCkge1xuICAgICAgaWNvbkVsZW0udGl0bGUgPSBcIllvdSBoYXZlIFwiLmNvbmNhdCh1bnJlYWRDb3VudCwgXCIgdW5yZWFkIG5ld3NcIik7XG4gICAgICBjb3VudGVyLnRleHRDb250ZW50ID0gdW5yZWFkQ291bnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGljb25FbGVtLnRpdGxlID0gJ1lvdSBoYXZlIG5vIHVucmVhZCBuZXdzIHlldCc7XG4gICAgICBpY29uRWxlbS5jbGFzc0xpc3QucmVtb3ZlKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldEljb24sIFwiLS1hbmltYXRlXCIpKTtcbiAgICAgIGNvdW50ZXIuY2xhc3NMaXN0LmFkZChcIlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXRJY29uQ291bnRlciwgXCItLWhpZGVcIikpO1xuICAgIH1cbiAgfTtcblxuICB2YXIgbWFya0FydGljbGVBc1JlYWQgPSBmdW5jdGlvbiBtYXJrQXJ0aWNsZUFzUmVhZChhcnRpY2xlSWQpIHtcbiAgICB2YXIgYXJ0aWNsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYXJ0aWNsZUlkKTtcbiAgICB2YXIgcmVhZEljb24gPSBhcnRpY2xlLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVJY29uLCBcIi0tcmVhZFwiKSk7XG4gICAgYXJ0aWNsZS5jbGFzc0xpc3QuYWRkKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGUsIFwiLS1yZWFkXCIpKTtcbiAgICByZWFkSWNvbi5jbGFzc0xpc3QuYWRkKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVJY29uLCBcIi0tcmVhZC0tc2hvd1wiKSk7XG4gIH07XG5cbiAgdmFyIHNob3dXaWRnZXQgPSBmdW5jdGlvbiBzaG93V2lkZ2V0KCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRJY29uKSkuY2xhc3NMaXN0LnJlbW92ZShcIlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXRJY29uLCBcIi0tc2hvd1wiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldCkpLmNsYXNzTGlzdC5hZGQoXCJcIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0ud2lkZ2V0LCBcIi0tc2hvd1wiKSk7XG4gIH07XG5cbiAgdmFyIGhpZGVXaWRnZXQgPSBmdW5jdGlvbiBoaWRlV2lkZ2V0KCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRJY29uKSkuY2xhc3NMaXN0LmFkZChcIlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXRJY29uLCBcIi0tc2hvd1wiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldCkpLmNsYXNzTGlzdC5yZW1vdmUoXCJcIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0ud2lkZ2V0LCBcIi0tc2hvd1wiKSk7XG4gIH07IC8vINCy0YHRgtCw0LLQutCwINCy0LjQtNC20LXRgtCwLCDQuNGB0L/QvtC70YzQt9GD0Y8g0YLRjdCzIHRlbXBsYXRlXG5cblxuICB2YXIgcmVuZGVyVXNpbmdUZW1wbGF0ZXMgPSBmdW5jdGlvbiByZW5kZXJVc2luZ1RlbXBsYXRlcyhuZXdzKSB7XG4gICAgdmFyIGljb25UZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRJY29uVGVtcGxhdGUpKTtcbiAgICB2YXIgaWNvbkVsZW0gPSBpY29uVGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXRJY29uKSkuY2xvbmVOb2RlKHRydWUpO1xuICAgIHZhciBjb3VudGVyID0gaWNvbkVsZW0ucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb25Db3VudGVyKSk7XG4gICAgaWNvbkVsZW0udGl0bGUgPSBcIllvdSBoYXZlIFwiLmNvbmNhdChuZXdzLmxlbmd0aCwgXCIgdW5yZWFkIG5ld3NcIik7XG4gICAgY291bnRlci50ZXh0Q29udGVudCA9IG5ld3MubGVuZ3RoO1xuICAgIHZhciB3aWRnZXRUZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRUZW1wbGF0ZSkpO1xuICAgIHZhciB3aWRnZXRFbGVtID0gd2lkZ2V0VGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXQpKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdmFyIG5ld3NMaXN0ID0gd2lkZ2V0RWxlbS5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQubGlzdCkpO1xuICAgIHZhciBpdGVtVGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQuaXRlbVRlbXBsYXRlKSk7XG4gICAgdmFyIGl0ZW1DYXJkID0gaXRlbVRlbXBsYXRlLmNvbnRlbnQucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uaXRlbSkpO1xuICAgIG5ld3MuZm9yRWFjaChmdW5jdGlvbiAobmV3c0l0ZW0sIGluZGV4KSB7XG4gICAgICB2YXIgaXRlbUVsZW0gPSBpdGVtQ2FyZC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICB2YXIgbmV3c0VsZW0gPSBnZXROZXdzRWxlbVVzaW5nVGVtcGxhdGVzKG5ld3NJdGVtLCBpbmRleCwgaXRlbUVsZW0pO1xuICAgICAgbmV3c0xpc3QuYXBwZW5kQ2hpbGQobmV3c0VsZW0pO1xuICAgIH0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWNvbkVsZW0pO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQod2lkZ2V0RWxlbSk7XG4gIH07XG5cbiAgdmFyIGdldE5ld3NFbGVtVXNpbmdUZW1wbGF0ZXMgPSBmdW5jdGlvbiBnZXROZXdzRWxlbVVzaW5nVGVtcGxhdGVzKG5ld3NJdGVtLCBpbmRleCwgbmV3c0VsZW0pIHtcbiAgICB2YXIgYXJ0aWNsZSA9IG5ld3NFbGVtLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGUpKTtcbiAgICB2YXIgbnVtYmVyID0gYXJ0aWNsZS5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS5hcnRpY2xlSWNvbiwgXCItLW51bWJlciA+IHNwYW5cIikpO1xuICAgIHZhciBoZWFkZXIgPSBhcnRpY2xlLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVIZWFkZXIpKTtcbiAgICB2YXIgaW5mbyA9IGFydGljbGUucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUluZm8pKTtcbiAgICB2YXIgbGluayA9IGFydGljbGUucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUxpbmspKTtcbiAgICB2YXIgZGF0ZXRpbWUgPSBpbmZvLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVEYXRldGltZSkpO1xuICAgIHZhciBhdXRob3IgPSBpbmZvLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVBdXRob3IpKTtcbiAgICBudW1iZXIudGV4dENvbnRlbnQgPSBpbmRleCArIDE7XG4gICAgaGVhZGVyLmlubmVySFRNTCA9IG5ld3NJdGVtLnRpdGxlO1xuICAgIGRhdGV0aW1lLnRleHRDb250ZW50ID0gbmV3c0l0ZW0uZGF0ZXRpbWU7XG4gICAgYXV0aG9yLnRleHRDb250ZW50ID0gbmV3c0l0ZW0uYXV0aG9yO1xuICAgIGxpbmsuaHJlZiA9IG5ld3NJdGVtLmxpbms7XG4gICAgbGluay5pZCA9IFwiXCIuY29uY2F0KENPTkZJRy5pZC5hcnRpY2xlTGluaykuY29uY2F0KGluZGV4KTtcbiAgICBhcnRpY2xlLmlkID0gXCJcIi5jb25jYXQoQ09ORklHLmlkLmFydGljbGUpLmNvbmNhdChpbmRleCk7XG4gICAgcmV0dXJuIG5ld3NFbGVtO1xuICB9OyAvLyDQstGB0YLQsNCy0LrQsCDQstC40LTQttC10YLQsCDQuNC3INGB0LrRgNC40L/RgtCwINCx0LXQtyDQuNGB0L/QvtC70YzQt9C+0LLQsNC90LjRjyA8dGVtcGxhdGU+XG5cblxuICB2YXIgcmVuZGVyV2lkZ2V0ID0gZnVuY3Rpb24gcmVuZGVyV2lkZ2V0KG5ld3MpIHtcbiAgICB2YXIgaWNvbkVsZW0gPSBcIjxkaXYgY2xhc3M9XFxcIndpZGdldC1pY29uIHdpZGdldC1pY29uLS1zaG93IHdpZGdldC1pY29uLS1hbmltYXRlXFxcIiBpZD1cXFwid2lkZ2V0LWljb25cXFwiIHRpdGxlPVxcXCJZb3UgaGF2ZSBcIi5jb25jYXQobmV3cy5sZW5ndGgsIFwiIHVucmVhZCBuZXdzXFxcIj5cXG5cXHRcXHRcXHQ8b3V0cHV0IGNsYXNzPVxcXCJ3aWRnZXQtaWNvbl9fY291bnRlclxcXCIgaWQ9XFxcIndpZGdldC1pY29uLWNvdW50ZXJcXFwiPlwiKS5jb25jYXQobmV3cy5sZW5ndGgsIFwiPC9vdXRwdXQ+XFxuXFx0XFx0XFx0PHN2ZyB3aWR0aD1cXFwiMTRcXFwiIGhlaWdodD1cXFwiMTRcXFwiPlxcblxcdFxcdFxcdFxcdDx1c2UgeGxpbms6aHJlZj1cXFwiI2JlbGxcXFwiPjwvdXNlPlxcblxcdFxcdFxcdDwvc3ZnPlxcblxcdFxcdDwvZGl2PlwiKTtcbiAgICB2YXIgd2lkZ2V0RWxlbSA9IFwiPGRpdiBjbGFzcz1cXFwid2lkZ2V0XFxcIiBpZD1cXFwid2lkZ2V0XFxcIj5cXG5cXHRcXHRcXHQ8dWwgY2xhc3M9XFxcIndpZGdldF9fbGlzdCBsaXN0XFxcIiBpZD1cXFwibGlzdFxcXCI+XCIuY29uY2F0KGdldExpc3RPZkl0ZW1zKG5ld3MpLCBcIjwvdWw+XFxuXFx0XFx0XFx0PGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNsb3NlXFxcIiBpZD1cXFwiYnRuLWNsb3NlXFxcIiBhcmlhLWxhYmVsPVxcXCJDbG9zZSB3aWRnZXQgYnV0dG9uXFxcIiB0aXRsZT1cXFwiQ2xvc2Ugd2lkZ2V0XFxcIj48L2J1dHRvbj5cXG5cXHRcXHQ8L2Rpdj5cIik7XG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgKz0gaWNvbkVsZW07XG4gICAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgKz0gd2lkZ2V0RWxlbTtcbiAgfTtcblxuICB2YXIgZ2V0TGlzdE9mSXRlbXMgPSBmdW5jdGlvbiBnZXRMaXN0T2ZJdGVtcyhuZXdzKSB7XG4gICAgcmV0dXJuIG5ld3MucmVkdWNlKGZ1bmN0aW9uIChuZXdzTGlzdCwgbmV3c0l0ZW0sIGluZGV4KSB7XG4gICAgICByZXR1cm4gbmV3c0xpc3QgKyBnZXRJdGVtRWxlbShuZXdzSXRlbSwgaW5kZXgpO1xuICAgIH0sICcnKTtcbiAgfTtcblxuICB2YXIgZ2V0SXRlbUVsZW0gPSBmdW5jdGlvbiBnZXRJdGVtRWxlbShuZXdzSXRlbSwgaW5kZXgpIHtcbiAgICB2YXIgaXRlbUVsZW0gPSBcIjxsaSBjbGFzcz1cXFwibGlzdF9faXRlbSBpdGVtXFxcIj5cXG5cXHRcXHRcXHQ8ZGl2IGNsYXNzPVxcXCJpdGVtX193cmFwcGVyXFxcIj5cXG5cXHRcXHRcXHRcXHQ8YXJ0aWNsZSBjbGFzcz1cXFwiYXJ0aWNsZVxcXCIgaWQ9XFxcIlwiLmNvbmNhdChDT05GSUcuaWQuYXJ0aWNsZSkuY29uY2F0KGluZGV4LCBcIlxcXCI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cXFwiYXJ0aWNsZV9faWNvbiBhcnRpY2xlX19pY29uLS1udW1iZXJcXFwiPjxzcGFuPlwiKS5jb25jYXQoaW5kZXggKyAxLCBcIjwvc3Bhbj48L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVxcXCJhcnRpY2xlX19pY29uIGFydGljbGVfX2ljb24tLXJlYWRcXFwiIHRpdGxlPVxcXCJSZWFkXFxcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3ZnIHdpZHRoPVxcXCIxNFxcXCIgaGVpZ2h0PVxcXCIxNFxcXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PHVzZSB4bGluazpocmVmPVxcXCIjdmlld1xcXCI+PC91c2U+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PC9zdmc+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0PGhlYWRlciBjbGFzcz1cXFwiYXJ0aWNsZV9faGVhZGVyXFxcIj5cIikuY29uY2F0KG5ld3NJdGVtLnRpdGxlLCBcIjwvaGVhZGVyPlxcblxcdFxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcImFydGljbGVfX2luZm9cXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcImFydGljbGVfX2ljb25cXFwiIHRpdGxlPVxcXCJQdWJsaXNoZWRcXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzdmcgd2lkdGg9XFxcIjE0XFxcIiBoZWlnaHQ9XFxcIjE0XFxcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8dXNlIHhsaW5rOmhyZWY9XFxcIiNjbG9ja1xcXCI+PC91c2U+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PC9zdmc+PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGRhdGV0aW1lIGNsYXNzPVxcXCJhcnRpY2xlX19kYXRldGltZVxcXCI+XCIpLmNvbmNhdChuZXdzSXRlbS5kYXRldGltZSwgXCI8L2RhdGV0aW1lPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcImFydGljbGVfX2ljb25cXFwiIHRpdGxlPVxcXCJBdXRob3JcXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDxzdmcgd2lkdGg9XFxcIjE0XFxcIiBoZWlnaHQ9XFxcIjE0XFxcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHRcXHQ8dXNlIHhsaW5rOmhyZWY9XFxcIiN1c2VyXFxcIj48L3VzZT5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHQ8L3N2Zz5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8c3BhbiBjbGFzcz1cXFwiYXJ0aWNsZV9fYXV0aG9yXFxcIj5cIikuY29uY2F0KG5ld3NJdGVtLmF1dGhvciwgXCI8L3NwYW4+XFxuXFx0XFx0XFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0XFx0XFx0XFx0PGEgY2xhc3M9XFxcImFydGljbGVfX2xpbmtcXFwiIGhyZWY9XFxcIlwiKS5jb25jYXQobmV3c0l0ZW0ubGluaywgXCJcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIiBpZD1cXFwiXCIpLmNvbmNhdChDT05GSUcuaWQuYXJ0aWNsZUxpbmspLmNvbmNhdChpbmRleCwgXCJcXFwiPlxcdTA0MUZcXHUwNDNFXFx1MDQzNFxcdTA0NDBcXHUwNDNFXFx1MDQzMVxcdTA0M0RcXHUwNDM1XFx1MDQzNTwvYT5cXG5cXHRcXHRcXHRcXHQ8L2FydGljbGU+XFxuXFx0XFx0XFx0PC9kaXY+XFxuXFx0XFx0PC9saT5cIik7XG4gICAgcmV0dXJuIGl0ZW1FbGVtO1xuICB9OyAvLyDQtdGB0LvQuCDQvdC1INGD0LHRgNCw0YLRjCDRiNCw0LHQu9C+0L3Riywg0YLQviDQsiBJRSDQvtCx0YDQsNCx0L7RgtGH0LjQuiDQstC10YjQsNC10YLRgdGPINC90LAg0YLQtdCzINCy0L3Rg9GC0YDQuCDRgdCw0LzQvtCz0L4gPHRlbXBsYXRlPlxuICAvLyDRgdCw0Lwg0YLQtdCzIDx0ZW1wbGF0ZT4g0LIgSUUg0L3QtSDRg9C00LDQu9C40YLRjCwg0YIu0LouIElFINC10LPQviDQvdC1INC80L7QttC10YIg0L3QsNC50YLQuCDQsiDQtNC+0LrRg9C80LXQvdGC0LVcblxuXG4gIHZhciByZW1vdmVUZW1wbGF0ZXMgPSBmdW5jdGlvbiByZW1vdmVUZW1wbGF0ZXMoKSB7XG4gICAgdmFyIHRlbXBsYXRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0ZW1wbGF0ZXMnKTtcbiAgICB0ZW1wbGF0ZXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0ZW1wbGF0ZXMpO1xuICB9O1xuXG4gIHdpbmRvdy5leHBvcnRzLnJlbmRlciA9IHtcbiAgICByZW5kZXJVc2luZ1RlbXBsYXRlczogcmVuZGVyVXNpbmdUZW1wbGF0ZXMsXG4gICAgcmVuZGVyV2lkZ2V0OiByZW5kZXJXaWRnZXQsXG4gICAgcmVtb3ZlVGVtcGxhdGVzOiByZW1vdmVUZW1wbGF0ZXMsXG4gICAgdXBkYXRlV2lkZ2V0SWNvbjogdXBkYXRlV2lkZ2V0SWNvbixcbiAgICBtYXJrQXJ0aWNsZUFzUmVhZDogbWFya0FydGljbGVBc1JlYWQsXG4gICAgaGlkZVdpZGdldDogaGlkZVdpZGdldCxcbiAgICBzaG93V2lkZ2V0OiBzaG93V2lkZ2V0XG4gIH07XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDT05GSUcgPSB3aW5kb3cuZXhwb3J0cy5DT05GSUc7XG4gIHZhciBsb2FkZXIgPSB3aW5kb3cuZXhwb3J0cy5sb2FkZXI7XG4gIHZhciBfcmVuZGVyID0gd2luZG93LmV4cG9ydHMucmVuZGVyO1xuXG4gIHZhciBXaWRnZXQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFdpZGdldCgpIHtcbiAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXaWRnZXQpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhXaWRnZXQsIFt7XG4gICAgICBrZXk6IFwiY29udHJ1Y3RvclwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbnRydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX25ld3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX3VucmVhZENvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJpbml0XCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgdmFyIG9uTG9hZCA9IHRoaXMub25Mb2FkLmJpbmQodGhpcyk7XG4gICAgICAgIGxvYWRlci5sb2FkKG9uTG9hZCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcIm9uTG9hZFwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uTG9hZChkYXRhKSB7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICB2YXIgbmV3cyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIHRoaXMubmV3cyA9IG5ld3M7XG4gICAgICAgIHRoaXMudW5yZWFkQ291bnQgPSBuZXdzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcnMoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwicmVuZGVyXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAvLyDQtdGB0LvQuCDQsdGA0LDRg9C30LXRgCDQv9C+0LTQtNC10YDQttC40LLQsNC10YIg0YLQtdCzIDx0ZW1wbGF0ZT5cbiAgICAgICAgaWYgKCdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKSB7XG4gICAgICAgICAgX3JlbmRlci5yZW5kZXJVc2luZ1RlbXBsYXRlcyh0aGlzLm5ld3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9yZW5kZXIucmVuZGVyV2lkZ2V0KHRoaXMubmV3cyk7XG5cbiAgICAgICAgICBfcmVuZGVyLnJlbW92ZVRlbXBsYXRlcyh0aGlzLm5ld3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcImFkZExpc3RlbmVyc1wiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGFkZExpc3RlbmVycygpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQud2lkZ2V0SWNvbikpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5zaG93KTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLmJ0bkNsb3NlKSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmhpZGUpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQubGlzdCkpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgIGlmIChldnQudGFyZ2V0LnRhZ05hbWUgPT09ICdBJyAmJiBDT05GSUcucmVnZXhwLmFydGljbGVMaW5rSWQudGVzdChldnQudGFyZ2V0LmlkKSkgX3RoaXMub25BcnRpY2xlTGlua0NsaWNrKGV2dC50YXJnZXQuaWQpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgaWYgKGV2dC5rZXkgPT09ICdFc2NhcGUnIHx8IGV2dC5rZXkgPT09ICdFc2MnKSBfdGhpcy5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJvbkFydGljbGVMaW5rQ2xpY2tcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkFydGljbGVMaW5rQ2xpY2sobGlua0lkKSB7XG4gICAgICAgIHZhciBpZCA9IFdpZGdldC5nZXROZXdzSWRCeUFydGljbGVMaW5rSWQobGlua0lkKTtcblxuICAgICAgICBpZiAoIXRoaXMubmV3c1tpZF0uaXNSZWFkKSB7XG4gICAgICAgICAgdGhpcy5uZXdzW2lkXS5pc1JlYWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMudW5yZWFkQ291bnQtLTtcbiAgICAgICAgICB2YXIgYXJ0aWNsZUlkID0gV2lkZ2V0LmdldEFydGljbGVJZEJ5TmV3c0lkKGlkKTtcblxuICAgICAgICAgIF9yZW5kZXIubWFya0FydGljbGVBc1JlYWQoYXJ0aWNsZUlkKTtcblxuICAgICAgICAgIF9yZW5kZXIudXBkYXRlV2lkZ2V0SWNvbih0aGlzLnVucmVhZENvdW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2hvdygpIHtcbiAgICAgICAgX3JlbmRlci5zaG93V2lkZ2V0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcImhpZGVcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBoaWRlKCkge1xuICAgICAgICBfcmVuZGVyLmhpZGVXaWRnZXQoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwibmV3c1wiLFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXdzO1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX25ld3MgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwidW5yZWFkQ291bnRcIixcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdW5yZWFkQ291bnQ7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fdW5yZWFkQ291bnQgPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XSwgW3tcbiAgICAgIGtleTogXCJnZXROZXdzSWRCeUFydGljbGVMaW5rSWRcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXROZXdzSWRCeUFydGljbGVMaW5rSWQoaWQpIHtcbiAgICAgICAgcmV0dXJuICtpZC5zbGljZShpZC5pbmRleE9mKCctJykgKyAxLCBpZC5sZW5ndGgpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJnZXRBcnRpY2xlSWRCeU5ld3NJZFwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEFydGljbGVJZEJ5TmV3c0lkKGlkKSB7XG4gICAgICAgIHJldHVybiBcIiNcIi5jb25jYXQoQ09ORklHLmlkLmFydGljbGUpLmNvbmNhdChpZCk7XG4gICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFdpZGdldDtcbiAgfSgpO1xuXG4gIHdpbmRvdy5leHBvcnRzLldpZGdldCA9IFdpZGdldDtcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciB3aWRnZXQgPSBuZXcgd2luZG93LmV4cG9ydHMuV2lkZ2V0KCk7XG53aWRnZXQuaW5pdCgpOyJdfQ==
