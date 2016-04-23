cmake_minimum_required(VERSION 3.1)


### VERSIONING

project(EMLua)

# Turn on C++14
set (CMAKE_CXX_STANDARD 14)

# Use emscripten
set (CMAKE_C_COMPILER emcc)
set (CMAKE_CXX_COMPILER em++)

set (GENERIC_FLAGS "-O2 --memory-init-file 0")
set (CMAKE_C_FLAGS "${CMAKE_C_FLAGS} ${GENERIC_FLAGS}")
set (CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS} ${GENERIC_FLAGS}")

### EXTERNAL PROJECTS

# External libraries location
set(EXTERNAL ${PROJECT_SOURCE_DIR}/external)

## Selene
# Headers only
include_directories(${EXTERNAL}/Selene/include)

## Lua

set (lua_prefix "${EXTERNAL}/lua-5.3.2/src")
include_directories(${lua_prefix})
set (LUA_SRCS
    ${lua_prefix}/lapi.c
    ${lua_prefix}/lauxlib.c
    ${lua_prefix}/lbaselib.c
    ${lua_prefix}/lbitlib.c
    ${lua_prefix}/lcode.c
    ${lua_prefix}/lcorolib.c
    ${lua_prefix}/lctype.c
    ${lua_prefix}/ldblib.c
    ${lua_prefix}/ldebug.c
    ${lua_prefix}/ldo.c
    ${lua_prefix}/ldump.c
    ${lua_prefix}/lfunc.c
    ${lua_prefix}/lgc.c
    ${lua_prefix}/linit.c
    ${lua_prefix}/liolib.c
    ${lua_prefix}/llex.c
    ${lua_prefix}/lmathlib.c
    ${lua_prefix}/lmem.c
    ${lua_prefix}/loadlib.c
    ${lua_prefix}/lobject.c
    ${lua_prefix}/lopcodes.c
    ${lua_prefix}/loslib.c
    ${lua_prefix}/lparser.c
    ${lua_prefix}/lstate.c
    ${lua_prefix}/lstring.c
    ${lua_prefix}/lstrlib.c
    ${lua_prefix}/ltable.c
    ${lua_prefix}/ltablib.c
    ${lua_prefix}/lundump.c
    ${lua_prefix}/lutf8lib.c
    ${lua_prefix}/ltm.c
    ${lua_prefix}/lvm.c
    ${lua_prefix}/lzio.c
)
add_library(lua ${LUA_SRCS})

### EMLua

include_directories(src)
set(SRCS
    src/emlua.cc
)
add_executable(emlua_c.js ${SRCS})
target_link_libraries(emlua_c.js lua)

### Package

add_custom_command(
    OUTPUT ${PROJECT_BINARY_DIR}/emlua.js
    DEPENDS
        emlua_c.js
        ${PROJECT_SOURCE_DIR}/web/emlua_interface.js
        ${PROJECT_SOURCE_DIR}/package.json
    COMMAND browserify ${PROJECT_SOURCE_DIR} > ${PROJECT_BINARY_DIR}/dist.js
)

#~ add_custom_target(dist ALL
    #~ DEPENDS ${PROJECT_BINARY_DIR}/dist.js
#~ )