const PID = require('./PID');

class PIDFactory {
    static getPIDFromName(name) {
        switch (name.toLowerCase()) {
            case 'rpm':
                return new PID(name.toLowerCase(), '010C', 'rpm', '410C', function (response) {
                    let real_clean = response.split('410C')[1].split('>')[0];

                    return (parseInt(real_clean,16) / 4);
                });
            case 'fuel_pressure':
                return new PID(name.toLowerCase(), '010A', 'kPa', '410A', function (response) {
                    let real_clean = response.split('410A')[1].split('>')[0];

                    return (parseInt(real_clean,16) * 3);
                });
            case 'maf_air_flow':
                    return new PID(name.toLowerCase(), '0110', 'grams/sec', '4110', function (response) {
                        let real_clean = response.split('410A')[1].split('>')[0];
    
                        return (parseInt(real_clean,16) / 100);
                    });
        }
        return null;
    }
}

module.exports = PIDFactory;