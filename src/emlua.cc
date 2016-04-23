
#include <cstring>
#include <iostream>
#include <string>

#include "emscripten.h"
#include "emlua.hh"
#include "lua.hpp"

/**
 * Do a traceback, called from Lua on error
 */
static int traceback(lua_State *L) {
    if (!lua_isstring(L, 1)) {
        if (lua_isnoneornil(L, 1) ||
            !luaL_callmeta(L, 1, "__tostring") ||
            !lua_isstring(L, -1))
            return 1;
        lua_remove(L, 1);
    }
    luaL_traceback(L, L, lua_tostring(L, 1), 1);
    return 1;
}

/**
 * How to handle errors generated from Lua side
 * Just print the message and die.
 */
static void lua_error_handler(lua_State *L) {
    int t = lua_type(L, -1);
    if (t == 0) {
        // NIL type, there is no error
    } else {
        // Otherwise coerce to string and show it
        // (Probably includes traceback with prefixed message)
        const char *msg = lua_tostring(L, -1);
        std::cerr << "PANIC: " << msg << std::endl;
    }
}

/**
 * Create new fresh state
 */
EMSCRIPTEN_KEEPALIVE
lua_State *init(void) {
    lua_State *L = luaL_newstate();
    if (L) {
        luaL_openlibs(L);
    }
    return L;
}

/**
 * Execute a string (compile and run)
 * Show any errors to stderr
 * Returns string with general status (not return values)
 */
EMSCRIPTEN_KEEPALIVE
int exec(lua_State *L, const char *txt, const char *tag) {
    int err;
    if (!L) {
        return LUA_ERRMEM;
    }

    // Push traceback function (for stack traces)
    lua_pushcfunction(L, traceback);

    err = luaL_loadbuffer(L, txt, std::strlen(txt), tag);
    if (err) {
        lua_error_handler(L);
        return err;
    }
    err = lua_pcall(L, 0, LUA_MULTRET, -2);

    if (err) {
        lua_error_handler(L);
        return err;
    }
    return LUA_OK;
}

/**
 * Close state and free memory
 */
EMSCRIPTEN_KEEPALIVE
void deinit(lua_State *L) {
    if (L) {
        lua_close(L);
    }
}
