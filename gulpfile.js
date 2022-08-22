// Подключение модулей
const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const del = require('del');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const browserSync = require('browser-sync').create();
const pugGulp = require('gulp-pug');
// const htmlmin = require('gulp-htmlmin');

//Пути к файлам
const paths = {
	// html: {
	// 	src: 'src/*.html',
	// 	dest: 'dist/'
	// },
	pug: {
		src: 'src/**/*.pug',
		dest: 'dist',
	},
	styles: {
		src: 'src/scss/*.scss',
		dest: 'dist/css/'
	},
	scripts: {
		src: 'src/js/**/*.js',
		dest: 'dist/js'
	},
	images: {
		src: 'src/img/**',
		dest: 'dist/img'
	}
}
// Очистка не нужных файлов
function clean() {
	return del(['dist/*', '!dist/img']);
}

function cleanHTML() {
	return del(['dist/pug']);
}
// Сибираем HTML
// function buildHTML() {
// 	return src(paths.html.src)
// 		.pipe(htmlmin({
// 			collapseWhitespace: true
// 		}))
// 		.pipe(dest(paths.html.dest))
// 		.pipe(browserSync.stream());
// }

//Компилируем PUG файлы
function buildPUG() {
	return src(paths.pug.src)
		.pipe(pugGulp())
		.pipe(dest(paths.pug.dest))
		.pipe(browserSync.stream());
}

//Компилируем стили
function buildStyles() {
	return src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(rename({
			basename: 'style',
			extname: '.min.css'
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

//Собираем файлы JS
function buildJS() {
	return src(paths.scripts.src)
		.pipe(sourcemaps.init())
		.pipe(concat('app.min.js'))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(dest(paths.scripts.dest))
		.pipe(browserSync.stream());
}

//Оптимизируем изображения
function img() {
	return src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin({
			progressive: true,
			optimizationLevel: 3,
			svgoPlugins: [
				{
					removeViewBox: true
				}
			]
		}))
		.pipe(size({
			showFiles: true
		}))
		.pipe(dest(paths.images.dest))
}

// Наблюдаем за изменением
function watcher() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	})
	watch(paths.pug.dest).on('change', browserSync.reload);
	// watch(paths.html.src, buildHTML)
	watch(paths.pug.src, buildPUG);
	watch(paths.styles.src, buildStyles);
	watch(paths.scripts.src, buildJS);
	watch(paths.images.src, img);
}

const build = series(clean, buildPUG, parallel(buildStyles, buildJS, img), cleanHTML, watcher)

// exports.buildHTML = buildHTML;
exports.buildPUG = buildPUG;
exports.buildJS = buildJS; 
exports.buildStyles = buildStyles;
exports.clean = clean;
exports.cleanHTML = cleanHTML;
exports.watcher = watcher;
exports.img = img;
exports.default = build;