const bluetooth = require('node-bluetooth');
const pidFactory = require('./PIDFactory');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

class ODBReader {
	constructor(enabledPids) {
		this.enabledPIDs = this.getPidObjects(enabledPids);
		this.device = new bluetooth.DeviceINQ();
		this.deviceFound = false;
		this.btDeviceConnection = null;
		this.dataBuffer = new Buffer(256);
		this.myEmitter = new MyEmitter();
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

					connection.on('data', buffer => {
						self.dataBuffer = Buffer.concat([self.dataBuffer, buffer]);
						let clean_buffer_string = self.dataBuffer.toString().replace(/(\r\n|\n|\r)/gm, "").replace(/\s/g, '');

						console.log(clean_buffer_string);
						

						if (clean_buffer_string.includes('NODATA')) {
							let initialPIDOld = clean_buffer_string.split('NODATA')[0];
							let initialPID = initialPIDOld.substring(initialPIDOld.length - 2);

							self.enabledPIDs.forEach(pid => {
								if (pid.responseIdentifier == initialPID.toString(16)) {
									self.myEmitter.emit(pid.responseIdentifier, 'NO DATA');
								}
							});

							self.dataBuffer = new Buffer(256);
						}
		
						if (this.dataBuffer.toString().includes('>') && this.dataBuffer.toString().includes('41')) {
							let clean_rez = this.dataBuffer.toString().replace(/\s+/g, '');
							let initialPID = clean_rez.split('41')[1].substring(0, 2);
							
							self.enabledPIDs.forEach(pid => {
								if (pid.responseIdentifier == initialPID.toString(16)) {
									let value = clean_rez.split('41' + pid.responseIdentifier)[1].split('>')[0];
									let cleanValue = pid.responseParser(value) + ' ' + pid.units;
									
									self.dataBuffer = new Buffer(256);
									self.myEmitter.emit(pid.responseIdentifier, cleanValue);
								}
							});
						}
					});
					
					resolve(connection);
				});
			});
		});
	}
	sendCommand(connection, command, responseIdentifier) {
		let self = this;

		return new Promise((resolve, reject) => {
			self.myEmitter.on(responseIdentifier, (data) => {
				self.myEmitter = new MyEmitter();
				resolve(data);
			});
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

				try {
					let rez = await this.sendCommand(this.btDeviceConnection, currentPID.command, currentPID.responseIdentifier);
					//let clean_rez = currentPID.responseParser(rez);
					console.log(`${currentPID.name}: ${rez}`);
				} catch(err) {
					console.log(err);
					return;
				}
			}
		}
	}
}

module.exports = ODBReader;