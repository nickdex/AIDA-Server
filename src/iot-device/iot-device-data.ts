import { IDeviceGroup } from './device-group';

import { iotDevicesData } from '../database/data';

import { logger } from '../logger';
import { Utility } from '../utility';
import { IIotDevice } from './iot-device-model';

export namespace IotDeviceData {
  export const getDevices = async (
    userGroup: string
  ): Promise<IIotDevice[]> => {
    return (await getDeviceGroup(userGroup)).devices;
  };

  export const getDeviceGroup = async (userGroup: string) => {
    const deviceGroups = await getAllDeviceGroups();
    logger.verbose('Fetched all the devices', deviceGroups);

    const deviceGroup = deviceGroups.find(g =>
      Utility.equalsIgnoreCase(g.group, userGroup)
    );

    if (!deviceGroup) {
      const message = 'No devices for the requested group. Please add one';
      logger.info(message, { userGroup });

      throw new Error(message);
    }

    return deviceGroup;
  };

  const getAllDeviceGroups = async (): Promise<IDeviceGroup[]> => {
    return Promise.resolve(iotDevicesData);
  };

  export const updateDevices = async (devices, userGroup) => {
    iotDevicesData.find(d => d.group === userGroup).devices = devices;

    logger.debug('Devices persisted successfully', {
      devices,
      userGroup
    });

    return Promise.resolve(devices);
  };
}
