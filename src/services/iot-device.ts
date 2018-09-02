import { Params } from '@feathersjs/feathers';
import axios from 'axios';

import { logger } from '../logger';
import { IIotDevice } from '../model/iot-device';

const deviceUrl = process.env.IOT_DEVICE_DATA_URL;

export class IotDeviceService {
  public async find(params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to fetch devices';
      logger.warn(message);
      throw new Error(message);
    }

    if (!devices[username]) {
      return [];
    }

    return devices[username];
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const devices = await this.getDevices();

    const username = params.query.username;

    if (!username) {
      const message = 'Need username to get devices';
      logger.warn(message);
      throw new Error(message);
    }

    const iotDevices: IIotDevice[] = devices[username];

    for (const iotDevice of iotDevices) {
      if (iotDevice.name === id && iotDevice.room === params.query.room) {
        return iotDevice;
      }
    }
    {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message);
      throw new Error(message);
    }
  }

  public async create(data: IIotDevice, params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to create devices';
      logger.warn(message);
      throw new Error(message);
    }

    if (!data.room || !data.name || !data.pin) {
      const message = 'Creating device failed. Need pin, name and room';
      logger.warn(message, {
        name: data.name,
        room: data.room,
        pin: data.pin
      });
      throw new Error(message);
    }

    if (!devices[username]) {
      devices[username] = [];
    }

    devices[username].push(data);

    await this.updateDevices(devices);

    return data;
  }

  public async update(id: string, data: IIotDevice, params: Params) {
    const devices = await this.getDevices();

    const username = params.query.username;

    if (!username) {
      const message = 'Need username to update devices';
      logger.warn(message);
      throw new Error(message);
    }

    const iotDevices: IIotDevice[] = devices[username];

    for (let index = 0; index < iotDevices.length; index += 1) {
      const iotDevice = iotDevices[index];
      if (iotDevice.name === id && iotDevice.room === data.room) {
        devices[username][index] = data;
        await this.updateDevices(devices);

        return data;
      }
    }
    {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, {
        name: id,
        room: params.query.room,
        pin: params.query.pin
      });
      throw new Error(message);
    }
  }

  public async remove(id: string, params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to remove devices';
      logger.warn(message);
      throw new Error(message);
    }

    const iotDevices: IIotDevice[] = devices[username];

    for (let index = 0; index < iotDevices.length; index += 1) {
      const iotDevice = iotDevices[index];
      if (iotDevice.name === id && iotDevice.room === params.query.room) {
        const removed = iotDevices.splice(index, 1)[0];

        devices[username] = iotDevices;

        await this.updateDevices(devices);

        return removed;
      }
    }
    {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, {
        name: id,
        room: params.query.room,
        pin: params.query.pin
      });
      throw new Error(message);
    }
  }

  private async getDevices() {
    const result = await axios.get(deviceUrl);

    return result.data;
  }

  private async updateDevices(devices: any) {
    return axios.post(deviceUrl, devices);
  }
}
