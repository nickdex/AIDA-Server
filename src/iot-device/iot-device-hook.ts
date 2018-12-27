import { HookContext, HooksObject } from '@feathersjs/feathers';
import { Mqtt } from '../iot/mqtt';
import { logger } from '../logger';
import { IUser } from '../user/user-model';
import { IIotDevice } from './iot-device-model';

export const iotDeviceHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext) {
      const username = context.params.query.username;
      if (!username) {
        const message = 'Username not available';
        logger.warn(message, { username });

        throw new Error(message);
      }

      return context.app
        .service('users')
        .get(username)
        .then((user: IUser) => {
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
          context.params.group = user.group;

          return context;
        })
        .catch(() => context);
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
