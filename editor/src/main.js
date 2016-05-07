'use strict';

/// General imports

var moment = require('moment');
require('./main.css');
var Cookies = require('js-cookie');
var Firebase = require('firebase');

/// Terminal imports

var jQuery = require('jquery');
window.jQuery = jQuery;
require('jquery.terminal');
require('./jquery.terminal.css');
require('../node_modules/jquery.terminal/js/unix_formatting.js');


/// Editor imports (ACE)

require('ace');
require('ace-theme');
require('ace-mode');


/// Setup Terminal

var ansi_clear = "\x1b[2J\x1b[1;1f";
var ansi_normal = "\x1b[0m";
var ansi_purple = "\x1b[35m";
var ansi_bold = "\x1b[1m";
var ansi_yellow = "\x1b[33m";

var msg = 
    "[[g;#f5f;#0000]ManiacWebSDK Output Console]\n" +
    "\n" +
    "[[;#a0a;#0000]Copyright 2016 Nathan Whitehead and others]\n\n";

var responder = function(txt) {
};

var terminal = jQuery('#terminal-container').terminal(function(command, term) {
    if (command !== '') {
        if (command != undefined) {
            var txt = command;
            // If console input starts with "=", replace with "return ..."
            // This lets the user examine variables more easily
            if (txt.substring(0, 1) === '=') {
                txt = 'print(' + txt.substring(1) + ')';
            }
            lua.exec(txt, {
                tag: '@console',
                callback: function(res) {
                   flush();
                }
            });
        }
    }
}, {
    greetings: msg,
    name: 'lua_console',
    prompt: '>>> '
});
terminal.focus(false);


/// Setup Lua state

var buffer = '';
var buffered = 0;
var max_buffered = 20;

var flush = function() {
    terminal.echo(buffer);
    buffered = 0;
    buffer = '';
};

var lua = EMLUA({
    'print': function(txt) {
        buffered += 1;
        buffer += txt;
        if (buffered > max_buffered) {
            flush();
        } else {
            buffer += '\n';
        }
    },
    'printErr': function(txt) {
        flush();
        terminal.echo(txt, {
            finalize: function(div) {
                div.css("color", "yellow");
            }
        });
    }
});



/// Set up editor

var editor =  ace.edit("editor");
editor.setTheme("ace/theme/twilight");
editor.getSession().setMode("ace/mode/lua");
editor.setShowPrintMargin(false);
editor.setFontSize(14);
editor.$blockScrolling = Infinity;

/// Start up and load cookie or use default text
var txt_default = "\n-- Put your Lua code here\n\n";
var txt = Cookies.get('current_text') || txt_default;
editor.setValue(txt);
editor.focus();

var save = function() {
    var txt = editor.getValue();
    Cookies.set('current_text', txt);
};

var autoSave = function() {
    save();
    setTimeout(autoSave, 3000);
};
autoSave();


/// User Actions
var cont = null;

var run = function() {
    var txt = editor.getValue();
    lua.reset();
    var t = moment().format('MMMM Do YYYY, h:mm:ss a');
    terminal.echo('[[;#a0a;#0000]Running code] ' + '(' + t + ')' + '\n');
    if (cont) {
        // Cancel any previous pending execs
        cont.cancel();
    }
    cont = lua.exec(txt, {
        tag: '@editor',
        debug: true,
        pause_continuation: function() {
            // What to do after every pause
            flush();
        },
        callback: function(res) {
            // What to do after exec is done
            flush();
            terminal.echo(' ');
        }
    });
};

var clear = function() {
    terminal.clear();
};


/// Setup Buttons + Shortcuts

// Buttons
document.getElementById('run').onclick = run;
document.getElementById('clear').onclick = clear;
// Keyboard shortcuts
editor.commands.addCommand({
    name: 'run',
    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
    exec: function(editor) {
        run();
    },
    readOnly: true
});
editor.commands.addCommand({
    name: 'save',
    bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
    exec: function(editor) {
        save();
    },
    readOnly: true
});

document.getElementById('pause').onclick = function() {
    if (cont) {
        if (cont.running && !cont.done) {
            cont.pause();
            return;
        }
        if (!cont.running && !cont.done) {
            cont.unpause();
            return;
        }
    }
};

