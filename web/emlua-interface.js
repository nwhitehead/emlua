var emlua = 
(function() {

var init = Module.cwrap('init', 'number', null);
var exec = Module.cwrap('exec', 'boolean', ['number', 'string', 'string']);
var deinit = Module.cwrap('deinit', null, ['number']);

/// Create a new state (optionally use new keyword)
function state() {
    // Check if called without new
    if (!(this instanceof state)) {
        return new state();
    }
    // Keep pointer to lua_State
    this._L = init();
}

/// Execute a string
state.prototype.exec = function(txt, tag) {
    // Tag chunk with string if not given explicitly
    tag = tag || txt;
    if (!this._L) {
        throw "State has been destroyed with deinit()";
    }
    var res = exec(this._L, txt, tag);
    return res;
};

/// Free up state
state.prototype.deinit = function() {
    if (this._L) {
        deinit(this._L);
        this._L = undefined;
    } else {
        throw "State has been destroyed with deinit()";
    }
};

/// Reset state to fresh instance
state.prototype.reset = function() {
    if (this._L) {
        deinit(this._L);
        this._L = undefined;
    }
    this._L = init();
};

return {
    state: state
};

})();
