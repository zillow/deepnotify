var rf = require('../');
var fs = require('fs');
var test = require('tap').test;
var testfs = require('testfs');

test('flat dir', function (t) {
  t.plan(5);

  testfs('flat', ['1.txt', '2.txt'], function (err, rm) {
    var writes = 0;

    var flat = rf('flat');
    flat.on('readable', function () {
      var data = flat.read();
      if (data) {
        t.similar(data, /flat\/\d\.txt/);
        writes++;
        if (writes == 4) flat.close();
      }
    });
    flat.on('end', function () {
      t.equal(writes, 4);
      rm();
    });

    setTimeout(function() {
      fs.writeFileSync('flat/3.txt', '');
      fs.writeFileSync('flat/4.txt', '');
    }, 10);
  });
});
