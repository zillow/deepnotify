// export DEBUG_DEEPNOTIFY=1
// unset DEBUG_DEEPNOTIFY
var debug = process.env.DEBUG_DEEPNOTIFY
  ? function () { console.error.apply(console, arguments); }
  : function () {}

var fs = require('fs');
var path = require('path');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;
var Inotify = require('inotify').Inotify;
var recurse = require('recurse');

module.exports = DeepNotify;

inherits(DeepNotify, Readable);

function DeepNotify(root) {
  if (!(this instanceof DeepNotify)) {
    return new DeepNotify(root);
  }

  Readable.call(this, {objectMode: true});

  this.descriptors = {};
  this.inotify = new Inotify();

  this._watch(root, 'recursively');
}

DeepNotify.MASK = Inotify.IN_CLOSE_WRITE |
                  Inotify.IN_CREATE |
                  Inotify.IN_MOVED_TO;

DeepNotify.prototype.close = function () {
  debug('close', this.inotify);
  this.inotify.close();
  this.push(null);
};

DeepNotify.prototype._watch = function (relname, recursive) {
  debug('_watch', relname, recursive || '');
  var id = this.inotify.addWatch({
    path: relname,
    watch_for: DeepNotify.MASK,
    callback: this._eventHandler.bind(this)
  });

  this.descriptors[id] = relname;

  if (recursive) {
    this._recurse(relname);
  }
};

DeepNotify.prototype._getEventType = function (mask) {
  if (Inotify.IN_CREATE       & mask) { return 'created'; }
  if (Inotify.IN_DELETE       & mask) { return 'deleted'; }
  if (Inotify.IN_MOVED_FROM   & mask) { return 'moved-out'; }
  if (Inotify.IN_MOVED_TO     & mask) { return 'moved-in'; }
  if (Inotify.IN_CLOSE_WRITE  & mask) { return 'modified'; }
};

DeepNotify.prototype._getFileChanges = function (mask) {
  return {
    inode : !!(Inotify.IN_ATTRIB & mask),
    access: !!(Inotify.IN_ACCESS & mask),
    xattrs: !!(Inotify.IN_ATTRIB & mask)
  };
};

DeepNotify.prototype._eventHandler = function (event) {
  debug('_eventHandler', event);
  var mask = event.mask;

  if (mask & Inotify.IN_IGNORED) {
    delete this.descriptors[event.watch];
    return;
  }

  var relname = path.join(this.descriptors[event.watch], event.name);
  var evt = this._getEventType(mask);

  if (this._isDir(mask)) {
    if (evt === 'created' ||
      evt === 'moved-in') {
      this._watch(relname, 'recursively');
    }
  } else {
    this._publish({
      id: event.watch,
      path: relname,
      type: 'file',
      event: evt,
      changes: this._getFileChanges(mask),
    });
  }
};

DeepNotify.prototype._isDir = function (mask) {
  return mask & Inotify.IN_ISDIR;
};

DeepNotify.prototype._publish = function (info) {
  debug('_publish', info);
  this.push(info);
  if (info.event) {
    this.emit(info.event, info);
  }
};

DeepNotify.prototype._recurse = function (relname) {
  debug('_recurse', relname);
  var r = recurse(relname, {
    writefilter: this._writefilter.bind(this)
  });
  r.on('end',   this.emit.bind(this, 'recursed', relname));
  r.on('error', this.emit.bind(this, 'error'));
  // r.on('data', this.push.bind(this));
  // lacking a data handler, we need to start the flow manually
  r.resume();
};

DeepNotify.prototype._writefilter = function (relname, stat) {
  var isDirectory = stat.isDirectory();
  if (isDirectory) {
    // non-recursive watch
    this._watch(relname);
  }
  return !isDirectory;
};

DeepNotify.prototype._read = function () {
  // noop
};
