const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');


gulp.task(
  'less',
  gulp.series(() => gulp.src('./less/index.less')
    .pipe(less())
    .pipe(rename('./style.css'))
    .pipe(gulp.dest('./')))
);

gulp.task('watch', gulp.series(() => gulp.watch('./less/**/*.less', gulp.series('less'))));

gulp.task('build', gulp.series('less'));
