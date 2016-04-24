
// Emscripten module is always named EMLUA_C in global namespace.
// Had trouble using require on it.
var emlua_c = EMLUA_C;

/// State class, constructed from existing C state
var state = function(parent) {
    // Check if called without new
    if (!(this instanceof state)) {
        return new state(parent);
    }
    this._parent = parent;
    this._L = parent._init();
    return this;
};

/// Execute a string
state.prototype.exec = function(txt, tag, show_traceback) {
    // Tag chunk with string if not given explicitly
    tag = tag || txt;
    if (show_traceback === undefined) show_traceback = true;
    if (!this._L) {
        throw "State has been destroyed with deinit()";
    }
    var res = this._parent._exec(this._L, txt, tag, show_traceback);
    return (res === 1);
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
    this._exec = emlua_c.cwrap('exec', 'boolean', ['number', 'string', 'string', 'number']);
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
main.prototype.exec = function(txt, tag, show_traceback) {
    return this._state.exec(txt, tag, show_traceback);
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
