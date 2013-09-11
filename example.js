var rf = require('./');

var s = rf('.');
s.pipe(process.stdout);

setTimeout(function() {
  s.close();
}, 5*1000);
