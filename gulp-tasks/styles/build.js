'use strict';

var sourcemaps = require('gulp-sourcemaps');
var flexibility = require('postcss-flexibility');
var postcss = require('gulp-postcss');
var corepostcss = require('postcss');
var cssnext = require('postcss-cssnext');
var cached = require('gulp-cached');
var concatCss = require('gulp-concat-css');
var mqpacker = require('css-mqpacker');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');

var categories = require('../../color-scheme.json');
var dataloop = function(css) {
  for ( var category in categories.colorList ) {
    var colorSet = categories.colorList[category];
    var borderTop = colorSet[0];
    var borderBottom = colorSet[1];
    var rule = corepostcss.rule({ selector: '.cat-' + category });
    rule.append({ prop: 'border-top', value: '1px solid ' + borderTop});
    rule.append({ prop: 'border-bottom', value: '1px solid ' + borderBottom + ";"});
    css.append(rule);
  }
};

module.exports = function (gulp, options) {

  var processors = [
      require('postcss-easy-import'),
      cssnext({
        'browsers': options.css.browsers,
        'compress': true
      }),
      dataloop,
      mqpacker({sort: true}),
      flexibility()
  ];

  return gulp.src(options.css.src)
    .pipe(plumber({
      errorHandler: function (error) {
        notify.onError({
          title: 'CSS <%= error.name %> - Line <%= error.line %>',
          message: '<%= error.message %>'
        })(error);
        this.emit('end');
      }
    }))
    .pipe(gulpif(options.buildSourceMaps, sourcemaps.init({debug: true})))
    .pipe(postcss(processors))
    .pipe(gulpif(options.buildSourceMaps, sourcemaps.write()))
      .pipe(concatCss('theme.css'))
    .pipe(gulp.dest(options.css.dest))
    .pipe(gulpif(options.browserSync.patterns.enabled, browserSync.get('patterns').stream({match: '**/*.css'})))
    .pipe(gulpif(options.browserSync.site.enabled, browserSync.get('site').stream({match: '**/*.css'})));
};
