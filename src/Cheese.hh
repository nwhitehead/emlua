#pragma once

#include "emscripten.h"
#include "emdebug.hh"

#include <iostream>
#include <memory>
#include <string>

extern "C" {

#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"

}


namespace cheese {

/**
 * Dump stack to stderr
 */
static void stackdump_g(lua_State* l)
{
    int i;
    int top = lua_gettop(l);
 
    std::cerr << "total in stack " << top << "\n";
 
    for (i = 1; i <= top; i++)
    {  /* repeat for each level */
        int t = lua_type(l, i);
        switch (t) {
            case LUA_TSTRING:  /* strings */
                std::cerr << "string: [" << lua_tostring(l, i) << "]";
                break;
            case LUA_TBOOLEAN:  /* booleans */
                std::cerr << "boolean: " << lua_toboolean(l, i);
                break;
            case LUA_TNUMBER:  /* numbers */
                std::cerr << "number: " << lua_tonumber(l, i);
                break;
            default:  /* other values */
                std::cerr << lua_typename(l, t);
                break;
        }
        std::cerr << "    ";
    }
    std::cerr << std::endl;
}

/**
 * Get traceback, put on top of stack
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
 * A simple C hook function that yields
 * Needed because Lua hooks cannot yield (hooks are special)
 * C hooks can yield if they are line or count hooks and have 0 arguments.
 */
static void my_yield_hook(lua_State *L, lua_Debug *ar) {
    lua_yield(L, 0);
}

/**
 * Extended functionality way to convert value to string
 */
static std::string luavalue_tostring(lua_State *L, int index) {
    if (!lua_isstring(L, index)) {
        if (lua_isnoneornil(L, index)) {
            return std::string{""};
        } else {
            return std::string{"(error object is not a string)"};
        }
    }
    return std::string{lua_tostring(L, index)};
}

/**
 * Handle an exception
 */
static void handle_exception(int _status, lua_State *L) {
    // Default behavior is to print value on top of stack to stderr
    std::cerr << luavalue_tostring(L, -1) << std::endl;
}

class State {
private:
    lua_State *_l;
    bool _l_owner;

public:
    State() : State(false) {}
    State(bool should_open_libs) : _l(nullptr), _l_owner(true) {
        _l = luaL_newstate();
        if (_l == nullptr) {
            throw 0;
        }
        if (should_open_libs) {
            luaL_openlibs(_l);
        }
    }
    State(lua_State *l) : _l(l), _l_owner(false) { }
    State(const State &other) = delete;
    State &operator=(const State &other) = delete;
    State(State &&other) : _l(other._l), _l_owner(other._l_owner) {
        other._l = nullptr;
    }
    State &operator=(State &&other) {
        if (&other == this) return *this;
        _l = other._l;
        _l_owner = other._l_owner;
        other._l = nullptr;
        return *this;
    }
    State(const State *other, bool should_open_libs) : _l(nullptr), _l_owner(true) {
        _l = lua_newthread(other->_l);
        if (_l == nullptr) {
            throw 0;
        }
        if (should_open_libs) {
            luaL_openlibs(_l);
        }
        debug(true);
    }
    ~State() {
        if (_l != nullptr && _l_owner) {
            gc();
            lua_close(_l);
        }
        _l = nullptr;
    }

    void debug(bool enable) {
        if (enable) {
            lua_sethook(_l, &my_yield_hook, LUA_MASKCOUNT, 1000);
        }
    }

public:

    /**
     * Show stack dump to stderr
     */
    void status() {
        stackdump_g(_l);
    }

    /**
     * Clear stack
     * Allows threads to be garbage collected
     */
    void clear() {
        lua_settop(_l, 0);
    }

    /**
     * Garbage collect
     */
    void gc() {
        lua_gc(_l, LUA_GCCOLLECT, 0);
    }

    /**
     * Push code onto the stack, ready to run
     */
    int loadbuffer(const char *code, const char *tag) {
        int status = luaL_loadbuffer(_l, code, std::strlen(code), tag);
        if (status != LUA_OK) {
            handle_exception(status, _l);
            return status;
        }
        return status;
    }

    /**
     * Run/Resume code on top of stack
     */
    int resume(bool show_traceback) {
        int status = lua_resume(_l, nullptr, 0);
        if (status == LUA_OK || status == LUA_YIELD) {
            return status;
        }
        if (show_traceback) {
            // We can do traceback now
            // Stack is not disturbed by returning from dead coroutine
            traceback(_l);
        }
        handle_exception(status, _l);
        return status;
    }
};

} /// namespace

