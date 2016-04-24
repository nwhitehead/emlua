
/// ACE editor with styles and syntax highlighting
var ace = require('ace');
require('../vendor/ace/theme-twilight.js');
require('../vendor/ace/mode-lua.js');

/// Terminal
var Console = require('./OutputConsole');
require('../vendor/xterm.js/xterm.css');

/// Main
require('./main.css');
var emlua = EMLUA;
var terminal = Console.create('terminal-container');

////////////////////////////////

// Start Lua interpreter
var lua = emlua();

// Show banner
var ansi_normal = "\x1b[0m";
var ansi_purple = "\x1b[35m";
var ansi_bold = "\x1b[1m";
var ansi_yellow = "\x1b[33m";
var msg = 
    ansi_purple + ansi_bold + "ManiacWebSDK Output Console\n" + ansi_normal +
    ansi_purple + "~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" + ansi_normal +
    ansi_purple + "Copyright 2016 Nathan Whitehead and others\n\n" + ansi_normal;

terminal.write(msg);

// Set up editor

var editor =  ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.getSession().setMode("ace/mode/lua");
editor.setShowPrintMargin(false);
editor.setFontSize(14);
editor.$blockScrolling = Infinity;

var txt_default = "\n-- Put your Lua code here\n\n";
editor.setValue(txt_default);

// Hook up RUN button
var run = function() {
    var txt = editor.getValue();
    lua.exec(txt, 'editor');
};

document.getElementById('run').onclick = run;

lua.module.print = function(txt) {
    terminal.write(ansi_normal + txt + '\n');
};

lua.module.printErr = function(txt) {
    terminal.write(ansi_normal + ansi_yellow + ansi_bold + txt + '\n');
};





//~ l.exec('function f() g() end');
//~ l.exec('function g() h() end');
//~ l.exec('function h() error("barf") end');
//~ l.exec('h');
//~ l.exec('h()');
//~ l.exec('f()');
