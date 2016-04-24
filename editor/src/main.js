/// General imports
var moment = require('moment');

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
var lua = emlua({
    'print': function(txt) {
        terminal.write(ansi_normal + txt + '\n');
    },
    'printErr': function(txt) {
        terminal.write(ansi_normal + ansi_yellow + ansi_bold + txt + '\n');
    }
});

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
    lua.reset();
    var t = moment().format('MMMM Do YYYY, h:mm:ss a');
    terminal.write(ansi_purple + '\nRunning code ' + ansi_normal + '(' + t + ')' + '\n\n')
    lua.exec(txt, 'editor');
};

document.getElementById('run').onclick = run;

// Add keyboard shortcut for run
editor.commands.addCommand({
    name: 'run',
    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
    exec: function(editor) {
        run();
    },
    readOnly: true
});

// Set default focus to editor
editor.focus();
