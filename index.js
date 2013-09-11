var path = require('path');
var inherits = require('util').inherits;
var Duplex = require('stream').Duplex;
var Inotify = require('inotify').Inotify;
var recurse = require('recurse');

if (!Duplex) Duplex = require('readable-stream').Duplex;

function RecurseFuture (root) {
  Duplex.call(this, {objectMode: true});

  this.root = root;

  this.inotify = new Inotify();
  this.inotify.addWatch({
    path: root,
    watch_for: Inotify.IN_CLOSE_WRITE,
    callback: this.handler.bind(this)
  });

  recurse(root).pipe(this);
}

inherits(RecurseFuture, Duplex);

RecurseFuture.prototype.close = function () {
  this.inotify.close();
  this.push(null);
};

RecurseFuture.prototype.handler = function (event) {
  this.push(path.join(this.root, event.name));
};

RecurseFuture.prototype._read = function () {
  // noop
};

RecurseFuture.prototype._write = function (chunk, encoding, cb) {
  this.push(chunk);
  cb(null);
};

module.exports = function (root) {
  return new RecurseFuture(root);
};
