(function (root, factory) {
    if (typeof module === 'object' && module.exports) { /// Node
        module.exports = factory(require('../build/emlua_c.js'));
    } else { /// Browser
        root.EMLUA = factory(root.Module);
    }
}(this, function (emlua_c) {

    var init = emlua_c.cwrap('init', 'number', null);
    var exec = emlua_c.cwrap('exec', 'boolean', ['number', 'string', 'string', 'number']);
    var deinit = emlua_c.cwrap('deinit', null, ['number']);

    /// Create a new state (optionally use new keyword)
    var state = function() {
        // Check if called without new
        if (!(this instanceof state)) {
            return new state();
        }
        // Keep pointer to lua_State
        this._L = init();
    }

    /// Execute a string
    state.prototype.exec = function(txt, tag, show_traceback) {
        // Tag chunk with string if not given explicitly
        tag = tag || txt;
        if (show_traceback === undefined) show_traceback = true;
        if (!this._L) {
            throw "State has been destroyed with deinit()";
        }
        var res = exec(this._L, txt, tag, show_traceback);
        return (res === 1);
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

    return state;

}));
