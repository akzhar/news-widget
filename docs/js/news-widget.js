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
      news: 'data/news.json',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbmZpZy5qcyIsInhoci5qcyIsImxvYWRlci5qcyIsInJlbmRlci5qcyIsIndpZGdldC5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFIQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZXdzLXdpZGdldC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIENPTkZJRyA9IHtcbiAgICBpZDoge1xuICAgICAgd2lkZ2V0VGVtcGxhdGU6ICd3aWRnZXQtdGVtcGxhdGUnLFxuICAgICAgd2lkZ2V0SWNvblRlbXBsYXRlOiAnd2lkZ2V0LWljb24tdGVtcGxhdGUnLFxuICAgICAgaXRlbVRlbXBsYXRlOiAnaXRlbS10ZW1wbGF0ZScsXG4gICAgICB3aWRnZXQ6ICd3aWRnZXQnLFxuICAgICAgd2lkZ2V0SWNvbjogJ3dpZGdldC1pY29uJyxcbiAgICAgIHdpZGdldEljb25Db3VudGVyOiAnd2lkZ2V0LWljb24tY291bnRlcicsXG4gICAgICBsaXN0OiAnbGlzdCcsXG4gICAgICBhcnRpY2xlOiAnYXJ0aWNsZS0nLFxuICAgICAgYXJ0aWNsZUxpbms6ICdhcnRpY2xlTGluay0nLFxuICAgICAgYnRuQ2xvc2U6ICdidG4tY2xvc2UnXG4gICAgfSxcbiAgICBcImNsYXNzXCI6IHtcbiAgICAgIGhpZGU6ICdoaWRlJyxcbiAgICAgIHdpZGdldDogJ3dpZGdldCcsXG4gICAgICB3aWRnZXRJY29uOiAnd2lkZ2V0LWljb24nLFxuICAgICAgd2lkZ2V0SWNvbkNvdW50ZXI6ICd3aWRnZXQtaWNvbl9fY291bnRlcicsXG4gICAgICBpdGVtOiAnaXRlbScsXG4gICAgICBhcnRpY2xlOiAnYXJ0aWNsZScsXG4gICAgICBhcnRpY2xlSGVhZGVyOiAnYXJ0aWNsZV9faGVhZGVyJyxcbiAgICAgIGFydGljbGVJbmZvOiAnYXJ0aWNsZV9faW5mbycsXG4gICAgICBhcnRpY2xlSWNvbjogJ2FydGljbGVfX2ljb24nLFxuICAgICAgYXJ0aWNsZURhdGV0aW1lOiAnYXJ0aWNsZV9fZGF0ZXRpbWUnLFxuICAgICAgYXJ0aWNsZUF1dGhvcjogJ2FydGljbGVfX2F1dGhvcicsXG4gICAgICBhcnRpY2xlTGluazogJ2FydGljbGVfX2xpbmsnXG4gICAgfSxcbiAgICByZWdleHA6IHtcbiAgICAgIGFydGljbGVMaW5rSWQ6IC9eYXJ0aWNsZUxpbmstXFxkKyQvXG4gICAgfSxcbiAgICB0aW1lb3V0OiA1MDAwLFxuICAgIHN0YXR1czoge1xuICAgICAgb2s6IDIwMFxuICAgIH0sXG4gICAgbXNnOiB7XG4gICAgICBmYWlsOiAnU29tZXRoaW5nIHdlbnQgd3JvbmcuLi4nLFxuICAgICAgZXJyb3I6ICdOZXR3b3JrIHJlbGF0ZWQgcHJvYmxlbSBvY2N1cmVkJyxcbiAgICAgIHRpbWVvdXQ6ICdSZXF1ZXN0IGV4Y2VlZGVkIHRoZSBtYXhpbXVtIHRpbWUgbGltaXQnXG4gICAgfSxcbiAgICB1cmw6IHtcbiAgICAgIG5ld3M6ICdkYXRhL25ld3MuanNvbicsXG4gICAgICBmb250czogJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9T3N3YWxkJmRpc3BsYXk9c3dhcCcsXG4gICAgICBzdHlsZXM6ICdjc3Mvd2lkZ2V0Lm1pbi5jc3MnLFxuICAgICAgc3ZnOiAnaW1nL3Nwcml0ZS5taW4uc3ZnJyxcbiAgICAgIHRlbXBsYXRlczogJ3RlbXBsYXRlcy5odG1sJ1xuICAgIH1cbiAgfTsgLy8gbmFtZXNwYWNlINC00LvRjyDRjdC60YHQv9C+0YDRgtCwINC80L7QtNGD0LvQtdC5XG5cbiAgd2luZG93LmV4cG9ydHMgPSB7XG4gICAgQ09ORklHOiBDT05GSUdcbiAgfTtcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDT05GSUcgPSB3aW5kb3cuZXhwb3J0cy5DT05GSUc7XG5cbiAgdmFyIHJlamVjdCA9IGZ1bmN0aW9uIHJlamVjdChtc2cpIHtcbiAgICBhbGVydChtc2cpO1xuICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICB9OyAvLyDRhC3RhtC40Y8g0L/RgNC40L3QuNC80LDQtdGCINGB0YHRi9C70LrRgywg0YLQuNC/INC30LDQs9GA0YPQttCw0LXQvNC+0LXQs9C+INGA0LXRgdGD0YDRgdCwINC4INC+0LHRgNCw0LHQvtGC0YfQuNC6INGD0YHQv9C10YjQvdC+0LPQviDQt9Cw0L/RgNC+0YHQsFxuICAvLyDRhC3RhtC40Y8g0LLQvtC30LLRgNCw0YnQsNC10YIg0L7QsdGK0LXQutGCIHhociDRgSDQvNC10YLQvtC00L7QvCBzZW5kKClcblxuXG4gIHZhciBnZXRSZXF1ZXN0ID0gZnVuY3Rpb24gZ2V0UmVxdWVzdCh1cmwsIGNvbnRlbnRUeXBlLCByZXNvbHZlKSB7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCBjb250ZW50VHlwZSk7XG4gICAgeGhyLnRpbWVvdXQgPSBDT05GSUcudGltZW91dDtcbiAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVqZWN0KENPTkZJRy5tc2cuZXJyb3IpO1xuICAgIH0pO1xuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCd0aW1lb3V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHJlamVjdChDT05GSUcubXNnLnRpbWVvdXQpO1xuICAgIH0pO1xuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHhoci5zdGF0dXMgIT0gQ09ORklHLnN0YXR1cy5vaykgcmVqZWN0KFwiXCIuY29uY2F0KENPTkZJRy5tc2cuZmFpbCwgXCJcXG5cIikuY29uY2F0KHhoci5zdGF0dXMsIFwiOiBcIikuY29uY2F0KHhoci5zdGF0dXNUZXh0KSk7XG4gICAgICByZXNvbHZlKHhoci5yZXNwb25zZVRleHQpO1xuICAgIH0pO1xuICAgIHJldHVybiB4aHI7XG4gIH07XG5cbiAgd2luZG93LmV4cG9ydHMueGhyID0ge1xuICAgIGdldFJlcXVlc3Q6IGdldFJlcXVlc3RcbiAgfTtcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDT05GSUcgPSB3aW5kb3cuZXhwb3J0cy5DT05GSUc7XG4gIHZhciB4aHIgPSB3aW5kb3cuZXhwb3J0cy54aHI7XG5cbiAgdmFyIGxvYWRTdHlsZXMgPSBmdW5jdGlvbiBsb2FkU3R5bGVzKCkge1xuICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IENPTkZJRy51cmwuc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gIH07XG5cbiAgdmFyIGxvYWRGb250cyA9IGZ1bmN0aW9uIGxvYWRGb250cygpIHtcbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLnRleHRDb250ZW50ID0gXCJAaW1wb3J0IHVybChcXFwiXCIuY29uY2F0KENPTkZJRy51cmwuZm9udHMsIFwiXFxcIik7XCIpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9O1xuXG4gIHZhciBvblNwcml0ZUxvYWQgPSBmdW5jdGlvbiBvblNwcml0ZUxvYWQoZGF0YSkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuY2xhc3NMaXN0LmFkZChDT05GSUdbXCJjbGFzc1wiXS5oaWRlKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gZGF0YTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gIH07XG5cbiAgdmFyIG9uVGVtcGxhdGVzTG9hZCA9IGZ1bmN0aW9uIG9uVGVtcGxhdGVzTG9hZChkYXRhKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5jbGFzc0xpc3QuYWRkKENPTkZJR1tcImNsYXNzXCJdLmhpZGUpO1xuICAgIGRpdi5pZCA9ICd0ZW1wbGF0ZXMnO1xuICAgIGRpdi5pbm5lckhUTUwgPSBkYXRhO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgfTtcblxuICB2YXIgbG9hZCA9IGZ1bmN0aW9uIGxvYWQoY2IpIHtcbiAgICBsb2FkU3R5bGVzKCk7XG4gICAgbG9hZEZvbnRzKCk7XG4gICAgeGhyLmdldFJlcXVlc3QoQ09ORklHLnVybC5zdmcsICd0ZXh0L3BsYWluJywgb25TcHJpdGVMb2FkKS5zZW5kKCk7XG4gICAgeGhyLmdldFJlcXVlc3QoQ09ORklHLnVybC50ZW1wbGF0ZXMsICd0ZXh0L3BsYWluJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIG9uVGVtcGxhdGVzTG9hZChkYXRhKTtcbiAgICAgIHhoci5nZXRSZXF1ZXN0KENPTkZJRy51cmwubmV3cywgJ2FwcGxpY2F0aW9uL2pzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBjYihkYXRhKTtcbiAgICAgIH0pLnNlbmQoKTtcbiAgICB9KS5zZW5kKCk7XG4gIH07XG5cbiAgd2luZG93LmV4cG9ydHMubG9hZGVyID0ge1xuICAgIGxvYWQ6IGxvYWRcbiAgfTtcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDT05GSUcgPSB3aW5kb3cuZXhwb3J0cy5DT05GSUc7XG5cbiAgdmFyIHVwZGF0ZVdpZGdldEljb24gPSBmdW5jdGlvbiB1cGRhdGVXaWRnZXRJY29uKHVucmVhZENvdW50KSB7XG4gICAgdmFyIGljb25FbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb24pKTtcbiAgICB2YXIgY291bnRlciA9IGljb25FbGVtLnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC53aWRnZXRJY29uQ291bnRlcikpO1xuXG4gICAgaWYgKHVucmVhZENvdW50KSB7XG4gICAgICBpY29uRWxlbS50aXRsZSA9IFwiWW91IGhhdmUgXCIuY29uY2F0KHVucmVhZENvdW50LCBcIiB1bnJlYWQgbmV3c1wiKTtcbiAgICAgIGNvdW50ZXIudGV4dENvbnRlbnQgPSB1bnJlYWRDb3VudDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWNvbkVsZW0udGl0bGUgPSAnWW91IGhhdmUgbm8gdW5yZWFkIG5ld3MgeWV0JztcbiAgICAgIGljb25FbGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJcIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0ud2lkZ2V0SWNvbiwgXCItLWFuaW1hdGVcIikpO1xuICAgICAgY291bnRlci5jbGFzc0xpc3QuYWRkKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldEljb25Db3VudGVyLCBcIi0taGlkZVwiKSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtYXJrQXJ0aWNsZUFzUmVhZCA9IGZ1bmN0aW9uIG1hcmtBcnRpY2xlQXNSZWFkKGFydGljbGVJZCkge1xuICAgIHZhciBhcnRpY2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihhcnRpY2xlSWQpO1xuICAgIHZhciByZWFkSWNvbiA9IGFydGljbGUucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUljb24sIFwiLS1yZWFkXCIpKTtcbiAgICBhcnRpY2xlLmNsYXNzTGlzdC5hZGQoXCJcIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZSwgXCItLXJlYWRcIikpO1xuICAgIHJlYWRJY29uLmNsYXNzTGlzdC5hZGQoXCJcIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUljb24sIFwiLS1yZWFkLS1zaG93XCIpKTtcbiAgfTtcblxuICB2YXIgc2hvd1dpZGdldCA9IGZ1bmN0aW9uIHNob3dXaWRnZXQoKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb24pKS5jbGFzc0xpc3QucmVtb3ZlKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldEljb24sIFwiLS1zaG93XCIpKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQud2lkZ2V0KSkuY2xhc3NMaXN0LmFkZChcIlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXQsIFwiLS1zaG93XCIpKTtcbiAgfTtcblxuICB2YXIgaGlkZVdpZGdldCA9IGZ1bmN0aW9uIGhpZGVXaWRnZXQoKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb24pKS5jbGFzc0xpc3QuYWRkKFwiXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldEljb24sIFwiLS1zaG93XCIpKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQud2lkZ2V0KSkuY2xhc3NMaXN0LnJlbW92ZShcIlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS53aWRnZXQsIFwiLS1zaG93XCIpKTtcbiAgfTsgLy8g0LLRgdGC0LDQstC60LAg0LLQuNC00LbQtdGC0LAsINC40YHQv9C+0LvRjNC30YPRjyDRgtGN0LMgdGVtcGxhdGVcblxuXG4gIHZhciByZW5kZXJVc2luZ1RlbXBsYXRlcyA9IGZ1bmN0aW9uIHJlbmRlclVzaW5nVGVtcGxhdGVzKG5ld3MpIHtcbiAgICB2YXIgaWNvblRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb25UZW1wbGF0ZSkpO1xuICAgIHZhciBpY29uRWxlbSA9IGljb25UZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldEljb24pKS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdmFyIGNvdW50ZXIgPSBpY29uRWxlbS5xdWVyeVNlbGVjdG9yKFwiI1wiLmNvbmNhdChDT05GSUcuaWQud2lkZ2V0SWNvbkNvdW50ZXIpKTtcbiAgICBpY29uRWxlbS50aXRsZSA9IFwiWW91IGhhdmUgXCIuY29uY2F0KG5ld3MubGVuZ3RoLCBcIiB1bnJlYWQgbmV3c1wiKTtcbiAgICBjb3VudGVyLnRleHRDb250ZW50ID0gbmV3cy5sZW5ndGg7XG4gICAgdmFyIHdpZGdldFRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldFRlbXBsYXRlKSk7XG4gICAgdmFyIHdpZGdldEVsZW0gPSB3aWRnZXRUZW1wbGF0ZS5jb250ZW50LnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLndpZGdldCkpLmNsb25lTm9kZSh0cnVlKTtcbiAgICB2YXIgbmV3c0xpc3QgPSB3aWRnZXRFbGVtLnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC5saXN0KSk7XG4gICAgdmFyIGl0ZW1UZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC5pdGVtVGVtcGxhdGUpKTtcbiAgICB2YXIgaXRlbUNhcmQgPSBpdGVtVGVtcGxhdGUuY29udGVudC5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS5pdGVtKSk7XG4gICAgbmV3cy5mb3JFYWNoKGZ1bmN0aW9uIChuZXdzSXRlbSwgaW5kZXgpIHtcbiAgICAgIHZhciBpdGVtRWxlbSA9IGl0ZW1DYXJkLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgIHZhciBuZXdzRWxlbSA9IGdldE5ld3NFbGVtVXNpbmdUZW1wbGF0ZXMobmV3c0l0ZW0sIGluZGV4LCBpdGVtRWxlbSk7XG4gICAgICBuZXdzTGlzdC5hcHBlbmRDaGlsZChuZXdzRWxlbSk7XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpY29uRWxlbSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh3aWRnZXRFbGVtKTtcbiAgfTtcblxuICB2YXIgZ2V0TmV3c0VsZW1Vc2luZ1RlbXBsYXRlcyA9IGZ1bmN0aW9uIGdldE5ld3NFbGVtVXNpbmdUZW1wbGF0ZXMobmV3c0l0ZW0sIGluZGV4LCBuZXdzRWxlbSkge1xuICAgIHZhciBhcnRpY2xlID0gbmV3c0VsZW0ucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZSkpO1xuICAgIHZhciBudW1iZXIgPSBhcnRpY2xlLnF1ZXJ5U2VsZWN0b3IoXCIuXCIuY29uY2F0KENPTkZJR1tcImNsYXNzXCJdLmFydGljbGVJY29uLCBcIi0tbnVtYmVyID4gc3BhblwiKSk7XG4gICAgdmFyIGhlYWRlciA9IGFydGljbGUucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUhlYWRlcikpO1xuICAgIHZhciBpbmZvID0gYXJ0aWNsZS5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS5hcnRpY2xlSW5mbykpO1xuICAgIHZhciBsaW5rID0gYXJ0aWNsZS5xdWVyeVNlbGVjdG9yKFwiLlwiLmNvbmNhdChDT05GSUdbXCJjbGFzc1wiXS5hcnRpY2xlTGluaykpO1xuICAgIHZhciBkYXRldGltZSA9IGluZm8ucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZURhdGV0aW1lKSk7XG4gICAgdmFyIGF1dGhvciA9IGluZm8ucXVlcnlTZWxlY3RvcihcIi5cIi5jb25jYXQoQ09ORklHW1wiY2xhc3NcIl0uYXJ0aWNsZUF1dGhvcikpO1xuICAgIG51bWJlci50ZXh0Q29udGVudCA9IGluZGV4ICsgMTtcbiAgICBoZWFkZXIuaW5uZXJIVE1MID0gbmV3c0l0ZW0udGl0bGU7XG4gICAgZGF0ZXRpbWUudGV4dENvbnRlbnQgPSBuZXdzSXRlbS5kYXRldGltZTtcbiAgICBhdXRob3IudGV4dENvbnRlbnQgPSBuZXdzSXRlbS5hdXRob3I7XG4gICAgbGluay5ocmVmID0gbmV3c0l0ZW0ubGluaztcbiAgICBsaW5rLmlkID0gXCJcIi5jb25jYXQoQ09ORklHLmlkLmFydGljbGVMaW5rKS5jb25jYXQoaW5kZXgpO1xuICAgIGFydGljbGUuaWQgPSBcIlwiLmNvbmNhdChDT05GSUcuaWQuYXJ0aWNsZSkuY29uY2F0KGluZGV4KTtcbiAgICByZXR1cm4gbmV3c0VsZW07XG4gIH07IC8vINCy0YHRgtCw0LLQutCwINCy0LjQtNC20LXRgtCwINC40Lcg0YHQutGA0LjQv9GC0LAg0LHQtdC3INC40YHQv9C+0LvRjNC30L7QstCw0L3QuNGPIDx0ZW1wbGF0ZT5cblxuXG4gIHZhciByZW5kZXJXaWRnZXQgPSBmdW5jdGlvbiByZW5kZXJXaWRnZXQobmV3cykge1xuICAgIHZhciBpY29uRWxlbSA9IFwiPGRpdiBjbGFzcz1cXFwid2lkZ2V0LWljb24gd2lkZ2V0LWljb24tLXNob3cgd2lkZ2V0LWljb24tLWFuaW1hdGVcXFwiIGlkPVxcXCJ3aWRnZXQtaWNvblxcXCIgdGl0bGU9XFxcIllvdSBoYXZlIFwiLmNvbmNhdChuZXdzLmxlbmd0aCwgXCIgdW5yZWFkIG5ld3NcXFwiPlxcblxcdFxcdFxcdDxvdXRwdXQgY2xhc3M9XFxcIndpZGdldC1pY29uX19jb3VudGVyXFxcIiBpZD1cXFwid2lkZ2V0LWljb24tY291bnRlclxcXCI+XCIpLmNvbmNhdChuZXdzLmxlbmd0aCwgXCI8L291dHB1dD5cXG5cXHRcXHRcXHQ8c3ZnIHdpZHRoPVxcXCIxNFxcXCIgaGVpZ2h0PVxcXCIxNFxcXCI+XFxuXFx0XFx0XFx0XFx0PHVzZSB4bGluazpocmVmPVxcXCIjYmVsbFxcXCI+PC91c2U+XFxuXFx0XFx0XFx0PC9zdmc+XFxuXFx0XFx0PC9kaXY+XCIpO1xuICAgIHZhciB3aWRnZXRFbGVtID0gXCI8ZGl2IGNsYXNzPVxcXCJ3aWRnZXRcXFwiIGlkPVxcXCJ3aWRnZXRcXFwiPlxcblxcdFxcdFxcdDx1bCBjbGFzcz1cXFwid2lkZ2V0X19saXN0IGxpc3RcXFwiIGlkPVxcXCJsaXN0XFxcIj5cIi5jb25jYXQoZ2V0TGlzdE9mSXRlbXMobmV3cyksIFwiPC91bD5cXG5cXHRcXHRcXHQ8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2xvc2VcXFwiIGlkPVxcXCJidG4tY2xvc2VcXFwiIGFyaWEtbGFiZWw9XFxcIkNsb3NlIHdpZGdldCBidXR0b25cXFwiIHRpdGxlPVxcXCJDbG9zZSB3aWRnZXRcXFwiPjwvYnV0dG9uPlxcblxcdFxcdDwvZGl2PlwiKTtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCArPSBpY29uRWxlbTtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCArPSB3aWRnZXRFbGVtO1xuICB9O1xuXG4gIHZhciBnZXRMaXN0T2ZJdGVtcyA9IGZ1bmN0aW9uIGdldExpc3RPZkl0ZW1zKG5ld3MpIHtcbiAgICByZXR1cm4gbmV3cy5yZWR1Y2UoZnVuY3Rpb24gKG5ld3NMaXN0LCBuZXdzSXRlbSwgaW5kZXgpIHtcbiAgICAgIHJldHVybiBuZXdzTGlzdCArIGdldEl0ZW1FbGVtKG5ld3NJdGVtLCBpbmRleCk7XG4gICAgfSwgJycpO1xuICB9O1xuXG4gIHZhciBnZXRJdGVtRWxlbSA9IGZ1bmN0aW9uIGdldEl0ZW1FbGVtKG5ld3NJdGVtLCBpbmRleCkge1xuICAgIHZhciBpdGVtRWxlbSA9IFwiPGxpIGNsYXNzPVxcXCJsaXN0X19pdGVtIGl0ZW1cXFwiPlxcblxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcIml0ZW1fX3dyYXBwZXJcXFwiPlxcblxcdFxcdFxcdFxcdDxhcnRpY2xlIGNsYXNzPVxcXCJhcnRpY2xlXFxcIiBpZD1cXFwiXCIuY29uY2F0KENPTkZJRy5pZC5hcnRpY2xlKS5jb25jYXQoaW5kZXgsIFwiXFxcIj5cXG5cXHRcXHRcXHRcXHRcXHQ8ZGl2IGNsYXNzPVxcXCJhcnRpY2xlX19pY29uIGFydGljbGVfX2ljb24tLW51bWJlclxcXCI+PHNwYW4+XCIpLmNvbmNhdChpbmRleCArIDEsIFwiPC9zcGFuPjwvZGl2PlxcblxcdFxcdFxcdFxcdFxcdDxkaXYgY2xhc3M9XFxcImFydGljbGVfX2ljb24gYXJ0aWNsZV9faWNvbi0tcmVhZFxcXCIgdGl0bGU9XFxcIlJlYWRcXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdDxzdmcgd2lkdGg9XFxcIjE0XFxcIiBoZWlnaHQ9XFxcIjE0XFxcIj5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHQ8dXNlIHhsaW5rOmhyZWY9XFxcIiN2aWV3XFxcIj48L3VzZT5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8L3N2Zz5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8aGVhZGVyIGNsYXNzPVxcXCJhcnRpY2xlX19oZWFkZXJcXFwiPlwiKS5jb25jYXQobmV3c0l0ZW0udGl0bGUsIFwiPC9oZWFkZXI+XFxuXFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cXFwiYXJ0aWNsZV9faW5mb1xcXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cXFwiYXJ0aWNsZV9faWNvblxcXCIgdGl0bGU9XFxcIlB1Ymxpc2hlZFxcXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PHN2ZyB3aWR0aD1cXFwiMTRcXFwiIGhlaWdodD1cXFwiMTRcXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdDx1c2UgeGxpbms6aHJlZj1cXFwiI2Nsb2NrXFxcIj48L3VzZT5cXG5cXHRcXHRcXHRcXHRcXHRcXHRcXHQ8L3N2Zz48L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHRcXHQ8ZGF0ZXRpbWUgY2xhc3M9XFxcImFydGljbGVfX2RhdGV0aW1lXFxcIj5cIikuY29uY2F0KG5ld3NJdGVtLmRhdGV0aW1lLCBcIjwvZGF0ZXRpbWU+XFxuXFx0XFx0XFx0XFx0XFx0XFx0PGRpdiBjbGFzcz1cXFwiYXJ0aWNsZV9faWNvblxcXCIgdGl0bGU9XFxcIkF1dGhvclxcXCI+XFxuXFx0XFx0XFx0XFx0XFx0XFx0XFx0PHN2ZyB3aWR0aD1cXFwiMTRcXFwiIGhlaWdodD1cXFwiMTRcXFwiPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdFxcdDx1c2UgeGxpbms6aHJlZj1cXFwiI3VzZXJcXFwiPjwvdXNlPlxcblxcdFxcdFxcdFxcdFxcdFxcdFxcdDwvc3ZnPlxcblxcdFxcdFxcdFxcdFxcdFxcdDwvZGl2PlxcblxcdFxcdFxcdFxcdFxcdFxcdDxzcGFuIGNsYXNzPVxcXCJhcnRpY2xlX19hdXRob3JcXFwiPlwiKS5jb25jYXQobmV3c0l0ZW0uYXV0aG9yLCBcIjwvc3Bhbj5cXG5cXHRcXHRcXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHRcXHRcXHRcXHQ8YSBjbGFzcz1cXFwiYXJ0aWNsZV9fbGlua1xcXCIgaHJlZj1cXFwiXCIpLmNvbmNhdChuZXdzSXRlbS5saW5rLCBcIlxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGlkPVxcXCJcIikuY29uY2F0KENPTkZJRy5pZC5hcnRpY2xlTGluaykuY29uY2F0KGluZGV4LCBcIlxcXCI+XFx1MDQxRlxcdTA0M0VcXHUwNDM0XFx1MDQ0MFxcdTA0M0VcXHUwNDMxXFx1MDQzRFxcdTA0MzVcXHUwNDM1PC9hPlxcblxcdFxcdFxcdFxcdDwvYXJ0aWNsZT5cXG5cXHRcXHRcXHQ8L2Rpdj5cXG5cXHRcXHQ8L2xpPlwiKTtcbiAgICByZXR1cm4gaXRlbUVsZW07XG4gIH07IC8vINC10YHQu9C4INC90LUg0YPQsdGA0LDRgtGMINGI0LDQsdC70L7QvdGLLCDRgtC+INCyIElFINC+0LHRgNCw0LHQvtGC0YfQuNC6INCy0LXRiNCw0LXRgtGB0Y8g0L3QsCDRgtC10LMg0LLQvdGD0YLRgNC4INGB0LDQvNC+0LPQviA8dGVtcGxhdGU+XG4gIC8vINGB0LDQvCDRgtC10LMgPHRlbXBsYXRlPiDQsiBJRSDQvdC1INGD0LTQsNC70LjRgtGMLCDRgi7Qui4gSUUg0LXQs9C+INC90LUg0LzQvtC20LXRgiDQvdCw0LnRgtC4INCyINC00L7QutGD0LzQtdC90YLQtVxuXG5cbiAgdmFyIHJlbW92ZVRlbXBsYXRlcyA9IGZ1bmN0aW9uIHJlbW92ZVRlbXBsYXRlcygpIHtcbiAgICB2YXIgdGVtcGxhdGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RlbXBsYXRlcycpO1xuICAgIHRlbXBsYXRlcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRlbXBsYXRlcyk7XG4gIH07XG5cbiAgd2luZG93LmV4cG9ydHMucmVuZGVyID0ge1xuICAgIHJlbmRlclVzaW5nVGVtcGxhdGVzOiByZW5kZXJVc2luZ1RlbXBsYXRlcyxcbiAgICByZW5kZXJXaWRnZXQ6IHJlbmRlcldpZGdldCxcbiAgICByZW1vdmVUZW1wbGF0ZXM6IHJlbW92ZVRlbXBsYXRlcyxcbiAgICB1cGRhdGVXaWRnZXRJY29uOiB1cGRhdGVXaWRnZXRJY29uLFxuICAgIG1hcmtBcnRpY2xlQXNSZWFkOiBtYXJrQXJ0aWNsZUFzUmVhZCxcbiAgICBoaWRlV2lkZ2V0OiBoaWRlV2lkZ2V0LFxuICAgIHNob3dXaWRnZXQ6IHNob3dXaWRnZXRcbiAgfTtcbn0pKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cblxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIENPTkZJRyA9IHdpbmRvdy5leHBvcnRzLkNPTkZJRztcbiAgdmFyIGxvYWRlciA9IHdpbmRvdy5leHBvcnRzLmxvYWRlcjtcbiAgdmFyIF9yZW5kZXIgPSB3aW5kb3cuZXhwb3J0cy5yZW5kZXI7XG5cbiAgdmFyIFdpZGdldCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gV2lkZ2V0KCkge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFdpZGdldCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKFdpZGdldCwgW3tcbiAgICAgIGtleTogXCJjb250cnVjdG9yXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY29udHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5fbmV3cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fdW5yZWFkQ291bnQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcImluaXRcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICB2YXIgb25Mb2FkID0gdGhpcy5vbkxvYWQuYmluZCh0aGlzKTtcbiAgICAgICAgbG9hZGVyLmxvYWQob25Mb2FkKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwib25Mb2FkXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb25Mb2FkKGRhdGEpIHtcbiAgICAgICAgdmFyIG5ld3MgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICB0aGlzLm5ld3MgPSBuZXdzO1xuICAgICAgICB0aGlzLnVucmVhZENvdW50ID0gbmV3cy5sZW5ndGg7XG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuYWRkTGlzdGVuZXJzKCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcInJlbmRlclwiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgLy8g0LXRgdC70Lgg0LHRgNCw0YPQt9C10YAg0L/QvtC00LTQtdGA0LbQuNCy0LDQtdGCINGC0LXQsyA8dGVtcGxhdGU+XG4gICAgICAgIGlmICgnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSkge1xuICAgICAgICAgIF9yZW5kZXIucmVuZGVyVXNpbmdUZW1wbGF0ZXModGhpcy5uZXdzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfcmVuZGVyLnJlbmRlcldpZGdldCh0aGlzLm5ld3MpO1xuXG4gICAgICAgICAgX3JlbmRlci5yZW1vdmVUZW1wbGF0ZXModGhpcy5uZXdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJhZGRMaXN0ZW5lcnNcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLndpZGdldEljb24pKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuc2hvdyk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIuY29uY2F0KENPTkZJRy5pZC5idG5DbG9zZSkpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5oaWRlKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIi5jb25jYXQoQ09ORklHLmlkLmxpc3QpKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICBpZiAoZXZ0LnRhcmdldC50YWdOYW1lID09PSAnQScgJiYgQ09ORklHLnJlZ2V4cC5hcnRpY2xlTGlua0lkLnRlc3QoZXZ0LnRhcmdldC5pZCkpIF90aGlzLm9uQXJ0aWNsZUxpbmtDbGljayhldnQudGFyZ2V0LmlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgIGlmIChldnQua2V5ID09PSAnRXNjYXBlJyB8fCBldnQua2V5ID09PSAnRXNjJykgX3RoaXMuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwib25BcnRpY2xlTGlua0NsaWNrXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb25BcnRpY2xlTGlua0NsaWNrKGxpbmtJZCkge1xuICAgICAgICB2YXIgaWQgPSBXaWRnZXQuZ2V0TmV3c0lkQnlBcnRpY2xlTGlua0lkKGxpbmtJZCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLm5ld3NbaWRdLmlzUmVhZCkge1xuICAgICAgICAgIHRoaXMubmV3c1tpZF0uaXNSZWFkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnVucmVhZENvdW50LS07XG4gICAgICAgICAgdmFyIGFydGljbGVJZCA9IFdpZGdldC5nZXRBcnRpY2xlSWRCeU5ld3NJZChpZCk7XG5cbiAgICAgICAgICBfcmVuZGVyLm1hcmtBcnRpY2xlQXNSZWFkKGFydGljbGVJZCk7XG5cbiAgICAgICAgICBfcmVuZGVyLnVwZGF0ZVdpZGdldEljb24odGhpcy51bnJlYWRDb3VudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwic2hvd1wiLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNob3coKSB7XG4gICAgICAgIF9yZW5kZXIuc2hvd1dpZGdldCgpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogXCJoaWRlXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaGlkZSgpIHtcbiAgICAgICAgX3JlbmRlci5oaWRlV2lkZ2V0KCk7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcIm5ld3NcIixcbiAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmV3cztcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9uZXdzID0gdmFsdWU7XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiBcInVucmVhZENvdW50XCIsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VucmVhZENvdW50O1xuICAgICAgfSxcbiAgICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3VucmVhZENvdW50ID0gdmFsdWU7XG4gICAgICB9XG4gICAgfV0sIFt7XG4gICAgICBrZXk6IFwiZ2V0TmV3c0lkQnlBcnRpY2xlTGlua0lkXCIsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TmV3c0lkQnlBcnRpY2xlTGlua0lkKGlkKSB7XG4gICAgICAgIHJldHVybiAraWQuc2xpY2UoaWQuaW5kZXhPZignLScpICsgMSwgaWQubGVuZ3RoKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6IFwiZ2V0QXJ0aWNsZUlkQnlOZXdzSWRcIixcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRBcnRpY2xlSWRCeU5ld3NJZChpZCkge1xuICAgICAgICByZXR1cm4gXCIjXCIuY29uY2F0KENPTkZJRy5pZC5hcnRpY2xlKS5jb25jYXQoaWQpO1xuICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBXaWRnZXQ7XG4gIH0oKTtcblxuICB3aW5kb3cuZXhwb3J0cy5XaWRnZXQgPSBXaWRnZXQ7XG59KSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgd2lkZ2V0ID0gbmV3IHdpbmRvdy5leHBvcnRzLldpZGdldCgpO1xud2lkZ2V0LmluaXQoKTsiXX0=
