// gulp
var gulp = require("gulp");

// gulp-jsdoc
var jsdoc = require("gulp-jsdoc");

// gulp-istanbul - A Javascript code coverage
var istanbul = require('gulp-istanbul');

// gulp-mocha
var mocha = require('gulp-mocha');

// プロジェクト情報
var infos = {
  // プロジェクト名
  name: "node-structured-bit-buffer",
  // バージョン
  version: "0.0.1"
};

// HTMLのテンプレート設定
var template = {
  // テンプレートプラグイン「ink-docstrap」を使用する
  path: "ink-docstrap",

  // プロジェクト名 ページタイトル・ヘッダーの左上に表示されます
  systemName: "node-structured-bit-buffer",

  // HTMLのスタイルテーマ
  // cerulean, cosmo, cyborg, darkly, flatly, journal, lumen, paper, readable, sandstone, simplex, slate, spacelab, superhero, united, yetiの中から選べます
  theme: "cosmo",

  // ソースコードに行番号を表示するかどうか
  linenums: true
};

// オプション
var options = {
  // ソースコードを記述したHTMLを生成するかどうか
  outputSourceFiles: true
};

// jsdocを書き出すタスク
gulp.task("jsdoc", function() {
  // 書き出されるindex.htmlに「README.md」を埋め込む
  gulp.src(["./lib/*.js", "README.md"])
    .pipe(jsdoc.parser(infos))
    .pipe(jsdoc.generator("./docs/", template, options))
});

// watch
gulp.task("watch", function() {
  gulp.watch("./lib/*.js", ["jsdoc"])
});

gulp.task('pre-test', function () {
  return gulp.src(['lib/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 20 } }));
});

// 起動時に一度jsdocタスクを実行しwatchを開始
gulp.task("default", ["watch", "jsdoc", "test"]);
