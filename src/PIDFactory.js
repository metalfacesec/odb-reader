const PID = require('./PID');

class PIDFactory {
    static getPIDFromName(name) {
        switch (name.toLowerCase()) {
            case 'supported_pids':
                return new PID(name.toLowerCase(), '0100', '', '00', function (response) {
                    return Math.floor(parseInt(response, 16));
                })
            case 'rpm':
                return new PID(name.toLowerCase(), '010C', 'rpm', '0C', function (response) {
                    return Math.floor(parseInt(response, 16) / 4);
                });
            case 'fuel_pressure':
                return new PID(name.toLowerCase(), '010A', 'kPa', '0A', function (response) {
                    return Math.floor(parseInt(response, 16) * 3);
                });
            case 'maf_air_flow':
                    return new PID(name.toLowerCase(), '0110', 'grams/sec', '10', function (response) {
                        return Math.floor(parseInt(response, 16) / 100);
                    });
            case 'coolant_temp':
                return new PID(name.toLowerCase(), '0105', 'C', '05', function (response) {
                    return Math.floor(parseInt(response, 16) - 40);
                });
            case 'engine_oil_temp':
                return new PID(name.toLowerCase(), '015C', 'C', '5C', function (response) {
                    return Math.floor(parseInt(response, 16) - 40);
                })
            case 'engine_coolant_temp':
                    return new PID(name.toLowerCase(), '0167', 'C', '67', function (response) {
                        return Math.floor(parseInt(response, 16));
                    })
        }
        return null;
    }
}

module.exports = PIDFactory;