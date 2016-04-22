
#include "emlua.hh"

#include <string>

#include "selene.h"

// Global state
sel::State *g_state = nullptr;

void init(void) {
    if (g_state) {
        deinit();
    }
    g_state = new sel::State{true};
}

void exec(const char *txt) {
    if (g_state) {
        (*g_state)(txt);
    }
}

void deinit(void) {
    if (g_state) {
        delete g_state;
    }
}

/*
int main(int argc, char *argv[]) {

    init();
    exec("print(42)");
    deinit();

    return 0;
}
*/