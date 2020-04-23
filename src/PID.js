class PID {
    constructor (name, command, units, responseIdentifier, responseParser) {
        this.name = name;
        this.command = command;
        this.units = units;
        this.responseIdentifier = responseIdentifier;
        this.responseParser = responseParser;
    }
}

module.exports = PID;