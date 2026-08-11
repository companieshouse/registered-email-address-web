const gulp = require("gulp");
const fs = require("node:fs");

const dstDir = "./dist";

// Purge 'dist' directory before building
gulp.task("clean", (done) => {
    fs.rmSync(dstDir, { recursive: true, force: true });
    done();
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
