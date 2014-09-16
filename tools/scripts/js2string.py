import optparse
import os
import re
import sys

def main():
    output_filename = sys.argv[1]
    input_filenames = sys.argv[2:]
    contents = []
    output_header, _ = os.path.splitext(os.path.basename(output_filename))
    contents.append('#ifndef %s_h\n' % output_header.title())
    contents.append('#define %s_h\n' % output_header.title())
    sources = []
    for input_filename in input_filenames:
        class_name, ext = os.path.splitext(os.path.basename(input_filename))
        with open(input_filename) as input_file:
            input_text = input_file.read()
            hex_values = ['0x{0:02x}'.format(ord(char)) for char in input_text]
            contents.append('const char kSourceOf%s[] = {\n    %s\n};\n\n' % (
                class_name.title(), ', '.join(hex_values)))
        sources.append({
                'scriptFile': os.path.basename(input_filename),
                'scriptSource': 'kSourceOf%s' % class_name.title(),
                'scriptLength': 'sizeof(kSourceOf%s)' %class_name.title()})
    contents.append("""
struct JSMScriptSources {
    const char* scriptFile;
    const char* scriptSource;
    int scriptLength;
};

struct JSMScriptSources kJSMScriptSources[] = {
""")

    for script in sources:
        contents.append('    { "%s", %s, %s },\n' % (script['scriptFile'], script['scriptSource'], script['scriptLength']))

    output = open(output_filename, "w")
    contents.append('};\n#endif // %s_h\n' % output_header.title())
    output.write("".join(contents))
    output.close()
                
if __name__ == '__main__':
    sys.exit(main())
