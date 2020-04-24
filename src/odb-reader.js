const bluetooth = require('node-bluetooth');
const pidFactory = require('./PIDFactory');

class ODBReader {
	constructor(enabledPids) {
		this.enabledPIDs = this.getPidObjects(enabledPids);
		this.device = new bluetooth.DeviceINQ();
		this.deviceFound = false;
		this.btDeviceConnection = null;
	}
	getPidObjects(pidArray) {
		let pidObjects = [];
        pidArray.forEach(pidName => {
			let pidObject = pidFactory.getPIDFromName(pidName);
			if (pidObject === null) {
				return;
			}
			pidObjects.push(pidObject);
		 });
		 return pidObjects;
	}
	findBluetoothDevices() {
		let self = this;

		return new Promise((resolve, reject) => {		
			let bluetoothDevicesFound = [];	
			self.device.on('finished', function () {
				resolve(bluetoothDevicesFound);
			});
			self.device.on('found', function found(address, name) {
				console.log('Found: ' + address + ' with name ' + name);
				if (address == '00:00:00:33:33:33') {
					bluetoothDevicesFound.push(address + '|-|' + name);
				}
			});
			self.device.scan();
		});
	}
	connectToDevice(address) {
		let self = this;

		return new Promise((resolve, reject) => {
			self.device.findSerialPortChannel(address, (channel) => {
				bluetooth.connect(address, channel, (err, connection) => {
					if (err) return reject(err);

					self.btDeviceConnection = connection;
					resolve(connection);
				});
			});
		});
	}
	sendCommand(connection, command, responseIdentifier, responseParser) {
		// TODO: Need to remove the listener it isnt changing and is keeping the value constant of identifier
		console.log("!!!!ID = " + responseIdentifier);
		var ri = responseIdentifier;
		console.log('!!!!clean res zplit1 = ' + ri + ' ');
		return new Promise((resolve, reject) => {
			console.log('!!!!clean res zplit2 = ' + ri + ' ');
			let rez = '';
			connection.removeListener('data');
			connection.on('data', );
			connection.write(new Buffer(command + '\r\n', 'utf-8'), function (err, count) {
				if (err) {
					return reject(err);
				}
			});
		});
	}
	async start() {
		while (true) {
			for (let i = 0; i < this.enabledPIDs.length; i++) {
				let currentPID = this.enabledPIDs[i];
				console.log(currentPID.responseIdentifier);
				console.log('!!!!running with current identifier above on pid = ' + currentPID.name);
				let rez = await this.sendCommand(this.btDeviceConnection, currentPID.command, currentPID.responseIdentifier, currentPID.responseParser);
				
				console.log('** ' + currentPID.name + " = " + rez + '' + currentPID.units);
			}
		}
	}
}

module.exports = ODBReader;