function JSB() {
    this.os = new OS();
    this._artifacts = {};
}

JSB.prototype = {
    EXECUTABLE: 1,
    SHARED_LIBRARY: 2,
    STATIC_LIBRARY: 3,
    ACTION: 4,
    CONFIG: 5,
    SOURCE_LIST: 6,

    library: function(name, type, depsList, libraryDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, type, depsList, libraryDefinition));
    },

    executable: function(name, depsList, executableDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, this.TYPE_EXECUTABLE, depsList, libraryDefinition));
    },

    action: function(name, depsList, actionDefinition) {
        this._declareArtifact(this._toArgumentsObject(name, this.TYPE_ACTION, depsList, libraryDefinition));
    },

    build: function() {
        for (var name in this._artifacts) {
            var artifact = this._artifacts[name];
            if (artifact.definition instanceof Function) {
                var artifcatObject = null;
                switch (artifact.type) {
                case this.STATIC_LIBRARY:
                    artifcatObject = {};
                    break;
                }
                artifact.definition(artifcatObject);
                if (!artifcatObject.outputName) {
                    console.error('Library ' + name + ' must specify outputName');
                    throw "Invalid configuration error";
                }
            }
        }
    },

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

    _declareArtifact: function(artifact) {
        this._artifacts[artifact.name] = artifact;
    },
};

function OS() {
    this._name = 'linux';
    this._arch = 'x86_64';
}

OS.prototype = {
    get name() {
        return this._name;
    },

    get arch() {
        return this._arch;
    }
};

jsb = new JSB();
