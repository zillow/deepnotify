recurse-future
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

[![build status](https://secure.travis-ci.org/uggedal/recurse-future.png)](http://travis-ci.org/uggedal/recurse-future)

Example
-------

```javascript
var rf = require('recurse-future');

var s = rf('.');
s.pipe(process.stdout);

setTimeout(function() {
  s.close();
}, 5*1000);
```

License
-------

MIT
