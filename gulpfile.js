const gulp = require("gulp");
const dartSass = require("sass");
const clean = require("gulp-clean");

const dstDirAssets = "./assets/public";

// Purge all before building
gulp.task("clean", () => {
    return gulp.src([dstDirAssets], { read: false, allowEmpty: true })
        .pipe(clean());
});

// Copy the fonts and images from the govuk-frontend package to the public directory
gulp.task("govuk-assets", () => {
    return gulp
        .src(["./node_modules/govuk-frontend/govuk/assets/**/*"])
        .pipe(gulp.dest(dstDirAssets));
});

// Binding all tasks together...
gulp.task("build", gulp.series(["clean", "govuk-assets"]));

gulp.task("serve", gulp.series("build", () => {
    exec("npm start", function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log(stdout);
        console.log(stderr);
    });
}));

gulp.task("default", gulp.series("serve"));
