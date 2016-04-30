
#include "selene.h"

extern "C" {

sel::State *init(void);
int exec(sel::State *L, const char *txt, const char *tag, int show_traceback);
sel::State *newthread(sel::State *L);
void deinit(sel::State *L);

}
