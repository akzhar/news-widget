(function() {
	const CONFIG = window.exports.CONFIG;

	const reject = (msg) => {
		alert(msg);
		throw new Error(msg);
	};

	// ф-ция принимает ссылку, тип загружаемоего ресурса и обработчик успешного запроса
	// ф-ция возвращает объект xhr с методом send()
	const getRequest = (url, contentType, resolve) => {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.setRequestHeader('Content-Type', contentType);
		xhr.timeout = CONFIG.timeout;
		xhr.addEventListener('error', () => reject(CONFIG.msg.error));
		xhr.addEventListener('timeout', () => reject(CONFIG.msg.timeout));
		xhr.addEventListener('load', () => {
			if (xhr.status != CONFIG.status.ok) reject(`${CONFIG.msg.fail}\n${xhr.status}: ${xhr.statusText}`);
			resolve(xhr.responseText);
		});
		return xhr;
	};

	window.exports.xhr = { getRequest };
})();