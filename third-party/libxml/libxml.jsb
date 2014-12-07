jsb.staticLibrary('libxml', function(libxml) {
    var osInclude = '';
    switch (os.name) {
    case 'linux':
    case 'mac':
    case 'win':
        osInclude = os.name;
        break;
    default:
        console.warn('libxml: Unsupported OS "' + os.name + '" specified.');
        return;
    }

    if (os.name === 'win')
        osInclude = osInclude + '32';

    libxml.name = 'libxml2';
    libxml.cflags = [ '-MMD', '-MF' ];
    libxml.ldflags = [ '-pthread' ];
    libxml.includePaths = [
        'src/include',
        osInclude,
        osInclude + '/include'
    ];
    libxml.sources = [
        'chromium/libxml_utils.cc',
        'chromium/libxml_utils.h',
        'linux/config.h',
        'linux/include/libxml/xmlversion.h',
        'mac/config.h',
        'mac/include/libxml/xmlversion.h',
        'src/acconfig.h',
        'src/c14n.c',
        'src/catalog.c',
        'src/chvalid.c',
        'src/debugXML.c',
        'src/dict.c',
        'src/DOCBparser.c',
        'src/elfgcchack.h',
        'src/encoding.c',
        'src/entities.c',
        'src/error.c',
        'src/globals.c',
        'src/hash.c',
        'src/HTMLparser.c',
        'src/HTMLtree.c',
        'src/include/libxml/c14n.h',
        'src/include/libxml/catalog.h',
        'src/include/libxml/chvalid.h',
        'src/include/libxml/debugXML.h',
        'src/include/libxml/dict.h',
        'src/include/libxml/DOCBparser.h',
        'src/include/libxml/encoding.h',
        'src/include/libxml/entities.h',
        'src/include/libxml/globals.h',
        'src/include/libxml/hash.h',
        'src/include/libxml/HTMLparser.h',
        'src/include/libxml/HTMLtree.h',
        'src/include/libxml/list.h',
        'src/include/libxml/nanoftp.h',
        'src/include/libxml/nanohttp.h',
        'src/include/libxml/parser.h',
        'src/include/libxml/parserInternals.h',
        'src/include/libxml/pattern.h',
        'src/include/libxml/relaxng.h',
        'src/include/libxml/SAX.h',
        'src/include/libxml/SAX2.h',
        'src/include/libxml/schemasInternals.h',
        'src/include/libxml/schematron.h',
        'src/include/libxml/threads.h',
        'src/include/libxml/tree.h',
        'src/include/libxml/uri.h',
        'src/include/libxml/valid.h',
        'src/include/libxml/xinclude.h',
        'src/include/libxml/xlink.h',
        'src/include/libxml/xmlautomata.h',
        'src/include/libxml/xmlerror.h',
        'src/include/libxml/xmlexports.h',
        'src/include/libxml/xmlIO.h',
        'src/include/libxml/xmlmemory.h',
        'src/include/libxml/xmlmodule.h',
        'src/include/libxml/xmlreader.h',
        'src/include/libxml/xmlregexp.h',
        'src/include/libxml/xmlsave.h',
        'src/include/libxml/xmlschemas.h',
        'src/include/libxml/xmlschemastypes.h',
        'src/include/libxml/xmlstring.h',
        'src/include/libxml/xmlunicode.h',
        'src/include/libxml/xmlwriter.h',
        'src/include/libxml/xpath.h',
        'src/include/libxml/xpathInternals.h',
        'src/include/libxml/xpointer.h',
        'src/include/win32config.h',
        'src/include/wsockcompat.h',
        'src/legacy.c',
        'src/libxml.h',
        'src/list.c',
        'src/nanoftp.c',
        'src/nanohttp.c',
        'src/parser.c',
        'src/parserInternals.c',
        'src/pattern.c',
        'src/relaxng.c',
        'src/SAX.c',
        'src/SAX2.c',
        'src/schematron.c',
        'src/threads.c',
        'src/tree.c',
        // 'src/trio.c',
        // 'src/trio.h',
        // 'src/triodef.h',
        // 'src/trionan.c',
        // 'src/trionan.h',
        // 'src/triop.h',
        // 'src/triostr.c',
        // 'src/triostr.h',
        'src/uri.c',
        'src/valid.c',
        'src/xinclude.c',
        'src/xlink.c',
        'src/xmlIO.c',
        'src/xmlmemory.c',
        'src/xmlmodule.c',
        'src/xmlreader.c',
        'src/xmlregexp.c',
        'src/xmlsave.c',
        'src/xmlschemas.c',
        'src/xmlschemastypes.c',
        'src/xmlstring.c',
        'src/xmlunicode.c',
        'src/xmlwriter.c',
        'src/xpath.c',
        'src/xpointer.c',
        'win32/config.h',
        'win32/include/libxml/xmlversion.h',
    ];

    console.log('echo "Building: ' + libxml.name + '"');
    var command = '';
    var expandedIncludePath = '-I' + libxml.includePaths.join(' -I')
    var expandedCFlags = libxml.cflags.join(' ');
    var cFilter = /^.*\.(c){1}$/;
    var cppFilter = /^.*\.(cc|cpp|C|CPP){1}$/;
    var objectFiles = [];
    for (var i = 0; i < libxml.sources.length; ++i) {
        var source = libxml.sources[i];
        var objectFile = source.replace(/(c|cc|C|CPP){1}$/g, 'o');
        if (cFilter.test(source))
            command = 'cc';
        else if (cppFilter.test(source))
            command = 'c++';
        else
            continue;
        command += ' ' + expandedCFlags + ' ' + objectFile + '.d';
        command += ' ' + expandedIncludePath;
        command += ' ' + libxml.ldflags.join(' ');
        command += ' -c ' + source;

        objectFiles.push(objectFile);
        command += ' -o ' + objectFile;
        console.log(command);
    }
    var archiveCommand = 'ar rcsT';
    archiveCommand += ' ' + libxml.name + '.a';
    archiveCommand += ' ' + objectFiles.join(' ');
    console.log(archiveCommand);
    console.log('echo "All Done"');

});

jsb.build();