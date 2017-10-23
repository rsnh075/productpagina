'use strict';

// ----------------------------------------------------------------------------
// Base Paths
// ----------------------------------------------------------------------------

var config = {
    projectName: 'Productpage',
    bs: true,
    appPath: {
        root : 'app/',
        scss : 'app/scss/**/*.scss',
        css : 'app/css',
        js : 'app/js/**/*.js',
        html : 'app/*.html',
        tpl : 'app/templates/*',
        partials : 'app/templates/**/*.mustache'
    },
    distPath: {
    root : 'dist/',
    css : 'dist/css',
    js : 'dist/js'
  }
}

// ----------------------------------------------------------------------------
// Load Packages
// ----------------------------------------------------------------------------

// General
var gulp = require ('gulp'),
  useref = require('gulp-useref'),
  gulpIf = require('gulp-if'),
  cache = require('gulp-cache'),
  del = require('del'),
  runSequence = require('run-sequence'),
  mustache = require('gulp-mustache');

// Styles
var sass = require ('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano');

// Javascript
var uglify = require('gulp-uglify');

// Images
var imagemin = require('gulp-imagemin');

// BrowserSync
var bs = require('browser-sync').create(config.projectName);

// ----------------------------------------------------------------------------
// Development Task Configuration
// ---------------------------------------------------------------------------- 

// Start browserSync server
gulp.task('browserSync', function() {
  if (config.bs == true ) {
    bs.init({
      server: {
        baseDir: 'app'
      }
    });
  } else {
      console.log('Browser Sync Disabled');
  }
})

gulp.task('sass', function() {
  return gulp.src(config.appPath.scss)
    .pipe( sass({outputstyle: 'expanded'}).on('error', sass.logError) )
    .pipe( autoprefixer({
        browsers: ['last 2 versions', 'ie >= 10', 'and_chr >= 2.3'],
        cascade: false
    }) )
    .pipe( gulp.dest(config.appPath.css) )
    .pipe( bs.reload({stream: true}) );
})

gulp.task('mustache', function() {
    gulp.src(config.appPath.tpl)
      .pipe( mustache('app/data.json',{},{}))
      .pipe( gulp.dest(config.appPath.root) )
      .pipe( bs.reload({stream: true}) );
});

// Watchers
gulp.task('watch', function() {
  gulp.watch(config.appPath.scss, ['sass']);
  gulp.watch([config.appPath.tpl, config.appPath.partials], ['mustache']);
  gulp.watch(config.appPath.html, bs.reload);
  gulp.watch(config.appPath.js, bs.reload);
})

// ----------------------------------------------------------------------------
// Optimization Tasks
// ---------------------------------------------------------------------------- 

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src(config.appPath.html)
    .pipe( useref() ) //Parse build blocks in HTML files to replace references
    .pipe( gulpIf('*.js', uglify()) )
    .pipe( gulpIf('*.css', cssnano()) )
    .pipe( gulp.dest(config.distPath.root) );
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe( cache(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeViewBox: true}, {cleanupIDs: true}]})
    ])) )
    .pipe( gulp.dest('dist/images') )
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe( gulp.dest('dist/fonts') )
})

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// ----------------------------------------------------------------------------
// Build sequences
// ---------------------------------------------------------------------------- 

gulp.task('default', function(callback) {
  runSequence(['sass', 'mustache', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'images', 'fonts'],
    callback
  )
})