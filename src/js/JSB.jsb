function JSB()
{
    this._artifacts = {};
}

JSB.prototype = {
    EXECUTABLE: 1,
    SHARED_LIBRARY: 2,
    STATIC_LIBRARY: 3,
    ACTION: 4,
    CONFIG: 5,
    SOURCE_LIST: 6,

    var: function(name, value)
    {
        jsb[name] = value;
    },

    action: function(name, depsList, definition)
    {
        this._define(this.ACTION, name, depsList, definition);
    },

    executable: function(name, depsList, definition)
    {
        this._define(this.EXECUTABLE, name, depsList, definition);
    },

    staticLibrary: function(name, depsList, definition)
    {
        this._define(this.STATIC_LIBRARY, name, depsList, definition);
    },

    sharedLibrary: function(name, depsList, definition)
    {
        this._define(this.SHARED_LIBRARY, name, depsList, definition);
    },

    build: function()
    {
        for (var name in this._artifacts) {
            var artifact = this._artifacts[name];
            if (artifact.definition instanceof Function) {
                switch (artifact.type) {
                case this.ACTION:
                    this._handleAction(artifact, name);
                    break;
                case this.EXECUTABLE:
                    this._handleExecutable(artifact, name);
                    break;
                case this.STATIC_LIBRARY:
                    this._handleStaticLibrary(artifact, name);
                    break;
                }
            }
        }
    },

    _define: function(type, name, depsList, definition)
    {
        this._artifacts[name] = this._toArgumentsObject(type, depsList, definition);
    },

    _handleAction: function(artifact, name)
    {
        artifactType = 'Action';
        if (name)
            console.log('Executing action: ' + name);

        artifactObject = { name: name };
        if (artifact.definition)
            artifact.definition(artifactObject);
        else
            artifactObject.command = artifact;

        if (typeof artifactObject.command !== 'string' && !(artifactObject.command instanceof Array)) {
            console.error('Action \'' + name + '\' must specify \'command\' attribute either as \'string\' or \'array\'.');
            throw 'Invalid configuration error';
        }

        if (typeof artifactObject.command === 'string') {
            console.log('\tExecute action: ' + artifactObject.command);
        } else {
            var commands = artifactObject.command;
            for (var i = 0; i < commands.length; ++i) {
                this._handleAction(commands[i], commands[i].name);
            }
        }
        if (name)
            fs.cd(fs.lwd);
    },

    _handleExecutable: function(artifact, name)
    {
        artifactType = 'Executable';
        console.log('Building executable: ' + name);
        artifactObject = { name: name };
        artifact.definition(artifactObject);
        if (!artifactObject.name) {
            console.error(artifactType + ' \'' + name + '\' must specify \'name\' attribute.');
            throw 'Invalid configuration error';
        }
    },

    _handleStaticLibrary: function(artifact, name)
    {
        var artifactType = '';
        var artifactObject = null;
        artifactType = 'Static-Library';
        console.log('Building static library: ' + name);
        artifactObject = { name: name };
        artifact.definition(artifactObject);
        if (!artifactObject.name) {
            console.error(artifactType + ' \'' + name + '\' must specify \'name\' attribute.');
            throw 'Invalid configuration error';
        }
    },

    _isString: function(str)
    {
        return typeof str === 'string' || str instanceof String;
    },

    _isNumber: function(num)
    {
        return typeof num === 'number' || num instanceof Number;
    },

    _toArgumentsObject: function (type, depsList, definition)
    {
        if (arguments.length < 3)
            throw 'Requires minimum 3 arguments, ' + arguments.length + ' passed.';

        if (!this._isNumber(type))
            throw 'Invaild type passed for \'type\'';

        var deps = null;
        if (depsList instanceof Function) {
            definition = depsList;
            delete depsList;
            deps = [];
        } else if (depsList instanceof Array) {
            deps = depsList;
        } else {
            throw depsList + ' must be either Array or Function';
        }

        definition = definition;
        return {
            type: type,
            depsList: deps,
            definition: definition
        };
    },
};

// TOOD(vivekg): Auto-generate this class
function OS()
{
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

// TOOD(vivekg): Auto-generate this class
function Environment()
{
    this._vars = {};

    this._vars['PATH'] = 'some/path/here:and/there';
    this._vars['DISPLAY'] = ':0';
    this._vars['HOME'] = '/home/vivekg';
    this._vars['CXX'] = 'clang++';
    this._vars['CC'] = 'clang';
}

Environment.prototype = {
    get: function(key, defaultValue)
    {
        if (key in this._vars)
            return this._vars[key];
        return defaultValue;
    }
};

function FileSystem()
{
    this._pwd = '.';
    this._lwd = this._pwd;
}

FileSystem.prototype = {
    get pwd()
    {
        return this._pwd;
    },

    get lwd()
    {
        return this._lwd;
    },

    cd: function(dir)
    {
        this._lwd = this._pwd;
        this._pwd = dir;
    },

    cp: function(source, destination)
    {
        if (source instanceof Array)
            source = source.join(' ');
        console.warn('\tcp ' + source + ' ' + destination);
    }

};

jsb = new JSB();
os = new OS();
env = new Environment();
fs = new FileSystem();
