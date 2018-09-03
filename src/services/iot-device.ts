import { HookContext, HooksObject, Params } from '@feathersjs/feathers';
import axios from 'axios';

import { Mqtt } from '../iot/mqtt';
import { logger } from '../logger';
import { IIotDevice } from '../model/iot-device';

const deviceUrl = process.env.IOT_DEVICE_DATA_URL;

export const iotDeviceHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext) {
      if (!context.params.query.username) {
        const message = 'Username not available';
        logger.warn(message, { username: context.params.query.username });

        throw new Error(message);
      }
    },
    async update(context: HookContext) {
      const data: IIotDevice = context.data;
      const result = await Mqtt.send({
        action: data.isOn ? 'on' : 'off',
        device: data.pin,
        sender: 'server'
      });
      logger.debug('Iot device response', result);

      // Only if mqtt action was successful, save the state
      if (result !== 'done') {
        const message = 'Failed to receive ack from iot device';
        logger.warn(message);
        throw new Error(message);
      }

      return context;
    },
    create(context: HookContext) {
      const data = context.data;

      if (!data.room || !data.name || !data.pin) {
        const message = 'Creating device failed. Need pin, name and room';
        logger.warn(message, {
          ...data
        });
        throw new Error(message);
      }

      // Default state when creating
      context.data.isOn = false;
    }
  }
};

export class IotDeviceService {
  public async find(params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;

    if (!devices[username]) {
      return [];
    }

    return devices[username];
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;
    const iotDevices: IIotDevice[] = devices[username];

    for (const iotDevice of iotDevices) {
      if (iotDevice.name === id && iotDevice.room === params.query.room) {
        return iotDevice;
      }
    }

    const message = 'Iot Device not found. Please check name and room again';
    logger.warn(message, { name: id, room: params.query.room, username });
    throw new Error(message);
  }

  public async create(data: IIotDevice, params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;

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
    const iotDevices: IIotDevice[] = devices[username];

    for (let index = 0; index < iotDevices.length; index += 1) {
      const iotDevice = iotDevices[index];
      if (iotDevice.name === id && iotDevice.room === data.room) {
        devices[username][index] = data;
        await this.updateDevices(devices);

        return data;
      }
    }

    const message = 'Iot Device not found. Please check name and room again';
    logger.warn(message, {
      name: id,
      ...params.query
    });
    throw new Error(message);
  }

  public async remove(id: string, params: Params) {
    const devices = await this.getDevices();
    const username = params.query.username;
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

    const message = 'Iot Device not found. Please check name and room again';
    logger.warn(message, {
      name: id,
      ...params
    });
    throw new Error(message);
  }

  private async getDevices() {
    const result = await axios.get(deviceUrl);

    return result.data;
  }

  private async updateDevices(devices: any) {
    return axios.post(deviceUrl, devices);
  }
}
