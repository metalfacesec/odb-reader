const bluetooth = require('node-bluetooth');

class ODBReader {
	constructor() {
		this.device = new bluetooth.DeviceINQ();
	}
	findDevice() {
		return new Promise(function (resolve, reject) {
			this.device.on('finished', function () {
				return resolve(null);
			});
			this.device.on('found', function found(address, name) {
				console.log('Found: ' + address + ' with name ' + name);
				if (address == '00:00:00:33:33:33') {
					device.findSerialPortChannel(address, function(channel) {
						bluetooth.connect(address, channel, function(err, connection) {
							if (err) return reject(err);
							resolve(connection);
						});
					});
				}
			});
			device.scan();
		});
	}
	sendCommand(connection, command) {
		return new Promise(function (resolve, reject) {
			connection.write(new Buffer(command + '\r\n', 'utf-8'), function (err, count) {
				if (err) return reject(err);
				resolve();
			});
		});
	}
}

module.exports = ODBReader;