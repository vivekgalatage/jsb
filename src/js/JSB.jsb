function JSB() {
    this._artifacts = {};
}

JSB.prototype = {
    TYPE_EXECUTABLE: 1,
    TYPE_SHARED_LIBRARY: 2,
    TYPE_STATIC_LIBRARY: 3,
    TYPE_ACTION: 4,
    TYPE_CONFIG: 5,
    TYPE_SOURCE_LIST: 6,

    _isString: function(str) {
        return typeof str === 'string' || str instanceof String; 
    },

    _isNumber: function(num) {
        return typeof num === 'number' || num instanceof Number; 
    },

    _toArgumentsObject: function (name, type, depsList, definition) {
        if (arguments.length <= 3) 
            throw 'Requires minimum 3 arguments, ' + arguments.length + ' passed.';
        if (!this._isString(name))
            throw 'Invalid type passed for "name"';

        if (!this._isNumber(type))
            throw 'Invaild type passed for "type"';

        var deps = null;
        if (depsList instanceof Array) {
            deps = depsList;
        } else if (depsList instanceof Function) {
            definition = depsList;
            delete depsList;
            deps = [];
        } else {
            throw "Unknow parameters";
        }

        definition = definition;
        return {
            name: name,
            type: type,
            depsList: deps,
            definition: definition
        };
    },

    library: function(name, type, depsList, libraryDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, type, depsList, libraryDefinition));
    },

    executable: function(name, depsList, executableDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, this.TYPE_EXECUTABLE, depsList, libraryDefinition));
    },

    action: function(name, depsList, actionDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, this.TYPE_ACTION, depsList, libraryDefinition));
    },

    _declareArtifact: function(artifact) {
        console.log(artifact.name);
        console.log(artifact.type);
        console.log(artifact.depsList.join(", "));
        console.log(artifact.definition);
        console.warn('........');
    }
};

jsb = new JSB();
