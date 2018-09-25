import {
  Application,
  HookContext,
  HooksObject,
  Params
} from '@feathersjs/feathers';
import axios from 'axios';

import { Mqtt } from '../iot/mqtt';
import { logger } from '../logger';
import { IDeviceGroup } from '../model/device-group';
import { IIotDevice } from '../model/iot-device';
import { IUser } from '../model/user';
import { Utility } from '../utility';

const deviceUrl = process.env.IOT_DEVICE_DATA_URL;

export const iotDeviceHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext) {
      const username = context.params.query.username;
      if (!username) {
        const message = 'Username not available';
        logger.warn(message, { username });

        throw new Error(message);
      }
    },
    async patch(context: HookContext) {
      const data: IIotDevice = context.data;

      if (data.isOn == null) {
        const message = 'Device action is not defined';
        logger.warn(message, data, context.params.query);
        throw new Error(message);
      }
      if (!data.pin) {
        const message = 'Device pin is not defined';
        logger.warn(message, data, context.params.query);
        throw new Error(message);
      }
      if (!context.params.query.room) {
        const message = 'Device room is not defined';
        logger.warn(message, data, context.params.query);
        throw new Error(message);
      }

      const result = await Mqtt.send({
        action: data.isOn ? 'on' : 'off',
        device: data.pin,
        sender: 'server'
      });
      logger.debug('Iot device response', { result });

      // Only if mqtt action was successful, save the state
      if (result !== 'done') {
        const message = 'Failed to receive ack from iot device';
        logger.warn(message, { result });
        throw new Error(message);
      }

      return context;
    },
    create(context: HookContext) {
      const data = context.data;

      if (!data.room || !data.name || !data.pin) {
        const message = 'Creating device failed. Need pin, name and room';
        logger.warn(message, data);
        throw new Error(message);
      }

      // Default state when creating
      context.data.isOn = false;
    }
  }
};

export class IotDeviceService {
  private app: Application;
  private deviceGroups: IDeviceGroup[];

  public async find(params: Params) {
    return this.getDevices(params.query.username);
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const iotDevices = await this.getDevices(params.query.username);

    // Get new object by search
    const iotDevice = iotDevices.filter(
      d =>
        Utility.equalsIgnoreCase(d.name, id) &&
        Utility.equalsIgnoreCase(d.room, params.query.room)
    )[0];

    if (!iotDevice) {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, { id }, params.query);
      throw new Error(message);
    }

    return iotDevice;
  }

  public async create(data: IIotDevice, params: Params) {
    const devices = await this.getDevices(params.query.username);

    devices.push(data);

    this.updateDevices();

    return data;
  }

  public async patch(id: string, data: Partial<IIotDevice>, params: Params) {
    logger.verbose('Request for device action', { id }, data, params.query);
    const iotDevices = await this.getDevices(params.query.username);

    const iotDevice = iotDevices.find(
      d =>
        Utility.equalsIgnoreCase(d.name, id) &&
        Utility.equalsIgnoreCase(d.room, params.query.room)
    );
    iotDevice.isOn = data.isOn;

    this.updateDevices();

    return iotDevice;

    const message = 'Iot Device not found. Please check name and room again';
    logger.warn(message, { id }, params.query, data);
    throw new Error(message);
  }

  public async update(id: string, data: IIotDevice, params: Params) {
    const iotDevices = await this.getDevices(params.query.username);

    const iotDevice = iotDevices.find(
      d =>
        Utility.equalsIgnoreCase(d.name, id) &&
        Utility.equalsIgnoreCase(d.room, data.room)
    );

    if (!iotDevice) {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, { id }, params.query);
      throw new Error(message);
    }

    // Don't update state (isOn) of device
    iotDevice.name = data.name;
    iotDevice.pin = data.pin;
    iotDevice.room = data.room;

    this.updateDevices();

    return iotDevice;
  }

  public async remove(id: string, params: Params) {
    const iotDevices = await this.getDevices(params.query.username);

    const iotDeviceIndex = iotDevices.findIndex(
      d =>
        Utility.equalsIgnoreCase(d.name, id) &&
        Utility.equalsIgnoreCase(d.room, params.query.room)
    );

    if (iotDeviceIndex === -1) {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, { id }, params.query);
      throw new Error(message);
    }

    const removed = iotDevices.splice(iotDeviceIndex, 1)[0];

    this.updateDevices();

    return removed;
  }

  public setup(app: Application, path: string): void {
    this.app = app;
  }

  private async getDevices(username: string): Promise<IIotDevice[]> {
    const userGroup = await this.getUserGroup(username);
    logger.verbose(`Fetched user's group`, { userGroup });

    this.deviceGroups = await this.getDeviceGroups();
    logger.verbose('Fetched all the devices', this.deviceGroups);

    const deviceGroup = this.deviceGroups.find(g =>
      Utility.equalsIgnoreCase(g.group, userGroup)
    );

    if (!deviceGroup) {
      const message = 'No devices for the requested group. Please add one';
      logger.info(message, { username }, { userGroup });

      throw new Error(message);
    }

    return deviceGroup.devices;
  }

  private async getDeviceGroups(): Promise<IDeviceGroup[]> {
    const result = await axios.get(deviceUrl);

    return result.data;
  }

  private async getUserGroup(username: string): Promise<string> {
    const user: IUser = await this.app.service('users').get(username);

    if (!user) {
      const message = 'User does not exist';
      logger.warn(message, { username });

      throw new Error(message);
    }
    if (!user.group) {
      const message = 'User does not belong to any group';
      logger.warn(message, { username });

      throw new Error(message);
    }

    return user.group;
  }

  private async updateDevices() {
    const result = await axios.post(deviceUrl, this.deviceGroups);
    logger.debug('Devices persisted successfully', {
      status: result.status,
      statusText: result.statusText
    });

    return result;
  }
}
