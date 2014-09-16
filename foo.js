jsm.library('lib1', jsm.TYPE_STATIC_LIBRARY, function() {});
jsm.library('lib2', jsm.TYPE_STATIC_LIBRARY, ['lib1'], function() {});
