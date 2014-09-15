CC := g++
CFLAGS := -c -Wall -Ithird-party/v8 -std=c++11
LDFLAGS := -lv8 -Lthird-party/v8/out/native/lib.target

OUTPUT_DIR := out

SOURCES := \
	src/main.cpp \
	generated.cpp

JAVASCRIPT_SOURCES := \
	src/js/console.js \
	src/js/system.js

EXECUTABLE := jsm

OBJECTS=$(SOURCES:.cpp=.o)

all: checkdirectory $(EXECUTABLE)

checkdirectory: 
	@mkdir -p $(OUTPUT_DIR)

$(EXECUTABLE): generated.cpp $(OBJECTS)
	$(CC) $(OBJECTS) $(LDFLAGS) -o $(OUTPUT_DIR)/$@

generated.cpp: $(JAVASCRIPT_SOURCES)
	python tools/scripts/js2string.py $(OUTPUT_DIR)/generated.cpp $(JAVASCRIPT_SOURCES)

.cpp.o:
	@mkdir -p $(dir $(OUTPUT_DIR)/$@)
	$(CC) $(CFLAGS) $< -o $(OUTPUT_DIR)/$@

clean:
	rm -rf $(OUTPUT_DIR)/*.o $(OUTPUT_DIR)/generated.cpp jsm
