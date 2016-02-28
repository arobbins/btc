///////////////
/// Imports ///
///////////////
import gulp from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import sass from 'gulp-sass';
import pleeease from 'gulp-pleeease';
import rename from "gulp-rename";


/////////////////
/// Variables ///
/////////////////
const bs = browserSync.create();
const libs = [
  // 'bitcoinjs-lib',
  'rx',
  'rx-dom',
  'jquery'
  // 'async',
  // 'request'
];


//////////////
/// Config ///
//////////////
const config = {
  files: {
    html: '/**/*.html',
    js: '/**/*.js',
    css: '/**/*.scss',
    cssEntry: '/assets/css/app.scss',
    entry: '/app.js'
  },
  folders: {
    dest: './dist',
    app: './app'
  },
  names: {
    vendor: 'vendor.min.js',
    app: 'app.min.js',
    css: 'app.min.css'
  }
}


////////////
/// Copy ///
////////////
gulp.task('copy', () => {
  return gulp.src(config.folders.app + config.files.html)
    .pipe(gulp.dest(config.folders.dest));
});


////////////
// Vendor //
////////////
gulp.task('build:vendor', () => {

  const b = browserify({
    debug: true
  });

  // require all libs specified in libs array
  libs.forEach(lib => {
    b.require(lib);
  });

  return b.bundle()
    .pipe(source(config.names.vendor))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename(config.names.vendor))
    .pipe(gulp.dest(config.folders.dest));
});


/////////////
//// App ////
/////////////
gulp.task('build:app', () => {
  return browserify({
    entries: [config.folders.app + config.files.entry],
    extensions: ['.js'],
    debug: true
  })
  .external(libs)
  .transform(babelify)
  .bundle()
  .pipe(source(config.names.app))
  .pipe(buffer())
  .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename(config.names.app))
  .pipe(sourcemaps.write(config.folders.dest))
  .pipe(gulp.dest(config.folders.dest));

});


/////////////
//// CSS ////
/////////////
gulp.task('css', () => {

  return gulp.src(config.folders.app + config.files.cssEntry)
    .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(pleeease())
      .pipe(rename(config.names.css))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.folders.dest));
});


//////////////
/// Server ///
//////////////
gulp.task('server', () => {

  bs.init({
    server: config.folders.dest
  });

  bs.watch(config.folders.app + config.files.html).on("change", gulp.series('copy', bs.reload));
  bs.watch(config.folders.app + config.files.js).on("change", gulp.series('build:app', bs.reload));
  bs.watch(config.folders.app + config.files.css).on("change", gulp.series('css', bs.reload));

});


////////////
/// Init ///
////////////
gulp.task('init',
  gulp.parallel('copy', 'css',
    gulp.series('build:vendor', 'build:app', 'server')
  )
);
