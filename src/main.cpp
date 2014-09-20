/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Vivek Galatage
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. 
 */

#include "generated.h"

#include <include/v8.h>
#include <iostream>
#include <fstream>
#include <string>

using namespace v8;
using namespace std;

Handle<ObjectTemplate> global_template;
Isolate *isolate;

#define ANSI_COLOR_RED     "\x1b[31m"
#define ANSI_COLOR_GREEN   "\x1b[32m"
#define ANSI_COLOR_YELLOW  "\x1b[33m"
#define ANSI_COLOR_BLUE    "\x1b[34m"
#define ANSI_COLOR_MAGENTA "\x1b[35m"
#define ANSI_COLOR_CYAN    "\x1b[36m"
#define ANSI_COLOR_RESET   "\x1b[0m"

v8::Handle<String> ReadFile(const char* name)
{
    //Open the file
    FILE* file;
    file = fopen(name, "rb");

    //If there is no file, return an empty string
    if (file == NULL) return v8::Handle<v8::String>();

    //Set the pointer to the end of the file
    fseek(file, 0, SEEK_END);

    //Get the size of file
    int size = ftell(file);

    //Rewind the pointer to the beginning of the stream
    rewind(file);

    //Set up and read into the buffer
    char* chars = new char[size + 1];
    chars[size] = '\0';
    for (int i = 0 ; i < size;)
    {
        int read = static_cast<int>(fread(&chars[i], 1, size - i, file));
        i += read;
    }

    //Close file
    fclose(file);

    v8::Handle<v8::String> result = v8::String::NewFromUtf8(isolate, chars, String::kNormalString, size);
    delete[] chars;
    return result;
}

void print(const v8::FunctionCallbackInfo<v8::Value>& args) {
    const char* color = nullptr;
    const char* resetColor = ANSI_COLOR_RESET;
    if (!args[0].IsEmpty() && args[0]->IsNumber()) {
        switch (args[0]->Int32Value()) {
        case 1:
            color = ANSI_COLOR_GREEN;
            break;
        case 2:
            color = ANSI_COLOR_YELLOW;
            break;
        case 3:
            color = ANSI_COLOR_RED;
            break;
        }
    }
    for (int i = 1; i < args.Length(); i++) {
        v8::HandleScope handle_scope(args.GetIsolate());
        v8::String::Utf8Value str(args[i]);
        string myStr = *(str);
        const char* cstr = myStr.c_str();
        if (color)
            printf("%s%s %s", color, cstr, resetColor);
        else
            printf("%s", cstr);
    }
    printf("\n");
}

void include(const v8::FunctionCallbackInfo<v8::Value>&args)
{

}

void compileAndExecuteScript(const Handle<v8::String>& scriptSource)
{
    Handle<Script> script = Script::Compile(scriptSource);
    Handle<Value> result;
    result = script->Run();
}

void setupGlobalEnvironment()
{
    for (size_t i = 0; i < sizeof(kJSMScriptSources)/sizeof(JSMScriptSources); ++i) {
        compileAndExecuteScript(v8::String::NewFromUtf8(isolate,
                                                        kJSMScriptSources[i].scriptSource,
                                                        v8::String::kNormalString,
                                                        kJSMScriptSources[i].scriptLength));
    }
}

int main(int argc, char* argv[])
{
    if (argc < 2) {
        //TODO: Print usage here
        printf("Print Usage\n");
        return 0;
    }
    isolate = Isolate::New();
    Isolate::Scope isolate_scope(isolate);
    HandleScope handle_scope(isolate);

    global_template = ObjectTemplate::New(isolate);

    Local<Context> context = Context::New(isolate, NULL, global_template);

    Context::Scope context_scope(context);

    Handle<v8::Object> global = context->Global();

    global->Set(v8::String::NewFromUtf8(isolate, "print"), v8::FunctionTemplate::New(isolate, print)->GetFunction());
    setupGlobalEnvironment();
    string file(argv[1]);

    Handle<String> source = ReadFile(file.c_str());

    if(source.IsEmpty())
    {
        cout << "Error reading file" << endl;
        cout << "Press enter to quit" << endl;
        cin.get();
        return 0;
    }

    //Compile
    Handle<Script> script = Script::Compile(source);

    //Run the script and print
    Handle<Value> result;

    result = script->Run();
    
    return 0;
}


