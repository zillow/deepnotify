var rf = require('../');
var fs = require('fs');
var test = require('tap').test;
var testfs = require('testfs');

test('flat dir', function (t) {
  t.plan(4);

  testfs('flat', ['1.txt', '2.txt'], function (err, rm) {
    var writes = 0;
    var modifyEvents = 0;

    var flat = rf('flat');
    flat.on('readable', function () {
      var data;
      while (null !== (data = flat.read())) {
        t.similar(data.path, /flat\/\d\.txt/);
        writes++;
        if (writes === 2) flat.close();
      }
    });
    flat.on('modified', function () {
      modifyEvents++;
    });
    flat.on('end', function () {
      t.equal(writes, 2);
      t.equal(modifyEvents, 2);
      rm();
    });

    setTimeout(function() {
      fs.writeFileSync('flat/3.txt', '');
      fs.writeFileSync('flat/4.txt', '');
    }, 10);
  });
});
