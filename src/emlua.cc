
#include <cstring>
#include <iostream>
#include <string>

#include "emlua.hh"
#include "selene.h"
#include "emscripten.h"

/**
 * Create new fresh state
 */
EMSCRIPTEN_KEEPALIVE
sel::State *init(void) {
    return (new sel::State{true});
}

/**
 * Execute a string (compile and run)
 * Show any errors to stderr
 * Returns string with general status (not return values)
 */
EMSCRIPTEN_KEEPALIVE
int exec(sel::State *L, const char *txt, const char *tag, int show_traceback) {
    return L->resume(txt, tag, show_traceback);
}

/**
 * Create new coroutine thread from existing state
 */
EMSCRIPTEN_KEEPALIVE
sel::State *newthread(sel::State *L) {
    return (new sel::State{L, true});
}

/**
 * Show status
 */
EMSCRIPTEN_KEEPALIVE
void status(sel::State *L) {
    L->status();
}

/**
 * Clear stack (let any subthreads be gc-ed)
 */
EMSCRIPTEN_KEEPALIVE
void clear(sel::State *L) {
    L->clear();
}

/**
 * Close state and free memory
 */
EMSCRIPTEN_KEEPALIVE
void deinit(sel::State *L) {
    delete L;
}
