
#include <cstring>
#include <iostream>
#include <string>

#include "emlua.hh"
#include "lua.hpp"

/**
 * How to handle errors generated from Lua side
 * Just print the message and die.
 */
static void lua_error_handler(lua_State *L) {
    int t = lua_type(L, -1);
    if (t == 0) {
        // NIL type, there is no error message
        std::cout << "PANIC" << std::endl;
    } else {
        // Otherwise coerce to string and show it
        const char *msg = lua_tostring(L, -1);
        std::cout << "PANIC: " << msg << std::endl;
    }
}

lua_State *init(void) {
    lua_State *L = luaL_newstate();
    if (L) {
        luaL_openlibs(L);
    }
    return L;
}

int exec(lua_State *L, const char *txt, const char *tag) {
    int err;
    if (!L) {
        return LUA_ERRMEM;
    }
    err = luaL_loadbuffer(L, txt, std::strlen(txt), tag);
    if (err) {
        lua_error_handler(L);
        return err;
    }
    err = lua_pcall(L, 0, LUA_MULTRET, 0);
    if (err) {
        lua_error_handler(L);
        return err;
    }
    return LUA_OK;
}

void deinit(lua_State *L) {
    if (L) {
        lua_close(L);
    }
}
