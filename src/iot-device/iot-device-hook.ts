import { HookContext, HooksObject } from '@feathersjs/feathers';
import * as lodash from 'lodash';

import { Mqtt } from '../iot/mqtt';
import { logger } from '../logger';
import { Utility } from '../utility';

import { IIotAgent } from '../iot-agent/iot-agent-model';
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

      const device = await context.service.get(context.id);

      try {
        await Mqtt.send({
          action: data.isOn ? 'on' : 'off',
          device: device.pin,
          agentId: device.agentId
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
      const { agentId }: { agentId: string } = <any>params.query;

      const agent: IIotAgent = await context.app.service('agents').get(agentId);
      const deviceId = Utility.generateId(agentId, data.name);

      if (agent === undefined) {
        const message =
          'Given agent does not exist. Try different agent or create one';
        logger.warn(message, { device: data, agentId });
        throw new Error(message);
      }

      if (await Utility.isChild(deviceId, context.service, { agentId })) {
        const message = 'Device already exist for given agent';
        logger.warn(message, { data });
        throw new Error(message);
      }
      // #endregion

      // Default state when creating
      data.isOn = false;
      // Add Agent reverse reference
      data.agentId = agent._id;

      data._id = deviceId;

      return context;
    },
    update(context: HookContext<IIotDevice>) {
      const data = context.data;
      // Default state when creating
      data.isOn = lodash.isNil(data.isOn) ? false : data.isOn;

      return context;
    }
  }
};
