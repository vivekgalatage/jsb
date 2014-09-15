CC := g++
CFLAGS := -c -Wall -Ithird-party/v8 -std=c++11
LDFLAGS := -lv8 -Lthird-party/v8/out/native/lib.target

OUTPUT_DIR := out
OUTPUT_GENERATED_DIR := $(OUTPUT_DIR)/gen

SOURCES := \
	src/main.cpp \
	$(OUTPUT_GENERATED_DIR)/generated.cpp

JAVASCRIPT_SOURCES := \
	src/js/console.js \
	src/js/system.js

EXECUTABLE := jsm

OBJECTS=$(SOURCES:.cpp=.o)

all: CREATE_DIRECTORIES $(EXECUTABLE)

CREATE_DIRECTORIES:
	@mkdir -p $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_GENERATED_DIR)

$(EXECUTABLE): generated.cpp $(OBJECTS)
	@$(CC) $(shell find out/ -iname '*.o') $(LDFLAGS) -o $(OUTPUT_DIR)/$@
	@echo Link $(OUTPUT_DIR)/$@

generated.cpp: $(JAVASCRIPT_SOURCES)
	@echo 'Generating sources from scripts using python'
	@python tools/scripts/js2string.py $(OUTPUT_GENERATED_DIR)/generated.cpp $(JAVASCRIPT_SOURCES)

.cpp.o:
	@mkdir -p $(dir $(OUTPUT_DIR)/$@)
	@$(CC) $(CFLAGS) $< -o $(OUTPUT_DIR)/$(subst out/,,$@)
	@echo CXX $<

clean:
	rm -rf $(OUTPUT_DIR)/*.o $(OUTPUT_GENERATED_DIR)/generated.cpp jsm

distclean:
	@echo -n "Cleaning all the targets..."
	@rm -rf $(OUTPUT_DIR)
	@echo "Done"
