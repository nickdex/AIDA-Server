import { Application, Params } from '@feathersjs/feathers';

import { logger } from '../logger';
import { IUser } from '../user/user-model';
import { Utility } from '../utility';
import { IDeviceGroup } from './device-group';
import { IIotDevice } from './iot-device-model';

import { iotDevicesData } from '../database/data';

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
    return Promise.resolve(iotDevicesData);
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
    // const result = await axios.post(deviceUrl, this.deviceGroups);
    // logger.debug('Devices persisted successfully', {
    //   status: result.status,
    //   statusText: result.statusText
    // });
    iotDevicesData[0] = this.deviceGroups[0];

    return Promise.resolve(null);
  }
}
