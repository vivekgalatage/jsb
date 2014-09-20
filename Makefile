CC := g++
CFLAGS := -Wall -std=c++11
LDFLAGS := -lv8 -Lthird-party/v8/out/native/lib.target

OUTPUT_DIR := out
OUTPUT_GENERATED_DIR := $(OUTPUT_DIR)/gen

SOURCES := \
	src/main.cpp

INCLUDE_PATHS := \
	third-party/v8 \
	$(OUTPUT_GENERATED_DIR)

JAVASCRIPT_SOURCES := \
	src/js/Console.jsb \
	src/js/JSB.jsb

EXECUTABLE := jsb

OBJECTS=$(SOURCES:.cpp=.o)

all: CREATE_DIRECTORIES $(EXECUTABLE)

CREATE_DIRECTORIES:
	@mkdir -p $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_GENERATED_DIR)

$(EXECUTABLE): generated.h $(OBJECTS)
	@$(CC) $(shell find out/ -iname '*.o') $(LDFLAGS) -o $(OUTPUT_DIR)/$@
	@echo Link $(OUTPUT_DIR)/$@

generated.h: $(JAVASCRIPT_SOURCES)
	@echo 'Generating sources from scripts using python'
	@python tools/scripts/js2string.py $(OUTPUT_GENERATED_DIR)/generated.h $(JAVASCRIPT_SOURCES)

.cpp.o:
	@mkdir -p $(dir $(OUTPUT_DIR)/$@)
	$(CC) -c $(CFLAGS) $(foreach path,$(INCLUDE_PATHS),-I$(path)) $< -o $(OUTPUT_DIR)/$(subst out/,,$@)
	@echo CXX $<

clean:
	rm -rf $(OUTPUT_DIR)/*.o $(OUTPUT_GENERATED_DIR)/generated.cpp jsb

distclean:
	@echo -n "Cleaning all the targets..."
	@rm -rf $(OUTPUT_DIR)
	@echo "Done"
