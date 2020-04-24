const PID = require('./PID');

class PIDFactory {
    static getPIDFromName(name) {
        switch (name.toLowerCase()) {
            case 'rpm':
                return new PID(name.toLowerCase(), '010C', 'rpm', '410C', function (response) {
                    return (parseInt(response, 16) / 4);
                });
            case 'fuel_pressure':
                return new PID(name.toLowerCase(), '010A', 'kPa', '410A', function (response) {
                    return (parseInt(response, 16) * 3);
                });
            case 'maf_air_flow':
                    return new PID(name.toLowerCase(), '0110', 'grams/sec', '4110', function (response) {
                        return (parseInt(response, 16) / 100);
                    });
            case 'coolant_temp':
                return new PID(name.toLowerCase(), '0105', 'C', '4105', function (response) {
                    return (parseInt(response, 16) - 40);
                });
        }
        return null;
    }
}

module.exports = PIDFactory;