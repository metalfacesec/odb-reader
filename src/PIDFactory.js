const PID = require('./PID');

class PIDFactory {
    static getPIDFromName(name) {
        switch (name.toLowerCase()) {
            case 'rpm':
                return new PID('rpm', '010C\r\n', function (response) {
                    console.log(response);
                });
        }
    }
}