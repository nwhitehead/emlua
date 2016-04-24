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
    if (options.active === false) {
        options.active = false;
    } else {
        options.active = true;
    }

    var term_elem = document.getElementById(container);
    var term = new Terminal();
    term.rows = 30;
    term.scrollback = 1;
    term.convertEol = true;
    term.open(term_elem);
    term.fit();
    term.cursorHidden = true;
    term.active = options.active;
    return term;
}

module.exports = Console;
