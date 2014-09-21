jsb.library('lib1', jsb.STATIC_LIBRARY, function() {});
jsb.library('lib2', jsb.STATIC_LIBRARY, ['lib1'], function() {});
