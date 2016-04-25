"use strict"

var Terminal = require('../vendor/xterm.js/fit.js')(require('../vendor/xterm.js/xterm.js'));

var Console = {};

Console.create = function(container, options) {

    // container is DOM id of element containing console
    // Options
    //		prompt			String for prompt, can contain color escapes
    //      active			Whether console is accepting input
    //      banner          Text to show on startup
    options = options || {};
    options.prompt = options.prompt || "\x1b[33;1m>>>\x1b[0m ";
    if (options.active === true) {
        options.active = true;
    } else {
        options.active = false;
    }
    options.responder = options.responder || function() { return true; };

    var term_elem = document.getElementById(container);
    var term = new Terminal();
    term.rows = 30;
    term.scrollback = 1;
    term.convertEol = true;
    term.open(term_elem);
    term.fit();
    term.cursorHidden = !options.active;
    term.active = options.active;
    term.line_length = 0;
    term.input_line = "";
    term.prompt_text = options.prompt;
    if (options.banner) {
        term.write(options.banner);
    }
    term.prompt = function() {
        term.write(term.prompt_text);
        term.line_length = 0;
        term.input_line = "";
    };
    if (term.active) {
        term.prompt();
    }

    term.on('key', function (key, ev) {
        if (!term.active) return;
        var printable = (!ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey);

        if (ev.keyCode === 13) {
            term.write('\r\n');
            var stay_active = options.responder(term.input_line, term);
            term.line_length = 0;
            term.input_line = "";
            if (stay_active == false) {
                term.active = false;
            } else {
                term.prompt();
            }
        } else if (ev.keyCode === 8) {
            // Don't backspace over prompt
            if (term.line_length > 0) {
              term.write('\b \b');
              term.line_length--;
              term.input_line = term.input_line.substr(0, term.line_length);
            }
        } else if (printable) {
            term.input_line += "" + key;
            term.line_length++;
            term.write(key);
        }
    });

    return term;
}

module.exports = Console;
