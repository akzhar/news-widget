'use strict';

const ADDRESS = {
	build: {
		root: 'build/',
		css: 'build/css/',
		fonts: 'build/fonts/',
		data: 'build/data/',
		img: 'build/img/',
		js: 'build/js/'
	},
	source: {
		root: 'src/',
		blocks: 'src/blocks/',
		fonts: 'src/fonts/',
		data: 'src/data/',
		img: 'src/img/',
		sprite: 'src/img/sprite/',
		js: 'src/js/'
	},
	temp: 'temp/'
};

const path = require('path');
const gulp = require('gulp');

// каждый раз кеширует цепочку обработки
// если в новой итерации нет закешированных ранее файлов - добавляет их в цепочку обработки
const remember = require('gulp-remember');

function lazyRequireTask(taskName, path, options) {
	options = options || {};
	options.taskName = taskName;
	gulp.task(taskName, function(callback) {
		let task = require(path).call(this, options);
		return task(callback);
	});
}

lazyRequireTask('delete', './gulp_tasks/delete.js', {folders: ['build', 'temp']});

lazyRequireTask('copy-data', './gulp_tasks/copy.js', {
	src: `${ADDRESS.source.data}*.json`,
	dest: `${ADDRESS.build.data}`,
	debugTitle: 'copy data files:',
	taskName: 'copy-data'
});

lazyRequireTask('copy-fonts', './gulp_tasks/copy.js', {
	src: `${ADDRESS.source.fonts}*.{woff,woff2}`,
	dest: `${ADDRESS.build.fonts}`,
	debugTitle: 'copy font files:',
	taskName: 'copy-fonts'
}); 

lazyRequireTask('style-main', './gulp_tasks/style.js', {
	src: `${ADDRESS.source.root}widget.styl`,
	dest: `${ADDRESS.build.css}`,
	bundleName: 'widget'
});

lazyRequireTask('style-widget', './gulp_tasks/style.js', {
	src: `${ADDRESS.source.root}style.styl`,
	dest: `${ADDRESS.build.css}`,
	bundleName: 'style'
});

lazyRequireTask('html', './gulp_tasks/html.js', {
	src: `${ADDRESS.source.root}*.pug`,
	dest: `${ADDRESS.build.root}`
});

lazyRequireTask('image', './gulp_tasks/image.js', {
	src: `${ADDRESS.source.img}*.{png,jpg,jpeg,svg}`,
	dest: `${ADDRESS.build.img}`
});

lazyRequireTask('stylint', './gulp_tasks/stylint.js', {
	src: `${ADDRESS.source.blocks}**/*.styl`
});

lazyRequireTask('babel', './gulp_tasks/babel.js', {
	src: `${ADDRESS.source.js}**/*.js`,
	dest: `${ADDRESS.temp}`
});

lazyRequireTask('js', './gulp_tasks/js.js', {
	src: [
		`${ADDRESS.temp}config.js`,
		`${ADDRESS.temp}**/xhr.js`,
		`${ADDRESS.temp}**/loader.js`,
		`${ADDRESS.temp}**/render.js`,
		`${ADDRESS.temp}**/widget.js`,
		`${ADDRESS.temp}index.js`
	],
	dest: `${ADDRESS.build.js}`,
	bundleName: 'widget'
});

lazyRequireTask('eslint', './gulp_tasks/eslint.js', {
	src: `${ADDRESS.source.js}**/*.js`
});

lazyRequireTask('sprite-svg', './gulp_tasks/sprite-svg.js', {
	src: `${ADDRESS.source.sprite}*.svg`,
	dest: `${ADDRESS.build.img}`
});

// lazyRequireTask('validateHTML', './gulp_tasks/validateHTML.js', {
// 	src: `${ADDRESS.build.root}*.html`
// });

gulp.task('build', gulp.series(
	'delete',
	'babel',
	'js',
	gulp.parallel('eslint', 'stylint', 'image', 'sprite-svg', 'copy-fonts', 'copy-data'),
	gulp.parallel('style-main', 'style-widget', 'html')
	// 'validateHTML'
));

gulp.task('watch', function() {
	gulp.watch(`${ADDRESS.source.root}**/*.pug`, gulp.series('html'));
	gulp.watch(`${ADDRESS.source.root}**/*.styl`, gulp.parallel('style-main', 'style-widget'));
	gulp.watch(`${ADDRESS.source.js}**/*.js`, gulp.series('babel', 'js')).on('unlink', (filePath) => {
		remember.forget('js', path.resolve(filePath));
	});
	gulp.watch(`${ADDRESS.source.img}**/*.{png,jpg,jpeg,svg}`, gulp.series('image'));
	gulp.watch(`${ADDRESS.source.data}*.json`, gulp.series('copy-data'));
});

lazyRequireTask('server', './gulp_tasks/server.js', {
	root: `${ADDRESS.build.root}`,
	watch: `${ADDRESS.build.root}**/*.*`,
	ip: '192.168.0.63'
});

gulp.task('serve', gulp.parallel('watch', 'server'));

gulp.task('dev', gulp.series('build', 'serve'));

