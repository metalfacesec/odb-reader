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
	sendCommand(connection, command) {
		return new Promise((resolve, reject) => {
			let rez = '';
			connection.on('data', (buffer) => {
				rez += buffer.toString().trim();

				if (JSON.stringify(buffer.toString()).includes('\r\n') || rez.includes('>')) {
					let clean_rez = rez.replace(/\s+/g, '');

					// Call appropriate pid callback
					let real_clean = clean_rez.split('410C')[1].split('>')[0];

                    resolve((parseInt(real_clean,16) / 4));

					rez = '';
				}
			});
			connection.write(new Buffer(command + '\r\n', 'utf-8'), function (err, count) {
				if (err) {
					return reject(err);
				}
			});
		});
	}
	async start() {
		let self = this;
		while (true) {
			for (let i = 0; i < this.enabledPIDs.length; i++) {
				let rez = await self.sendCommand(command);
				// let command = '';
				// if (this.enabledPIDs[i] == 'rpm') {
				// 	command = '010C';
				// }
				// let rez = await self.sendCommand(connection, command);
				// console.log(rez);
			}
		}
	}
}

module.exports = ODBReader;