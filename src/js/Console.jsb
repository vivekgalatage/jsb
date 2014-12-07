function Console()
{
}

Console.prototype = {
    LOG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    log: function(message)
    {
        print(this.LOG, message);
    },

    info: function(message)
    {
        print(this.INFO, message);
    },

    warn: function(message)
    {
        print(this.WARN, message);
    },

    error: function(message)
    {
        print(this.ERROR, message);
    }
}

console = new Console();
