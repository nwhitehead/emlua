var emlua = 
(function() {

var init = Module.cwrap('init', 'number', null);
var exec = Module.cwrap('exec', null, ['number', 'string', 'string']);
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
    var res = exec(this._L, txt, tag) | 0;
    switch (res) {
        case 0: return 'LUA_OK'; break;
        case 1: return 'LUA_YIELD'; break;
        case 2: return 'LUA_ERRRUN'; break;
        case 3: return 'LUA_ERRSYNTAX'; break;
        case 4: return 'LUA_ERRMEM'; break;
        case 5: return 'LUA_ERRGCMM'; break;
        case 6: return 'LUA_ERRERR'; break;
        default: return 'LUA_UNKNOWN';
    }
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
