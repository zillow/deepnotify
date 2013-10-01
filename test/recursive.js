var rf = require('../');
var fs = require('fs');
var test = require('tap').test;
var Writable = require('stream').Writable;
var path = require('path');
var testfs = require('testfs');

test('recursive dirs', function (t) {
  t.plan(1);

  var files = [
    '1.txt',
    '2.txt',
    'sub/3.txt',
    'sub/subsub/4.txt',
    'sub/subsub/subsubsub/5.txt',
    'sub/subsub/subsubsub/6.txt',
    'sub2/7.txt',
  ];

  var futureFiles = [
    'future.txt',
    'future/8.txt',
    'future/9.txt',
    'future/futuresub/10.txt',
    'future/futuresub/11.txt',
    'sub/12.txt',
    'sub/subsub/13.txt'
  ];

  var paths = files.slice(0);
  paths.push('sub/subsub/empty/');

  var prefix = 'recursive';

  testfs(prefix, paths, function (err, rm) {
    var recursive = rf('recursive');

    var all = [];
    var concat = new Writable({ objectMode: true });
    concat._write = function (chunk, enc, next) {
      all.push(chunk.path);
      if (all.length == futureFiles.length) recursive.close();
      next();
    };
    concat.on('end',  function () {
      t.equal(
        all.sort().join('\n'),
        futureFiles.map(function (name) {
          return path.join(prefix, name);
        }).sort().join('\n')
      );
      rm();
    });

    recursive.pipe(concat);

    setTimeout(function() {
      fs.mkdirSync('recursive/future');
      fs.mkdirSync('recursive/future/futuresub');
      futureFiles.forEach(function(ff) {
        fs.writeFileSync(path.join('recursive', ff), '');
      });
    }, 10);
  });
});
