var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;
var Inotify = require('inotify').Inotify;
var recurse = require('recurse');

if (!Readable) Readable = require('readable-stream').Readable;

var MASK = Inotify.IN_CLOSE_WRITE |
           Inotify.IN_CREATE |
           Inotify.IN_MOVED_TO;

function DeepNotify (root) {
  Readable.call(this, {objectMode: true});

  this.descriptors = {};
  this.inotify = new Inotify();

  this._watch(root);
  this._recurse(root);
}

inherits(DeepNotify, Readable);

DeepNotify.prototype.close = function () {
  this.inotify.close();
  this.push(null);
};

DeepNotify.prototype._watch = function (relname) {
  var id = this.inotify.addWatch({
    path: relname,
    watch_for: MASK,
    callback: this._eventHandler.bind(this)
  });

  this.descriptors[id] = relname;
};

DeepNotify.prototype._eventHandler = function (event) {
  var relname =  path.join(this.descriptors[event.watch], event.name);

  if (event.mask & Inotify.IN_CLOSE_WRITE) {
    this.push(relname);
  } else if (event.mask & Inotify.IN_CREATE) {
    this._changesHandler(relname, event, function(stat) {
      if (stat.isDirectory()) {
        this._watch(relname);
        this._recurse(relname);
      }
    }.bind(this));
  } else if (event.mask & Inotify.IN_MOVED_TO) {
    this._changesHandler(relname, event, function(stat) {
      if (stat.isDirectory()) {
        this._watch(relname);
        this._recurse(relname);
      } else {
        this.push(relname);
      }
    }.bind(this));
  }
};

DeepNotify.prototype._changesHandler = function (relname, event, cb) {
  fs.stat(relname, function(err, stat) {
    if (err) {
      this.emit('error', err);
      return;
    }

    cb(stat);
  }.bind(this));
};

DeepNotify.prototype._recurse = function (relname) {
  var r = recurse(relname, {writefilter: this._writefilter.bind(this)});
  var self = this;

  r.on('data', function (chunk) {
    this.push(chunk);
  }.bind(this));

  r.on('error', function (err) {
    this.emit('error', err);
  }.bind(this));
};


DeepNotify.prototype._writefilter = function (relname, stat) {
  if (stat.isDirectory()) {
    this._watch(relname);
  }

  return !stat.isDirectory();
};

DeepNotify.prototype._read = function () {
  // noop
};

DeepNotify.prototype._write = function (chunk, encoding, cb) {
  this.push(chunk);
  cb(null);
};

module.exports = function (root) {
  return new DeepNotify(root);
};
