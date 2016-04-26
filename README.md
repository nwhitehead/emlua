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
* Surprisingly efficient (1/2 native Lua interpreter speed)

## Build

```
cd build
cmake ..
make -j
cd ..
cd editor
npm run build-js
```
