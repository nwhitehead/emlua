
#include "selene.h"

extern "C" {

sel::State *init(void);
int exec(sel::State *L, const char *txt, const char *tag, int show_traceback);
void deinit(sel::State *L);

}
