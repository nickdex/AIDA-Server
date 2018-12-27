import { Params } from '@feathersjs/feathers';

import { logger } from '../logger';
import { Utility } from '../utility';
import { IotDeviceData } from './iot-device-data';
import { IIotDevice } from './iot-device-model';

export class IotDeviceService {
  public async find(params: Params) {
    return IotDeviceData.getDevices(params.group);
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const iotDevices = await IotDeviceData.getDevices(params.group);

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
    const iotDevices = await IotDeviceData.getDevices(params.group);

    iotDevices.push(data);

    await IotDeviceData.updateDevices(iotDevices, params.group);

    return data;
  }

  public async patch(id: string, data: Partial<IIotDevice>, params: Params) {
    logger.verbose('Request for device action', { id }, data, params.query);
    const iotDevices = await IotDeviceData.getDevices(params.group);

    const iotDevice = iotDevices.find(
      d =>
        Utility.equalsIgnoreCase(d.name, id) &&
        Utility.equalsIgnoreCase(d.room, params.query.room)
    );

    if (!iotDevice) {
      const message = 'Iot Device not found. Please check name and room again';
      logger.warn(message, { id }, params, data);
      throw new Error(message);
    }

    iotDevice.isOn = data.isOn;

    await IotDeviceData.updateDevices(iotDevices, params.group);

    return iotDevice;
  }

  public async update(id: string, data: IIotDevice, params: Params) {
    const iotDevices = await IotDeviceData.getDevices(params.group);

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

    await IotDeviceData.updateDevices(iotDevices, params.group);

    return iotDevice;
  }

  public async remove(id: string, params: Params) {
    const iotDevices = await IotDeviceData.getDevices(params.group);

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

    await IotDeviceData.updateDevices(iotDevices, params.group);

    return removed;
  }
}
