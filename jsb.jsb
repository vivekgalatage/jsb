var CC = env.get('CC', 'gcc');
var CXX = env.get('CXX', 'g++');
var OUTPUT_DIR = env.get('OUTPUT_DIR', 'out');
var OUTPUT_GENERATED_DIR = OUTPUT_DIR + '/gen';

jsb.action('create_directories', function(action) {
    action.command = [
        'mkdir -p ' + OUTPUT_DIR,
        'mkdir -p ' + OUTPUT_GENERATED_DIR
    ];
});

jsb.action('generate_sources', [ 'create_directories' ], function(action) {
    var inputs = [
        'src/js/Console.js',
        'src/js/JSB.js'
    ];
    var output = OUTPUT_GENERATED_DIR + '/generated.h';
    action.command = 'python tools/scripts/js2string.py ' + output + ' ' + inputs.join(' ');
});

jsb.action('update_submodule', function(action) {
    action.command = [
        'git submodule init --',
        'git submodule update --'
    ];
});

jsb.action('build_v8_and_copy_libs', [ 'create_directories', 'update_submodule' ], function(action) {
    fs.cd('third-party/v8');
    action.command = [
        'make --silent builddeps',
        'make --silent native'
    ];
    // TODO(vivekg): The below copy should happen only after this action completes.
    // Probably using Promise would be the ideal solution.
    console.warn('\tCopying files');
    fs.cp([ 'third-party/v8/out/native/obj.target/tools/gyp/libv8_base.a',
            'third-party/v8/out/native/obj.target/tools/gyp/libv8_libbase.a',
            'third-party/v8/out/native/obj.target/tools/gyp/libv8_libplatform.a',
            'third-party/v8/out/native/obj.target/tools/gyp/libv8_snapshot.a',
            'third-party/v8/out/native/obj.target/third_party/icu/libicui18n.a',
            'third-party/v8/out/native/obj.target/third_party/icu/libicuuc.a',
            'third-party/v8/out/native/obj.target/third_party/icu/libicudata.a' ], OUTPUT_DIR);
});

jsb.executable('jsb', [ 'generate_sources', 'build_v8_and_copy_libs' ], function(exe) {
    exe.sources = [
        'src/main.cpp'
    ];

    exe.includePaths = [
        'third-party/v8',
        OUTPUT_GENERATED_DIR
    ];

    exe.cFlags = [
        '-Wall',
        '-std=c++11'
    ];

    exe.ldFlags = [
        '-lrt',
        '-pthread'
    ];

    exe.staticLibs = [
        'out/libv8_base.a',
        'out/libv8_libbase.a',
        'out/libv8_libplatform.a',
        'out/libv8_snapshot.a',
        'out/libicui18n.a',
        'out/libicuuc.a',
        'out/libicudata.a'
    ];

    exe.outputDir = OUTPUT_DIR;
});

jsb.build();