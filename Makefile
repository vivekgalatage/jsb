CC=g++
CFLAGS=-c -Wall -Ithird-party/v8 -std=c++11
LDFLAGS=-lv8 -Lthird-party/v8/out/native/lib.target 
SOURCES= \
	src/main.cpp 

OBJECTS=$(SOURCES:.cpp=.o)

EXECUTABLE=jsm

all: $(SOURCES) $(EXECUTABLE)
	
$(EXECUTABLE): $(OBJECTS) 
	$(CC) $(OBJECTS) $(LDFLAGS) -o $@

.cpp.o:
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf *o jsm
