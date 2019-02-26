import { HookContext, HooksObject } from '@feathersjs/feathers';

import { logger } from '../logger';
import { Utility } from '../utility';

import { IDeviceGroup } from '../device-group/device-group-model';
import { IRoom } from './room-model';

export const roomHooks: Partial<HooksObject> = {
  before: {
    async create(context: HookContext<IRoom>) {
      const data = context.data;
      const params = context.params;
      const { deviceGroupId }: { deviceGroupId: string } = <any>params.query;

      const deviceGroup: IDeviceGroup = await context.app
        .service('groups')
        .get(deviceGroupId);
      const roomId = Utility.generateId(deviceGroupId, data.name);

      //#region Validation
      if (deviceGroup === undefined) {
        const message =
          'Given device group does not exist. Try different group or create one';
        logger.warn(message, { device: data, deviceGroupId });
        throw new Error(message);
      }

      if (
        await Utility.isChild(roomId, context.service, { deviceGroupId })
      ) {
        const message = 'Room already exists for given device group';
        logger.warn(message, { data });
        throw new Error(message);
      }
      // #endregion

      // Add reverse reference
      data.deviceGroupId = deviceGroupId;

      data._id = roomId;

      return context;
    }
  }
};
