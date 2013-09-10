recurse-future
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

Example
-------

```javascript
var rf = require('recurse-future');

rf('.').pipe(process.stdout);
```

License
-------

MIT
