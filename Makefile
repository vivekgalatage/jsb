CC := g++
CFLAGS := -c -Wall -Ithird-party/v8 -std=c++11
LDFLAGS := -lv8 -Lthird-party/v8/out/native/lib.target

SOURCES := \
	src/main.cpp \
	generated.cpp

JAVASCRIPT_SOURCES := \
	src/js/console.js \
	src/js/system.js

EXECUTABLE := jsm

OBJECTS=$(SOURCES:.cpp=.o)

all: $(EXECUTABLE)

$(EXECUTABLE): generated.cpp $(OBJECTS)
	$(CC) $(OBJECTS) $(LDFLAGS) -o $@

generated.cpp: $(JAVASCRIPT_SOURCES)
	python tools/scripts/js2string.py generated.cpp $(JAVASCRIPT_SOURCES)

.cpp.o:
	$(CC) $(CFLAGS) $< -o $@

clean:
	rm -rf *o generated.cpp jsm
