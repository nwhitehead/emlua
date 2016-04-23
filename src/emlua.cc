
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
    sel::State *L = new sel::State{true};
    return L;
}

/**
 * Execute a string (compile and run)
 * Show any errors to stderr
 * Returns string with general status (not return values)
 */
EMSCRIPTEN_KEEPALIVE
int exec(sel::State *L, const char *txt, const char *tag, int show_traceback) {
    return (*L)(txt, tag, show_traceback);
}

/**
 * Close state and free memory
 */
EMSCRIPTEN_KEEPALIVE
void deinit(sel::State *L) {
    delete L;
}
