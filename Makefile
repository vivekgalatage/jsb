CC := cc
CXX := c++
OUTPUT_DIR := out
OUTPUT_GENERATED_DIR := $(OUTPUT_DIR)/gen

CC := g++
CFLAGS := -Wall -std=c++11
LDFLAGS := -lv8 -Lthird-party/v8/out/native/lib.target -Wl,-rpath,$(OUTPUT_DIR)


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

all: submodule_check CREATE_DIRECTORIES $(EXECUTABLE)

submodule_check:
	@echo "Verifying third-party dependencies..."
	@-test -f third-party/v8/out/native/lib.target/libv8.so || \
		echo "Unmet dependencies! Running 'make builddeps' first." && \
		make builddeps

builddeps: build_third_party_libs

submodule_update:
	@echo "Updating submodules..."
	@-test -d .git -a .gitmodules && \
		git submodule init -- && \
		git submodule update --depth 1 --

build_third_party_libs: submodule_update
	@echo "Building v8 dependencies..."
	@cd third-party/v8 && \
		make --silent builddeps && \
		make --silent native
	@echo "Copying files..."
	cp third-party/v8/out/native/lib.target/lib*.so $(OUTPUT_DIR)

CREATE_DIRECTORIES:
	@mkdir -p $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_GENERATED_DIR)

$(EXECUTABLE): generated.h $(OBJECTS)
	LD_LIBRARY_PATH=out/ $(CC) $(shell find out/ -iname '*.o') $(LDFLAGS) -o $(OUTPUT_DIR)/$@
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

.PHONY: all sumodule_check clean distclean
