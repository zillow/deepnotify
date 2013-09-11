recurse-future
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

[![build status](https://secure.travis-ci.org/uggedal/recurse-future.png)](http://travis-ci.org/uggedal/recurse-future)

Example
-------

```javascript
var rf = require('recurse-future');

rf('.').pipe(process.stdout);
```

License
-------

MIT
