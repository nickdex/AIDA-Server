import { HookContext, HooksObject, Service } from '@feathersjs/feathers';

import * as lodash from 'lodash';

import { logger } from '../logger';
import { IUser } from '../user/user-model';
import { IClient } from './client-model';

export const clientHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext<IClient>) {
      const query = context.params.query;
      const { username } = <{ username: string }>query;

      if (!username) {
        const message = 'Username not available';
        logger.warn(message, { username: username });

        throw new Error(message);
      } else {
        query.username = lodash.toLower(username);
      }

      if (context.id) {
        context.id =
          typeof context.id === 'number'
            ? context.id
            : lodash.toLower(context.id);
      }

      if (context.data) {
        context.data.name = lodash.toLower(context.data.name);
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
        logger.debug('New client list initialized');
      }

      if (
        !lodash.includes(clients, {
          name: data.name,
          deviceType: data.deviceType
        })
      ) {
        clients.push(data);
      }

      const updatedUser: IUser = await context.app
        .service('users')
        .patch(user._id, user);

      context.result = lodash.find(updatedUser.clients, {
        name: data.name,
        deviceType: data.deviceType
      });

      return context;
    },
    async patch(context: HookContext<IClient | IUser>) {
      const data = <IClient>context.data;

      if (!data.name || !data.deviceType) {
        const message = 'Creating client failed. Need name and deviceType';
        logger.warn(message, {
          ...data
        });
        throw new Error(message);
      }

      const service: Service<IUser> = context.app.service('users');
      const user = await service.get(context.params.query.username);
      const clients = user.clients;
      const clientIndex = lodash.findIndex(clients, {
        name: data.name,
        deviceType: data.deviceType
      });

      if (clientIndex === -1) {
        const message = 'No record for given id found';
        logger.warn(message, data);
        throw new Error(message);
      }

      clients[clientIndex] = { ...clients[clientIndex], ...data };

      context.id = user._id;
      context.data = user;
      context.params.clientIndex = clientIndex;

      return context;
    },
    // tslint:disable-next-line no-reserved-keywords
    get(context: HookContext<IClient>) {
      context.params.clientId = context.id;
      context.id = lodash.toLower(context.params.query.username);
    }
  },
  after: {
    patch(context: HookContext<IUser | IClient>) {
      const updatedUser = <IUser>context.result;
      const clientIndex: number = context.params.clientIndex;
      context.result = updatedUser.clients[clientIndex];

      return context;
    },
    // tslint:disable-next-line no-reserved-keywords
    get(context: HookContext<IUser | IClient>) {
      const user = <IUser>context.result;

      const client = <IClient>lodash.find(user.clients, {
        name: context.params.clientId
      });

      context.result = client;

      return context;
    }
  }
};
