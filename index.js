var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var Duplex = require('stream').Duplex;
var Inotify = require('inotify').Inotify;
var recurse = require('recurse');

if (!Duplex) Duplex = require('readable-stream').Duplex;

function RecurseFuture (root) {
  Duplex.call(this, {objectMode: true});

  this.descriptors = {};
  this.inotify = new Inotify();

  this._watch(root);
  this._recurse(root);
}

inherits(RecurseFuture, Duplex);

RecurseFuture.prototype.close = function () {
  this.inotify.close();
  this.push(null);
};

RecurseFuture.prototype._watch = function (relname) {
  var id = this.inotify.addWatch({
    path: relname,
    watch_for: Inotify.IN_CLOSE_WRITE | Inotify.IN_CREATE,
    callback: this._eventHandler.bind(this)
  });

  this.descriptors[id] = relname;
};

RecurseFuture.prototype._eventHandler = function (event) {
  if (event.mask & Inotify.IN_CLOSE_WRITE) {
    this.push(this._relname(event));
  } else if (event.mask & Inotify.IN_CREATE ) {
    this._createHandler(event);
  }
};

RecurseFuture.prototype._createHandler = function (event) {
  var relname = this._relname(event);

  fs.stat(relname, function(err, stat) {
    if (err) {
      this.emit('error', err);
      return;
    }

    if (stat.isDirectory()) {
      this._watch(relname);
      this._recurse(relname);
    }
  }.bind(this));
};

RecurseFuture.prototype._relname = function (event) {
  return path.join(this.descriptors[event.watch], event.name);
};

RecurseFuture.prototype._recurse = function (relname) {
  var r = recurse(relname, {writefilter: this._writefilter.bind(this)});
  var self = this;

  r.on('data', function (chunk) {
    this.push(chunk);
  }.bind(this));

  r.on('error', function (err) {
    this.emit('error', err);
  }.bind(this));
};


RecurseFuture.prototype._writefilter = function (relname, stat) {
  if (stat.isDirectory()) {
    this._watch(relname);
  }

  return !stat.isDirectory();
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
