const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');

gulp.task('build', ['less']
);

gulp.task(
  'less',
  () => gulp.src('./less/index.less')
    .pipe(less())
    .pipe(rename('./style.css'))
    .pipe(gulp.dest('./'))
);

gulp.task('watch', () => gulp.watch('./less/**/*.less', ['less']));
