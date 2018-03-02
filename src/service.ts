import { Service } from '@feathersjs/feathers';
import { Device } from './model/device';
import { DevicePin } from './constants';

import nedbAdapter from 'feathers-nedb';

import * as nedb from 'nedb';

export class DeviceService {
  static Model = new nedb({
    filename: './data/devices.db',
    autoload: true
  });

  static service() {
    return nedbAdapter<Device>({ Model: this.Model });
  }

  static deviceService: Service<Device>;
  static initDb(service: Service<Device>) {
    this.deviceService = service;
    this.deviceService.get(DevicePin.FAN).then(
      item => console.log('Db already exists'),
      err => {
        console.error(`Error: ${err}`);
        this.deviceService.create([
          { _id: DevicePin.FAN, isOn: false, name: 'Fan' },
          {
            _id: DevicePin.LIGHTS,
            isOn: false,
            name: 'Room Lights'
          },
          {
            _id: DevicePin.OUTDOOR,
            isOn: false,
            name: 'Outdoor Lights'
          }
        ]);
      }
    );
  }
}
