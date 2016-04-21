cmake_minimum_required(VERSION 3.1)


### VERSIONING

project(EMLua)

# Turn on C++14
set (CMAKE_CXX_STANDARD 14)

# Use emscripten
set (CMAKE_C_COMPILER emcc)

### EXTERNAL PROJECTS

# External libraries location
set(EXTERNAL ${PROJECT_SOURCE_DIR}/external)

## Lua
# Add using ZIP file as ExternalProject to keep things clean
include(ExternalProject)
set(ljpre ${PROJECT_BINARY_DIR}/Lua)
set(ljsrc ${ljpre}/src/lua-build/src)

ExternalProject_Add(lua-build
	URL ${EXTERNAL}/lua-5.3.2.tar.gz
	PREFIX ${ljpre}
	CONFIGURE_COMMAND ""
	BUILD_IN_SOURCE 1
	# Quotation pattern is important here
#	BUILD_COMMAND make generic "SYSCFLAGS=-DLUA_USE_POSIX -DLUA_USE_DLOPEN" "SYSLIBS=-lm -ldl"
	BUILD_COMMAND make generic
	INSTALL_COMMAND ""
	COMMAND ${CMAKE_COMMAND} -E copy ${ljsrc}/lua ${ljpre}
	COMMAND ${CMAKE_COMMAND} -E copy ${ljsrc}/liblua.a ${ljpre}
)
set (ljname liblua.a)
add_library(lua STATIC IMPORTED)
set_property(TARGET lua PROPERTY IMPORTED_LOCATION ${ljpre}/liblua.a)
add_dependencies(lua lua-build)
ExternalProject_Get_Property(lua-build source_dir)
set(LUA_INCLUDE_DIR ${source_dir}/src)
set(LUA_BINARY ${ljpre}/lua)

### MAIN

add_subdirectory(src)
