import optparse
import os
import re
import sys

def main():
    output_filename = sys.argv[1]
    input_filenames = sys.argv[2:]
    contents = []

    for input_filename in input_filenames:
        class_name, ext = os.path.splitext(os.path.basename(input_filename))
        with open(input_filename) as input_file:
            input_text = input_file.read()
            hex_values = ['0x{0:02x}'.format(ord(char)) for char in input_text]
            contents.append('const unsigned char kSourceOf%s[] = {\n    %s\n};\n\n' % (
                class_name, ', '.join(hex_values)))
    output = open(output_filename, "w")
    output.write("".join(contents))
    output.close()
                
if __name__ == '__main__':
    sys.exit(main())
