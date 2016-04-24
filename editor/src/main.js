
var emlua = EMLUA;

var ace = require('../vendor/ace/ace-src-min-noconflict.js');
var Console = require('./OutputConsole');

require('./main.css');
require('vendor/xterm.js/xterm.css');

var l = emlua();

l.exec('function f() g() end');
l.exec('function g() h() end');
l.exec('function h() error("barf") end');
l.exec('h');
l.exec('h()');
l.exec('f()');
