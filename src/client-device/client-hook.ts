import { HookContext, HooksObject, Service } from '@feathersjs/feathers';

import * as lodash from 'lodash';

import { logger } from '../logger';
import { IUser } from '../user/user-model';
import { IClient } from './client-model';

export const clientHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext<IClient>) {
      if (!context.params.query.username) {
        const message = 'Username not available';
        logger.warn(message, { username: context.params.query.username });

        throw new Error(message);
      }

      if (context.id) {
        context.id =
          typeof context.id === 'number'
            ? context.id
            : context.id.toLowerCase();
      }

      if (context.data) {
        context.data.name = context.data.name.toLowerCase();
      }
    },
    async create(context: HookContext<IClient>) {
      const data: IClient = context.data;

      if (!data.name || !data.deviceType) {
        const message = 'Creating client failed. Need name and deviceType';
        logger.warn(message, {
          ...data
        });
        throw new Error(message);
      }

      const service: Service<IUser> = context.app.service('users');
      const user = await service.get(context.params.query.username);
      let clients = user.clients;

      if (clients == null) {
        clients = [];
      }

      const client = lodash.find(clients, {
        name: data.name,
        deviceType: data.deviceType
      });

      if (client == null) {
        clients.push(data);
      }

      context.result = data;
    }
  }
};
