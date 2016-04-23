
var emlua = require('../web/emlua.js');

var l = emlua();

l.exec('function f() g() end');
l.exec('function g() h() end');
l.exec('function h() error("barf") end');
l.exec('h');
l.exec('h()');
l.exec('f()');
