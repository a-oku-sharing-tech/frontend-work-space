// gulpプラグインの読み込み
const gulp = require('gulp');

// 必要なプラグインの読み込み
const changed  = require('gulp-changed');
const gulp_imagemin = require('gulp-imagemin');
const imageminJpg = require('imagemin-jpeg-recompress');
const imageminPng = require('imagemin-pngquant');

// const imagemin = require('imagemin');
const imagemin = require('imagemin-keep-folder');
const imageminWebp = require('imagemin-webp');
const webp = require('gulp-webp');

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const babel = require('gulp-babel');
const minify = require("gulp-babel-minify");

// 圧縮前と圧縮後のディレクトリを定義
const paths = {
  srcDir : 'src',
  dstDir : 'dist'
}

// jpg,png,gif画像の圧縮タスク
gulp.task('imgMin', function(){
	const srcGlob = paths.srcDir + '/img/**/*.{jpg,png}';
	const dstGlob = paths.dstDir + '/img';
	return gulp.src( srcGlob )
	.pipe(changed( dstGlob ))
	.pipe(gulp_imagemin([
		imageminPng(),
		imageminJpg()
	]
	))
	.pipe(gulp.dest( dstGlob ));
});
// webp作成
gulp.task('webp', function(){
	const srcGlob = paths.srcDir + '/img/**/*.{jpg,png}';
	const dstGlob = paths.dstDir+'/webp';
	return imagemin([srcGlob], {
		use: [
			imageminWebp({
				lossless: true,
				method:6
			})
		],
		replaceOutputDir: output => {
			return output.replace(/src\/img\//, 'dist/img/webp/')
		}
	});
});
// 画像のwatch
gulp.task('watch:img', () => {
	return gulp.watch(paths.srcDir + '/img/**/*.{jpg,png}', gulp.parallel('imgMin','webp'));
});


// style.scssの監視タスクを作成する
gulp.task('sass', function () {
	// ★ style.scssファイルを監視
	return gulp.watch('src/css/*.scss', function () {
		// style.scssの更新があった場合の処理

		// style.scssファイルを取得
		return gulp.src('src/css/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
		// outputStyle: 'expanded'
		outputStyle: 'compressed'
		})
		// Sassのコンパイルエラーを表示s
		// (これがないと自動的に止まってしまう)
		.on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(sourcemaps.write({includeContent: false}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(autoprefixer(['last 2 versions', '> 1%', 'ie >= 10']))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/css'));
	});
});

// ES2015 -> ES5
gulp.task('js', (callback) => {
	gulp.src('src/js/*.js') // 読み込むファイル
		.pipe(sourcemaps.init())
		.pipe(babel()) // babelを実行
		.pipe(sourcemaps.write())
		.pipe(sourcemaps.write({includeContent: false}))
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(minify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js')); // 出力先
		callback();
});
gulp.task('watch:js', () => {
	return gulp.watch('src/js/*.js',gulp.parallel('js'));
});


gulp.task('default',gulp.parallel('sass','watch:js','watch:img'));
