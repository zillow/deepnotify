recurse-future
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

[![build status](https://secure.travis-ci.org/uggedal/recurse-future.png)](http://travis-ci.org/uggedal/recurse-future)
[![dependency status](https://david-dm.org/uggedal/recurse-future.png)](https://david-dm.org/uggedal/recurse-future)
[![dev dependency status](https://david-dm.org/uggedal/recurse-future/dev-status.png)](https://david-dm.org/uggedal/recurse-future#info=devDependencies)

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

Mehods
------

```javascript
var recurseFuture = require('recurse-future');
```

### var s = recurseFuture(root)

Return a redable stream of all present and future files recursively
beneath a `root` directory.

### s.close()

Close all `inotify(7)` watches on `root` and all its subdirectories.

Compatibility
-------------

`recurse-future` requires Node.js version 0.10.0 or higher and a Linux
system with a kernel version of 2.6.13 or higher.

License
-------

MIT
