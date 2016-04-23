
#include "selene.h"

extern "C" {

sel::State *init(void);
int exec(sel::State *L, const char *txt, const char *tag);
void deinit(sel::State *L);

}
