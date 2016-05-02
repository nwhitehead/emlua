
#include "emlua.hh"
#include "Cheese.hh"
#include "emscripten.h"

/**
 * Create new fresh state
 */
EMSCRIPTEN_KEEPALIVE
cheese::State *init(void) {
    return (new cheese::State{true});
}

/**
 * Push code on stack
 */
EMSCRIPTEN_KEEPALIVE
int loadbuffer(cheese::State *L, const char *txt, const char *tag) {
    return L->loadbuffer(txt, tag);
}

/**
 * Run/resume code
 */
EMSCRIPTEN_KEEPALIVE
int resume(cheese::State *L, int show_traceback) {
    return L->resume(show_traceback);
}

/**
 * Create new coroutine thread from existing state
 */
EMSCRIPTEN_KEEPALIVE
cheese::State *newthread(cheese::State *L) {
    return (new cheese::State{L, true});
}

/**
 * Show status
 */
EMSCRIPTEN_KEEPALIVE
void status(cheese::State *L) {
    L->status();
}

/**
 * Clear stack (let any subthreads be gc-ed)
 */
EMSCRIPTEN_KEEPALIVE
void clear(cheese::State *L) {
    L->clear();
}

/**
 * Close state and free memory
 */
EMSCRIPTEN_KEEPALIVE
void deinit(cheese::State *L) {
    delete L;
}
