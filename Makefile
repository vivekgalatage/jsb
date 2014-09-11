CC      = g++
RM      = rm -f
input 	:= src/main.cpp

default: all

all: jsm

main.o: 
	$(CC) $(CFLAGS) -c src/main.cpp -Ithird-party/v8 -std=c++11

jsm: main.o
	$(CC) $(CFLAGSC) main.o -o jsm -lv8 -Lthird-party/v8/out/native/lib.target 

clean veryclean:
	$(RM) *.o jsm
