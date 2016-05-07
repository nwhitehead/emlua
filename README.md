# EmLua

This is an implementation of Lua for the browser.

## Alternatives

Other projects similar in spirit:
* [Moonshine](http://moonshinejs.org/)
* [Lua.VM.js](https://kripken.github.io/lua.vm.js/lua.vm.js.html)
* [Starlight](http://starlight.paulcuth.me.uk/)
* [Lua5.1.js](https://github.com/logiceditor-com/lua5.1.js)
* [brozula](https://github.com/creationix/brozula)

The strategy of this project is to use [Emscripten](http://kripken.github.io/emscripten-site/)
to compile official Lua sources to get an up-to-date, stable, reliable
Lua platform in JavaScript. On top of this base various functions are
added to help interface Lua with the browser in a natural way.

Some advantages:
* Predictable and compatible Lua semantics
* Parsing of text and bytecode available, no preprocessing required
* Debugging Lua code fully supported, including stack traces
* Multiple interpreter states supported in parallel
* Surprisingly efficient

## Build

Requires [CMake](https://cmake.org/) 3.1 or later.

Requires [Emscripten](http://kripken.github.io/emscripten-site/). Set
up your environment variables by doing something like `source emsdk/emsdk_env.sh`.
Once you can run `emcc --version` successfully do the following:

```
npm run-script build
```

The output file is `build/emlua.js`. The build embeds all the Lua
modules in the `lua_modules` directory.

## Usage in Browser

Include the single file `build/emlua.js` on your page.

```
var state = EMLUA();
var ok = state.exec('print("The answer is " .. 42)');
```

It provides a global variable `EMLUA` that is a function. Create a new
state by calling the function with an optional configuration object.
The state has the `exec` method which executes Lua code passed as a
string.

## Usage in Node

You can also use it in Node, but this is less tested. The module
presents in a CommonJS compatible way.

```
var emlua = require('./build/emlua.js');
var state = emlua();
var ok = state.exec('print("The answer is " .. 42)');
```

## Integrating JavaScript and Lua

### `stdout` and `stderr`

You can provide custom JavaScript handlers for writes to `stdout`
and `stderr` by defining `print` and `printErr` in the customization
object you pass during initialization.

```
var lua = EMLUA({
    'print': function(txt) {
        console.log(txt);
    },
    'printErr': function(txt) {
        alert(txt);
    }
});
```
