# EmLua Editor

This directory contains a demonstration editor for writing Lua code
in the browser. EmLua itself does not require anything in this directory.

## Building

First install required node packages with `npm install`.

Build generated files with `npm run-script build-js`. This produces
output in the `build` subdirectory.

A server is required to serve the editor pages due to browser sercurity
restrictions. Start a local server with `npm run-script server`.

You should now be able to navigate to `localhost:8000` to see the
example editor.

## EmLua dependency

The editor requires a working version of EmLua. A pre-compiled version
is included in the repository under `src/vendor/emlua/`. If you rebuild
EmLua using `npm run-script build` the updated version will be automatically
copied there. [Generated files are included in the repository because
installing Emscripten is not trivial].
