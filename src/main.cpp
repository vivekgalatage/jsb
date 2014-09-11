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

#include <include/v8.h>
#include <include/libplatform/libplatform.h>

using namespace v8;

static void LogCallback(const v8::FunctionCallbackInfo<v8::Value>& args) {
  if (args.Length() < 1) return;
  HandleScope scope(args.GetIsolate());
  Handle<Value> arg = args[0];
  String::Utf8Value value(arg);
  static bool once = false;
  if (!once) {
      Local<String> source = String::NewFromUtf8(args.GetIsolate(), "var fromNative='Code added from c++ :)';");
      Local<Script> script = Script::Compile(source);
      Local<Value> result = script->Run();
      once != once;
  }
  printf("%s\n", *value);
}

int main(int argc, char* argv[]) {
  // Create a new Isolate and make it the current one.
  Isolate* isolate = Isolate::New();
  Isolate::Scope isolate_scope(isolate);

  // Create a stack-allocated handle scope.
  HandleScope handle_scope(isolate);

  Handle<ObjectTemplate> global = ObjectTemplate::New(isolate);
  global->Set(String::NewFromUtf8(isolate, "include"),
              FunctionTemplate::New(isolate, LogCallback));

  // Create a new context.
  Local<Context> context = Context::New(isolate, nullptr, global);

  // Enter the context for compiling and running the hello world script.
  Context::Scope context_scope(context);


  // Create a string containing the JavaScript source code.
  Local<String> source = String::NewFromUtf8(isolate, 
    "   (function f() { \
            include('hello world'); \
            return f; \
        })(); \
        include('sample'); \
        include(fromNative); \
    ");

  // Compile the source code.
  Local<Script> script = Script::Compile(source);
  printf("Size %d\n", script.IsEmpty());
  // Run the script to get the result.
  Local<Value> result = script->Run();

  if (result->IsFunction()) {
    printf("Got function\n");
  }

  // Convert the result to an UTF8 string and print it.
  String::Utf8Value utf8(result);
  printf("%s\n", *utf8);
  return 0;
}
