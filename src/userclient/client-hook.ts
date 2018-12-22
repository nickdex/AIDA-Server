import { HookContext, HooksObject } from '@feathersjs/feathers';

import { logger } from '../logger';
import { IClient } from './client-model';

export const clientHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext) {
      if (!context.params.query.username) {
        const message = 'Username not available';
        logger.warn(message, { username: context.params.query.username });

        throw new Error(message);
      }

      if (context.id) {
        context.id =
          typeof context.id === 'number'
            ? context.id
            : context.id.toUpperCase();
      }
      const query = context.params.query;
      if (query && query.deviceType) {
        context.params.query.deviceType = query.deviceType.toUpperCase();
      }
    },
    create(context: HookContext) {
      const data: IClient = context.data;

      if (!data.name || !data.deviceType) {
        const message = 'Creating client failed. Need name and deviceType';
        logger.warn(message, {
          ...data
        });
        throw new Error(message);
      }

      data.deviceType = data.deviceType.toUpperCase();
      data.name = data.name.toUpperCase();

      context.data = data;
    }
  }
};
