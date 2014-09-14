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
#include <iostream>
#include <fstream>
#include <string>

using namespace v8;
using namespace std;

Handle<ObjectTemplate> global_template;
Isolate *isolate;
class Point;

Handle<String> ReadFile(const char* name);


class Point
{
public: 
    Point(){x_ = 0; y_ = 0;}
    Point(int x, int y) : x_(x), y_(y) {}
    int x_, y_;

    inline void mul( const double scale )
    {
        x_ *= scale;
        y_ *= scale;
    }
};

Point* UnwrapPoint( const FunctionCallbackInfo<v8::Value>& info ) 
{
        //Get the self object,
    Local<v8::Object> self = info.Holder();
        //Fetch the c++ pointer.
    Local<External> external = Local<External>::Cast( self->GetInternalField(0) );
        //Get back to the type.
    Point* pt = static_cast<Point*>( external->Value());
        //Return it
    return pt;
}

void GetPointX(Local<String> property,
                        const PropertyCallbackInfo<Value>& info)
{
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    int value = static_cast<Point*>(ptr)->x_;
    info.GetReturnValue().Set(Number::New(isolate, value));
}

void SetPointX(Local<String> property, 
               Local<Value> value,
               const PropertyCallbackInfo<Value>& info)
{
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    static_cast<Point*>(ptr)->x_ = value->Int32Value();
}

void GetPointY(Local<String> property,
                        const PropertyCallbackInfo<Value>& info)
{
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    int value = static_cast<Point*>(ptr)->y_;
    info.GetReturnValue().Set(Number::New(isolate, value));
}

void SetPointY(Local<String> property, 
               Local<Value> value,
               const PropertyCallbackInfo<Value>& info)
{
    Local<Object> self = info.Holder();
    Local<External> wrap = Local<External>::Cast(self->GetInternalField(0));
    void* ptr = wrap->Value();
    static_cast<Point*>(ptr)->y_ = value->Int32Value();
}

void MulCallback(const FunctionCallbackInfo<v8::Value>& args){
    int product = args.This()->Get(String::NewFromUtf8(isolate, "x"))->Int32Value() * args[0]->Int32Value();
    args.This()->Set(String::NewFromUtf8(isolate, "x"), Number::New(isolate, product));

    product = args.This()->Get(String::NewFromUtf8(isolate, "y"))->Int32Value() * args[0]->Int32Value();
    args.This()->Set(String::NewFromUtf8(isolate, "y"), Number::New(isolate, product));
}

// Defines a Point() JS Object
void PointConstructor( const FunctionCallbackInfo<v8::Value>& args )
{
    //Locker lock;
    HandleScope scope(isolate);
    Handle<ObjectTemplate> t = v8::ObjectTemplate::New();

    //The JavaScript point object only has 1 C++ object
    t->SetInternalFieldCount(1);

    // Create x and y members with starting values of 0
    //t->Set(String::New("x"), Number::New(0));
    t->SetAccessor(String::NewFromUtf8(isolate, "x"), 
        (AccessorGetterCallback)GetPointX,
        (AccessorSetterCallback)SetPointX);

    //t->Set(String::New("y"), Number::New(0));
    t->SetAccessor(String::NewFromUtf8(isolate, "y"),
        (AccessorGetterCallback)GetPointY,
        (AccessorSetterCallback)SetPointY);

    // Create a mul(number) function that scales the point
    t->Set(String::NewFromUtf8(isolate, "mul"), FunctionTemplate::New(isolate, MulCallback));

    // for use in the if statement
    Point *p = NULL;
    Local<Object> obj;
    
    // If Point(x, y) ctor was passed in values assign them
    if(!args[0].IsEmpty() && args[0]->IsNumber() &&
        !args[1].IsEmpty() && args[1]->IsNumber()) {
            //t->Set(String::New("x"), args[0]);
            //t->Set(String::New("y"), args[1]);
            p = new Point(args[0]->Int32Value(), args[1]->Int32Value());
            obj = t->NewInstance();
            obj->SetInternalField(0, External::New(isolate, p));         
    } else {
        /**
         * Wrap a point object
         */
        p = new Point(0, 0);
        obj = t->NewInstance();
        obj->SetInternalField(0, External::New(isolate, p));
    }

    // Return this newly created object
    args.GetReturnValue().Set(obj);
}

/*
* JS Function: print(string, ...)
* /a string value to be printed
*/
void Print(const v8::FunctionCallbackInfo<v8::Value>& args) {
    std::cout << "Print worked= ";
    
    for (int i = 0; i < args.Length(); i++) {
        v8::HandleScope handle_scope(args.GetIsolate());
        v8::String::Utf8Value str(args[i]);
        string myStr = *(str);
        const char* cstr = myStr.c_str();
        printf("%s", cstr);
    }
    printf("\n", NULL);
}

int main()
{
    //Create the v8 environment
    /*Isolate**/ isolate = Isolate::New();
    Isolate::Scope isolate_scope(isolate);
    HandleScope handle_scope(isolate);

    /*Handle<ObjectTemplate>*/ global_template = ObjectTemplate::New(isolate);

    Handle<FunctionTemplate> obj = FunctionTemplate::New(isolate);
    obj->Set(String::NewFromUtf8(isolate, "Point"), FunctionTemplate::New(isolate, PointConstructor));

    // Tell global A JS Obj Point() can now be create and instructions on how to set up
    global_template->Set(String::NewFromUtf8(isolate, "Point"), FunctionTemplate::New(isolate, PointConstructor));

    Local<Context> context = Context::New(isolate, NULL, global_template);

    Context::Scope context_scope(context);

    Handle<v8::Object> global = context->Global();

    //global->Set(String::New("Point"), t);
    global->Set(v8::String::NewFromUtf8(isolate, "print"), v8::FunctionTemplate::New(isolate, Print)->GetFunction());

    string file = "foo.js";

    while(true){
        cout << "How many times do you want to run the script? \n" << endl;

        int n; 

        cin >> n;

        cout << "" << endl;

        std::cin.get();

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

    } // End of while

    //Exit program
    cout << "\nTest completed.  Press enter to exit program. \n" << endl;
    std::cin.get();
    
    return 0;
}

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
