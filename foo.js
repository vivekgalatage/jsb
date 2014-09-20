jsb.library('lib1', jsb.TYPE_STATIC_LIBRARY, function() {});
jsb.library('lib2', jsb.TYPE_STATIC_LIBRARY, ['lib1'], function() {});
