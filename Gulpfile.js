const gulp = require('gulp');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const connect = require('gulp-connect');
const debug = require('gulp-debug');
const ngAnnotate =require('gulp-ng-annotate');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

const paths = {
    mainFile: 'angular-signalr-core-hubs.js',
    mainPath: 'dist/angular-signalr-core-hubs.js',
    minFile: 'angular-signalr-core-hubs.min.js',
};


gulp.task('clean', () => {
    return gulp.src('dist').pipe(clean());
});
gulp.task('build', ['clean'], () => {
    return gulp.src(['node_modules/@aspnet/signalr-client/dist/browser/signalr-clientES5-*[!min].js', 'hubs.js'])
            .pipe(debug())
            .pipe(concat(paths.mainFile))
            .pipe(gulp.dest('dist'));
});
gulp.task('build-min', ['build'], () => {
    return gulp.src(paths.mainPath)
            .pipe(debug())
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(rename(paths.minFile))
            .pipe(gulp.dest('dist'));
});
gulp.task('webserver', ['build-min'], () => {
    return connect.server({
        index: 'test_page.html'
    });
})