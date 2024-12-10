const gulp = require("gulp");
const clean = require("gulp-clean");

const dstDir = "./dist";

// Purge 'dist' directory before building
gulp.task("clean", () => {
    return gulp.src([dstDir], { read: false, allowEmpty: true })
        .pipe(clean());
});

gulp.task("serve", gulp.series("clean", () => {
    exec("npm start", function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log(stdout);
        console.log(stderr);
    });
}));

gulp.task("default", gulp.series("serve"));
