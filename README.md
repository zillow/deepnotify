deepnotify
==============

Takes a root dir and recursively streams present and
future files using `inotify(7)`.

[![build status](https://secure.travis-ci.org/uggedal/deepnotify.png)](http://travis-ci.org/uggedal/deepnotify)
[![dependency status](https://david-dm.org/uggedal/deepnotify.png)](https://david-dm.org/uggedal/deepnotify)
[![dev dependency status](https://david-dm.org/uggedal/deepnotify/dev-status.png)](https://david-dm.org/uggedal/deepnotify#info=devDependencies)

Example
-------

```javascript
var deepnotify = require('deepnotify');

var d = deepnotify('.');
d.pipe(process.stdout);

setTimeout(function() {
  d.close();
}, 5*1000);
```

Mehods
------

```javascript
var deepnotify = require('deepnotify');
```

### var d = deepnotify(root)

Return a redable stream of all present and future files recursively
beneath a `root` directory.

### d.close()

Close all `inotify(7)` watches on `root` and all its subdirectories.

Compatibility
-------------

`deepnotify` requires Node.js version 0.10.0 or higher and a Linux
system with a kernel version of 2.6.13 or higher.

License
-------

MIT
