'use strict';

const ADDRESS = {
    build: {
        root: 'build/',
        front: {
            root: 'build/front/',
            css: 'build/front/css/',
            fonts: 'build/front/fonts/',
            data: 'build/front/data/',
            img: 'build/front/img/',
            js: 'build/front/js/'
        },
        back: {
            root: 'build/back/',
            js: 'build/back/js/',
            logs: 'build/back/logs/',
            blocks: 'build/back/blocks/',
            views: 'build/back/views/'
        }
    },
    source: {
        root: 'src/',
        front: {
            root: 'src/front/',
            blocks: 'src/front/blocks/',
            fonts: 'src/front/fonts/',
            data: 'src/front/data/',
            img: 'src/front/img/',
            sprite: 'src/front/img/sprite/',
            js: 'src/front/js/'
        },
        back: {
            root: 'src/back/',
            js: 'src/back/js/',
            logs: 'src/back/logs/',
            views: 'src/back/views/'
        }
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

lazyRequireTask('clean', './gulp_tasks/clean.js', {});

lazyRequireTask('copyBackJS', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.back.js}**/*.js`,
    dest: `${ADDRESS.build.back.js}`,
    debugTitle: 'copy backend js files:',
    taskName: 'copyBackJS'
}); 

lazyRequireTask('copyBackPug', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.front.blocks}**/*.pug`,
    dest: `${ADDRESS.build.back.blocks}`,
    debugTitle: 'copy backend pug files:',
    taskName: 'copyBackPug'
});

lazyRequireTask('copyBackViews', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.back.views}*.pug`,
    dest: `${ADDRESS.build.back.views}`,
    debugTitle: 'copy backend views files:',
    taskName: 'copyBackViews'
});

lazyRequireTask('copyLogs', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.back.logs}*.txt`,
    dest: `${ADDRESS.build.back.logs}`,
    debugTitle: 'copy backend log files:',
    taskName: 'copyLogs'
}); 

lazyRequireTask('copyFonts', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.front.fonts}*.{woff,woff2}`,
    dest: `${ADDRESS.build.front.fonts}`,
    debugTitle: 'copy fonts files:',
    taskName: 'copyFonts'
}); 

lazyRequireTask('copyOther', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.root}*.{cmd,txt}`,
    dest: `${ADDRESS.build.root}`,
    debugTitle: 'copy other files:',
    taskName: 'copyOther'
}); 

lazyRequireTask('copyData', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.front.data}*.js`,
    dest: `${ADDRESS.build.front.data}`,
    debugTitle: 'copy data js files:',
    taskName: 'copyData'
}); 

lazyRequireTask('copyEnv', './gulp_tasks/copy.js', {
    src: `${ADDRESS.source.back.root}.env.json`,
    dest: `${ADDRESS.build.back.root}`,
    debugTitle: 'copy env json file:',
    taskName: 'copyEnv'
}); 

lazyRequireTask('style', './gulp_tasks/style.js', {
    src: `${ADDRESS.source.front.root}style.styl`,
    dest: `${ADDRESS.build.front.css}`
});

lazyRequireTask('html', './gulp_tasks/html.js', {
    src: `${ADDRESS.source.front.root}*.pug`,
    dest: `${ADDRESS.build.front.root}`
});

lazyRequireTask('image', './gulp_tasks/image.js', {
    src: `${ADDRESS.source.front.img}*.{png,jpg,jpeg,svg}`,
    dest: `${ADDRESS.build.front.img}`
});

lazyRequireTask('stylint', './gulp_tasks/stylint.js', {
    src: `${ADDRESS.source.front.blocks}**/*.styl`
});

lazyRequireTask('babel', './gulp_tasks/babel.js', {
    src: `${ADDRESS.source.front.js}*.js`,
    dest: `${ADDRESS.temp}`
});

lazyRequireTask('js', './gulp_tasks/js.js', {
    src: [
        `${ADDRESS.temp}ad.js`,
        `${ADDRESS.temp}printers.js`
    ],
    dest: `${ADDRESS.build.front.js}`
});

lazyRequireTask('eslint', './gulp_tasks/eslint.js', {
    src: `${ADDRESS.source.js}*.js`
});

lazyRequireTask('spriteSVG', './gulp_tasks/spriteSVG.js', {
    src: `${ADDRESS.source.front.sprite}*.svg`,
    dest: `${ADDRESS.build.front.img}`
});

// lazyRequireTask('validateHTML', './gulp_tasks/validateHTML.js', {
//     src: `${ADDRESS.build.front.root}*.html`
// });

gulp.task('build', gulp.series(
    'clean',
    'babel',
    'js',
    gulp.parallel('eslint', 'stylint', 'image', 'spriteSVG', 'copyFonts', 'copyEnv', 'copyLogs', 'copyOther', 'copyData', 'copyBackJS', 'copyBackPug', 'copyBackViews'),
    gulp.parallel('style', 'html')
    // 'validateHTML'
));

gulp.task('watch', function() {
    gulp.watch(`${ADDRESS.source.front.root}**/*.pug`, gulp.series('html'));
    gulp.watch(`${ADDRESS.source.front.root}**/*.styl`, gulp.series('style'));
    gulp.watch(`${ADDRESS.source.front.js}*.js`, gulp.series('babel', 'js')).on('unlink', (filePath) => {
        remember.forget('js', path.resolve(filePath));
    });
    gulp.watch(`${ADDRESS.source.front.img}**/*.{png,jpg,jpeg,svg}`, gulp.series('image'));
    gulp.watch(`${ADDRESS.source.back.js}**/*.js`, gulp.series('copyBackJS'));
    gulp.watch(`${ADDRESS.source.front.blocks}**/*.pug`, gulp.series('copyBackPug'));
    gulp.watch(`${ADDRESS.source.back.views}*.pug`, gulp.series('copyBackViews'));
});

// lazyRequireTask('server', './gulp_tasks/server.js', {
//     root: `${ADDRESS.build.front.root}`,
//     watch: `${ADDRESS.build.root}**/*.*`,
//     ip: '192.168.0.63'
// });

// gulp.task('default', gulp.series(
//     'build',
//     'watch',
//     'server'
// ));