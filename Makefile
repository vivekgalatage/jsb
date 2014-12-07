CC ?= gcc
CXX ?= g++
OUTPUT_DIR := out
OUTPUT_GENERATED_DIR := $(OUTPUT_DIR)/gen

CFLAGS := -Wall -std=c++11
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

all: CREATE_DIRECTORIES submodule_check $(EXECUTABLE)

submodule_check:
	@echo "Verifying third-party dependencies..."
	@-test -d ./third-party/v8/out/native || \
		(echo "Unmet dependencies! Running 'make builddeps' first." && make build_third_party_libs)

submodule_update:
	@echo "Updating submodules..."
	@-test -d .git -a .gitmodules && \
		git submodule init -- && \
		git submodule update --

build_third_party_libs: submodule_update
	@echo "Building v8 dependencies..."
	@cd third-party/v8 && \
		make --silent builddeps && \
		make --silent native && cd -
	@echo "Copying files..."
	cp third-party/v8/out/native/obj.target/tools/gyp/libv8_base.a \
		third-party/v8/out/native/obj.target/tools/gyp/libv8_libbase.a \
		third-party/v8/out/native/obj.target/tools/gyp/libv8_libplatform.a \
		third-party/v8/out/native/obj.target/tools/gyp/libv8_snapshot.a \
		third-party/v8/out/native/obj.target/third_party/icu/libicui18n.a \
		third-party/v8/out/native/obj.target/third_party/icu/libicuuc.a \
		third-party/v8/out/native/obj.target/third_party/icu/libicudata.a \
		$(OUTPUT_DIR)

CREATE_DIRECTORIES:
	@mkdir -p $(OUTPUT_DIR)
	@mkdir -p $(OUTPUT_GENERATED_DIR)

$(EXECUTABLE): generated.h $(OBJECTS)
	@echo Linking $(OUTPUT_DIR)/$@
	@$(CXX) $(shell find out/ -iname '*.o') \
		out/libv8_base.a \
		out/libv8_libbase.a \
		out/libv8_libplatform.a \
		out/libv8_snapshot.a \
		out/libicui18n.a \
		out/libicuuc.a \
		out/libicudata.a \
		-o2 -lrt -pthread -o $(OUTPUT_DIR)/$@
	@strip out/jsb

generated.h: $(JAVASCRIPT_SOURCES)
	@echo 'Generating sources from scripts using python'
	@python tools/scripts/js2string.py $(OUTPUT_GENERATED_DIR)/generated.h $(JAVASCRIPT_SOURCES)

.cpp.o:
	@mkdir -p $(dir $(OUTPUT_DIR)/$@)
	@echo CXX $<
	@$(CXX) -c $(CFLAGS) $(foreach path,$(INCLUDE_PATHS),-I$(path)) $< -o $(OUTPUT_DIR)/$(subst out/,,$@)

clean:
	rm -rf $(OUTPUT_DIR)/*.o $(OUTPUT_GENERATED_DIR)/generated.cpp jsb

distclean:
	@echo -n "Cleaning all the targets..."
	@rm -rf $(OUTPUT_DIR)
	@echo "Done"

.PHONY: all sumodule_check clean distclean
