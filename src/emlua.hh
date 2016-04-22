
#include "lua.hpp"

extern "C" {

lua_State *init(void);
int exec(lua_State *L, const char *txt, const char *tag);
void deinit(lua_State *L);

}
