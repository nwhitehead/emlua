#include <iostream>
#include <cstdio>
#include <cstdlib>

#include "selene.h"

int main(int argc, char *argv[]) {

    // Create Lua state, open standard libraries
    sel::State state{true};

    // Setup command line arguments
    auto arg = state["arg"];
    for (int i = 0; i < argc; i++) {
		arg[i + 1] = std::string(argv[i]);
	}

    // Run bootstrap
    state("print(42)");

    return 0;
}
