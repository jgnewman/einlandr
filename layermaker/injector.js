var fs = require('fs');
var gutil = require('gulp-util');
var log = gutil.log;

function inject(path, contentArray) {
  var contents;

  try {
    contents = fs.readFileSync(path).toString();

    contentArray.forEach(function (newItem, index) {
      var rx = new RegExp('\\/\\*\\s*(BACK\\s+)?INJECT\\s+POINT\\s+' + (index + 1) + '\\s*\\*\\/');

      var matches   = contents.match(rx);
      var toReplace = matches ? matches[0] : '';
      var isBack    = matches ? !!matches[1] : false;

      if (matches) {
        if (isBack) {
          contents = contents.replace(toReplace, newItem + '\n' + toReplace);
        } else {
          contents = contents.replace(toReplace, toReplace + '\n' + newItem + '\n');
        }
      }
    });

    fs.writeFileSync(path, contents);

  } catch (err) {
    log(err);
  }
}

module.exports = inject;
