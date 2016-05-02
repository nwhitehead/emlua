
// Emscripten module is always named EMLUA_C in global namespace.
// Had trouble using require on it.
var emlua_c = EMLUA_C;

var LUA_OK = 0;
var LUA_YIELD = 1;
var LUA_ERRRUN = 2;
var LUA_ERRSYNTAX = 3;
var LUA_ERRMEM = 4;
var LUA_ERRGCMM = 5;
var LUA_ERRERR = 6;

/// State class, constructed from existing C state
var state = function(parent, otherL) {
    // Check if called without new
    if (!(this instanceof state)) {
        return new state(parent, otherL);
    }
    this._parent = parent;
    if (otherL) {
        this._L = parent._newthread(otherL);
    } else {
        this._L = parent._init();
    }
    this.running = true;
    return this;
};

/// Post a blocking task to the browser main loop
var post_blocking_task = function(f) {
    return setTimeout(f);
};

var timeout_prefix = function(timeout) {
    return "function timeout(t) local t0 = os.time() return (function() local t1 = os.time() if t1 - t0 > t then error('timed out') end end) end debug.sethook(timeout(" + timeout + "), '', 1000)";
};

var debug_prefix = "function f() coroutine.yield() end debug.sethook(f, '', 1000)";

/// Execute a string
state.prototype.exec = function(txt, options) {
    // Tag chunk with string if not given explicitly
    options = options || {};
    options.tag = options.tag || txt;
    if (options.show_traceback === undefined) options.show_traceback = true;
    if (!this._L) {
        throw "State has been destroyed with deinit()";
    }
    var new_state = this.newthread();
    var that = this;
    var controller = {
        running: true,
        resume: function() {
            var res = new_state._parent._resume(new_state._L, options.show_traceback);
            if (res === LUA_YIELD) {
                if (controller.running) {
                    controller.task = post_blocking_task(controller.resume);
                }
                return;
            }
            // Success or failure callback
            if (options.callback) {
                options.callback(res);
            }
        },
        unpause: function() {
            controller.running = true;
            controller.task = post_blocking_task(controller.resume);
        },
        pause: function() {
            controller.running = false;
        },
        cancel: function() {
            console.log('Cancelling task', controller.task);
            window.clearTimeout(controller.task);
            controller.task = null;
        }
    };
    var res = new_state._parent._loadbuffer(new_state._L, txt, options.tag);
    if (res == LUA_OK) {
        controller.resume();
    } else {
        // Failure callback
        if (options.callback) {
            options.callback(res);
        }
    }
    return controller;
};

/// Execute a string
state.prototype.newthread = function() {
    if (!this._L) {
        throw "State has been destroyed with deinit()";
    }
    return state(this._parent, this._L);
};

/// Reset state to fresh instance
state.prototype.reset = function() {
    if (this._L) {
        this._parent._deinit(this._L);
        this._L = undefined;
    }
    this._L = this._parent._init();
    return this;
};

/// Deinit
state.prototype.deinit = function() {
    if (this._L) {
        this._parent._deinit(this._L);
        this._L = undefined;
        this._parent = undefined;
    } else {
        throw "State has been destroyed with deinit()";
    }
    return this;
};

/// Status
state.prototype.show_status = function() {
    this._parent._status(this._L);
};

/// Create a new main object (optionally use new keyword)
var main = function(options) {
    // Check if called without new
    if (!(this instanceof main)) {
        return new main(options);
    }
    // Keep track of options
    var emlua_c = EMLUA_C(options);
    this._emlua_c = emlua_c;
    this._init = emlua_c.cwrap('init', 'number', null);
    this._loadbuffer = emlua_c.cwrap('loadbuffer', 'number', ['number', 'string', 'string']);
    this._resume = emlua_c.cwrap('resume', 'number', ['number', 'number']);
    this._newthread = emlua_c.cwrap('newthread', 'number', ['number']);
    this._deinit = emlua_c.cwrap('deinit', null, ['number']);
    this._status = emlua_c.cwrap('status', null, ['number']);
    this._clear = emlua_c.cwrap('clear', null, ['number']);
    // Keep pointer to default state
    this._state = state(this);
}

/// Create a new state in same C area
main.prototype.state = function() {
    if (this._emlua_c) {
        return state(this);
    } else {
        throw "Main state has been destroyed with deinit()";
    }
};

/// Execute a string
main.prototype.exec = function(txt, options) {
    return this._state.exec(txt, options);
};
main.prototype.newthread = function() {
    return this._state.newthread();
};
main.prototype.show_status = function() {
    return this._state.show_status();
};

/// Free up state
main.prototype.deinit = function() {
    if (this._state) {
        this._state.deinit();
        this._state = undefined;
    }
    if (this._emlua_c) {
        this._init = undefined;
        this._loadbuffer = undefined;
        this._resume = undefined;
        this._newthread = undefined;
        this._deinit = undefined;
        this._status = undefined;
        this._clear = undefined;
        this._emlua_c = undefined;
    } else {
        throw "Main state has been destroyed with deinit()";
    }
    return this;
};

/// Reset default state to fresh instance
main.prototype.reset = function() {
    return this._state.reset();
};

/// Clear up any subthreads
main.prototype.clear = function() {
    return this._clear(this._state._L);
};

/// Exports
if (typeof module === 'object' && module.exports) { /// Node
    module.exports = main;
} else {
    EMLUA = main;
}
