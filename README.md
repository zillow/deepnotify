recurse-future
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

[![build status](https://secure.travis-ci.org/uggedal/recurse-future.png)](http://travis-ci.org/uggedal/recurse-future)
[![dependency status](https://david-dm.org/uggedal/recurse-future.png)](https://david-dm.org/uggedal/recurse-future)

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

Compatibility
-------------

`recurse-future` requires Node.js version 0.10.0 or higher and a Linux
system with a kernel version of 2.6.13 or higher.

License
-------

MIT
