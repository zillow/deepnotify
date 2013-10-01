var rf = require('../');
var fs = require('fs');
var test = require('tap').test;
var Writable = require('stream').Writable;
var path = require('path');
var testfs = require('testfs');

test('move dirs', function (t) {
  t.plan(1);

  var files = [
    '1.txt',
    '2.txt',
    'sub/3.txt',
    'sub/subsub/4.txt',
  ];

  var futureFiles = [
    '5.txt',
    'moved/6.txt',
    'moved/sub/7.txt',
    'moved/sub/subsub/8.txt',
  ];

  var prefix = 'move';

  testfs(prefix, files, function (err, rm) {
    var move = rf('move');

    var all = [];
    var concat = new Writable({ objectMode: true });
    concat._write = function (chunk, enc, next) {
      all.push(chunk.path);
      console.log(chunk.path);
      if (all.length === futureFiles.length) move.close();
      next();
    };
    concat.on('end', function () {
      t.equal(
        all.sort().join('\n'),
        futureFiles.map(function (name) {
          return path.join(prefix, name);
        }).sort().join('\n')
      );
      rm();
    });

    move.pipe(concat);

    setTimeout(function() {
      fs.mkdirSync('moved');
      fs.mkdirSync('moved/sub');
      fs.writeFileSync('5.txt', '');
      fs.writeFileSync('moved/6.txt', '');
      fs.writeFileSync('moved/sub/7.txt', '');
      fs.renameSync('5.txt', 'move/5.txt');
      fs.renameSync('moved', 'move/moved');

      setTimeout(function() {
        fs.mkdirSync('move/moved/sub/subsub');
        fs.writeFileSync('move/moved/sub/subsub/8.txt', '');
      }, 10);
    }, 10);
  });
});
