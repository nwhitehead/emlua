
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
        console.log('Creating thread with other state ' + otherL);
        this._L = parent._newthread(otherL);
    } else {
        this._L = parent._init();
    }
    this.status = 'ready';
    return this;
};

/// Post a blocking task to the browser main loop
var post_blocking_task = function(f) {
    window.setTimeout(f);
};

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
    var resume = function() {
        var res = new_state._parent._exec(new_state._L, "", options.tag, options.show_traceback);
        console.log('res(1) = ' + res);
        if (res === LUA_YIELD) {
            post_blocking_task(resume);
            return;
        }
        that.status = 'ready';
        if (options.callback) {
            options.callback(res);
        }
    };
    this.status = 'running';
    console.log('Calling _exec (1)', new_state._parent, new_state._L);
    var res = new_state._parent._exec(new_state._L, txt, options.tag, options.show_traceback);
    console.log('res(2) = ' + res);
    if (res === LUA_YIELD) {
        post_blocking_task(resume);
        return;
    }
    this.status = 'ready';
    if (options.callback) {
        options.callback(res);
    }
};

/// Execute a string
state.prototype.newthread = function() {
    if (!this._L) {
        throw "State has been destroyed with deinit()";
    }
    console.log("Trying to create thread", this._L);
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
    this._exec = emlua_c.cwrap('exec', 'number', ['number', 'string', 'string', 'number']);
    this._newthread = emlua_c.cwrap('newthread', 'number', ['number']);
    this._deinit = emlua_c.cwrap('deinit', null, ['number']);
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

/// Free up state
main.prototype.deinit = function() {
    if (this._state) {
        this._state.deinit();
        this._state = undefined;
    }
    if (this._emlua_c) {
        this._init = undefined;
        this._exec = undefined;
        this._newthread = undefined;
        this._deinit = undefined;
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

/// Exports
if (typeof module === 'object' && module.exports) { /// Node
    module.exports = main;
} else {
    EMLUA = main;
}
