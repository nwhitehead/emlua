#pragma once

#include "emscripten.h"
#include "emdebug.h"

#include "ExceptionHandler.h"
#include <iostream>
#include <memory>
#include <string>
#include "Registry.h"
#include "Selector.h"
#include <tuple>
#include "util.h"
#include <vector>

#include "lua.h"

namespace sel {

void stackdump_g(lua_State* l)
{
    int i;
    int top = lua_gettop(l);
 
    std::cerr << "total in stack " << top << "\n";
 
    for (i = 1; i <= top; i++)
    {  /* repeat for each level */
        int t = lua_type(l, i);
        switch (t) {
            case LUA_TSTRING:  /* strings */
                std::cerr << "string: '" << lua_tostring(l, i);
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

class State {
private:
    lua_State *_l;
    bool _l_owner;
    std::unique_ptr<Registry> _registry;
    std::unique_ptr<ExceptionHandler> _exception_handler;

public:
    State() : State(false) {}
    State(bool should_open_libs) : _l(nullptr), _l_owner(true), _exception_handler(new ExceptionHandler) {
        _l = luaL_newstate();
        if (_l == nullptr) throw 0;
        if (should_open_libs) luaL_openlibs(_l);
        _registry.reset(new Registry(_l));
        HandleExceptionsPrintingToStdOut();
    }
    State(lua_State *l) : _l(l), _l_owner(false), _exception_handler(new ExceptionHandler) {
        _registry.reset(new Registry(_l));
        HandleExceptionsPrintingToStdOut();
    }
    State(const State &other) = delete;
    State &operator=(const State &other) = delete;
    State(State &&other)
        : _l(other._l),
          _l_owner(other._l_owner),
          _registry(std::move(other._registry)) {
        other._l = nullptr;
    }
    State &operator=(State &&other) {
        if (&other == this) return *this;
        _l = other._l;
        _l_owner = other._l_owner;
        _registry = std::move(other._registry);
        other._l = nullptr;
        return *this;
    }
    State(const State *other, bool should_open_libs) : 
        _l(nullptr), _l_owner(true),
        _exception_handler(new ExceptionHandler) {
        _l = lua_newthread(other->_l);
        if (_l == nullptr) throw 0;
        if (should_open_libs) luaL_openlibs(_l);
        _registry.reset(new Registry(_l));
        HandleExceptionsPrintingToStdOut();
    }
    ~State() {
        if (_l != nullptr && _l_owner) {
            ForceGC();
            lua_close(_l);
        }
        _l = nullptr;
    }

    int Size() const {
        return lua_gettop(_l);
    }

    bool Load(const std::string &file) {
        ResetStackOnScopeExit savedStack(_l);
        int status = luaL_loadfile(_l, file.c_str());
#if LUA_VERSION_NUM >= 502
        auto const lua_ok = LUA_OK;
#else
        auto const lua_ok = 0;
#endif
        if (status != lua_ok) {
            if (status == LUA_ERRSYNTAX) {
                const char *msg = lua_tostring(_l, -1);
                _exception_handler->Handle(status, msg ? msg : file + ": syntax error");
            } else if (status == LUA_ERRFILE) {
                const char *msg = lua_tostring(_l, -1);
                _exception_handler->Handle(status, msg ? msg : file + ": file error");
            }
            return false;
        }

        status = lua_pcall(_l, 0, LUA_MULTRET, 0);
        if(status == lua_ok) {
            return true;
        }

        const char *msg = lua_tostring(_l, -1);
        _exception_handler->Handle(status, msg ? msg : file + ": dofile failed");
        return false;
    }

    void OpenLib(const std::string& modname, lua_CFunction openf) {
        ResetStackOnScopeExit savedStack(_l);
#if LUA_VERSION_NUM >= 502
        luaL_requiref(_l, modname.c_str(), openf, 1);
#else
        lua_pushcfunction(_l, openf);
        lua_pushstring(_l, modname.c_str());
        lua_call(_l, 1, 0);
#endif
    }

    void HandleExceptionsPrintingToStdOut() {
        *_exception_handler = ExceptionHandler([](int, std::string msg, std::exception_ptr){_print(msg);});
    }

    void HandleExceptionsWith(ExceptionHandler::function handler) {
        *_exception_handler = ExceptionHandler(std::move(handler));
    }

public:
    Selector operator[](const char *name) {
        return Selector(_l, *_registry, *_exception_handler, name);
    }

    bool operator()(const char *code) {
        ResetStackOnScopeExit savedStack(_l);
        int status = luaL_dostring(_l, code);
        if(status) {
            _exception_handler->Handle_top_of_stack(status, _l);
            return false;
        }
        return true;
    }
    bool operator()(const char *code, const char *tag, bool show_traceback) {
        ResetStackOnScopeExit savedStack(_l);
        if (show_traceback) {
            lua_pushcfunction(_l, traceback);
        }
        int status = luaL_loadbuffer(_l, code, std::strlen(code), tag);
        if (status != LUA_OK) {
            _exception_handler->Handle_top_of_stack(status, _l);
            return false;
        }
        status = lua_pcall(_l, 0, LUA_MULTRET, show_traceback ? -2 : 0);
        if(status == LUA_OK) {
            return true;
        }
        _exception_handler->Handle_top_of_stack(status, _l);
        return false;
    }
    void status() {
        stackdump_g(_l);
    }
    void clear() {
        lua_settop(_l, 0);
    }
    int resume(const char *code, const char *tag, bool show_traceback) {
        ResetStackOnScopeExit savedStack(_l);
        int status;
        if (std::string(code).length() > 0) {
            status = luaL_loadbuffer(_l, code, std::strlen(code), tag);
            if (status != LUA_OK) {
                _exception_handler->Handle_top_of_stack(status, _l);
                return false;
            }
        }
        status = lua_resume(_l, nullptr, 0);
        if (status == LUA_OK || status == LUA_YIELD) {
            return status;
        }
        if (show_traceback) {
            // We can do traceback now, stack is not disturbed by returning from dead coroutine
            traceback(_l);
        }
        _exception_handler->Handle_top_of_stack(status, _l);
        return status;
    }
    void ForceGC() {
        lua_gc(_l, LUA_GCCOLLECT, 0);
    }

    void InteractiveDebug() {
        luaL_dostring(_l, "debug.debug()");
    }

    friend std::ostream &operator<<(std::ostream &os, const State &state);
};

inline std::ostream &operator<<(std::ostream &os, const State &state) {
    os << "sel::State - " << state._l;
    return os;
}
}
