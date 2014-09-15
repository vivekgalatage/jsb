function Console() {

}

Console.prototype = {
    LOG: 1,
    WARN: 2,
    ERROR:3,
    log: function(message) {
        print(this.LOG, message);
    },

    warn: function(message) {
        print(this.WARN, message);
    },

    error: function(message) {
        print(this.ERROR, message);
    }
}
console = new Console;


// This projects Point object is a C++ object!!!!
var pt = new Point(6, 1);

pt.mul(2);

console.log("Hurray! Success!");
console.error("Something went wrong");
console.warn("You might be on a cliphanger! watch out");
