
#include "Cheese.hh"

extern "C" {

cheese::State *init(void);

int loadbuffer(cheese::State *L, const char *txt, const char *tag);

int resume(cheese::State *L, int show_traceback);

cheese::State *newthread(cheese::State *L);

void status(cheese::State *L);

void clear(cheese::State *L);

int getglobal_bool(cheese::State *L, const char *name);
void setglobal_bool(cheese::State *L, const char *name, int value);

void deinit(cheese::State *L);

}
