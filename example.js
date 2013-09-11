var deepnotify = require('./');

var d = deepnotify('.');
d.pipe(process.stdout);

setTimeout(function() {
  d.close();
}, 5*1000);
