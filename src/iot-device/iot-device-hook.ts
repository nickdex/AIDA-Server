import { HookContext, HooksObject } from '@feathersjs/feathers';
import * as lodash from 'lodash';

import { Mqtt } from '../iot/mqtt';
import { logger } from '../logger';

import { IDeviceGroup } from '../device-group/device-group-model';
import { IIotDevice } from './iot-device-model';

export const iotDeviceHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext<IIotDevice>) {
      const data: IIotDevice = context.data;
      const params = context.params;

      // Patch, Create and Update methods
      if (data !== undefined) {
        const method = context.method;

        if (method === 'patch') {
          if (data.isOn === undefined) {
            const message = 'Device action is required';
            logger.warn(message, data, params.query);

            // No operation
            throw new Error(message);
          }

          return context;
        }

        const keys = ['name', 'pin'];
        if (
          lodash
            .chain(keys)
            .map(key => data[key])
            .some(lodash.isNil)
            .value()
        ) {
          const message = 'Creating device failed. Need pin and name';
          logger.warn(message, data);
          throw new Error(message);
        }
      }

      return context;
    },
    async patch(context: HookContext<IIotDevice>) {
      const data: IIotDevice = context.data;
      const params = context.params;

      if (data.isOn === undefined) {
        const message = 'Device action is required';
        logger.warn(message, data, params.query);

        // No operation
        context.result = data;

        return context;
      }

      try {
        await Mqtt.send({
          action: data.isOn ? 'on' : 'off',
          device: data.pin,
          sender: 'server'
        });
      } catch (err) {
        const message = 'Iot device could not complete request';
        logger.warn(message, err);
        throw new Error(message);
      }

      return context;
    },
    async create(context: HookContext<IIotDevice>) {
      const data = context.data;
      const params = context.params;
      const {
        roomId,
        deviceGroupId
      }: { roomId: string; deviceGroupId: string } = <any>params.query;

      // Default state when creating
      data.isOn = false;

      const deviceGroup: IDeviceGroup = await context.app
        .service('groups')
        .get(deviceGroupId);

      const room = lodash.find(deviceGroup.rooms, { _id: roomId });

      // #region Parameter checking
      if (room === undefined) {
        const message =
          'room does not exist. Please check room id or create new room';
        logger.warn(message, params.query);
        throw new Error(message);
      }

      const deviceId = lodash
        .join([deviceGroupId, roomId, data.name], '-')
        .toLowerCase();

      if (lodash.includes(room.deviceIds, deviceId)) {
        const message = 'Device already exists in the given room';
        logger.warn(message, { device: data, room: roomId });
        throw new Error(message);
      }
      // #endregion

      // Add Room and Group Reference
      data.roomId = roomId;
      data.groupId = deviceGroupId;
      // Add Device Reference
      room.deviceIds.push(deviceId);
      // For Updating group in after hook when successfully saved
      params.deviceGroup = deviceGroup;

      return context;
    }
  },
  after: {
    async create(context: HookContext<IIotDevice>) {
      const deviceGroup: IDeviceGroup = context.params.deviceGroup;

      await context.app.service('groups').patch(deviceGroup._id, deviceGroup);

      return context;
    }
  }
};
