import { Application } from '@feathersjs/express';
import { Params, Service } from '@feathersjs/feathers';
import { log } from 'util';

import * as feathersNedb from 'feathers-nedb';

import { DevicePin } from './constants';
import { Device } from './model/device';

import * as nedb from 'nedb';

export namespace DeviceService {
  const model = new nedb({
    filename: './data/devices.db',
    autoload: true
  });
  let deviceService: Service<Device>;

  export async function patch(
    id: number,
    data: Partial<Device>,
    params?: Params
  ) {
    return deviceService.patch(id, data, params);
  }

  export async function find() {
    return <Device[]>await deviceService.find();
  }

  export function initDb(app: Application<object>) {
    app.use('devices', feathersNedb<Device>({ Model: model }));
    deviceService = app.service('devices');

    deviceService
      .create([
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
      ])
      .catch(err => log('Db already exists'));
  }
}
