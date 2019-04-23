import { HookContext, HooksObject } from '@feathersjs/feathers';
import * as lodash from 'lodash';

import { logger } from '../logger';
import { Utility } from '../utility';

import { IUser } from '../user/user-model';
import { DeviceType, IClient } from './client-model';

export const clientHooks: Partial<HooksObject> = {
  before: {
    all(context: HookContext<IClient>) {
      const query = context.params.query;
      const { username } = <{ username: string }>query;
      const data = context.data;

      ['userId', 'name', 'deviceType'].forEach(k => {
        query[k] = lodash.toLower(query[k]);
      });

      if (lodash.includes(['create', 'update', 'patch'], context.method)) {
        if (context.method === 'create') {
          if (!username) {
            const message = 'Username not available';
            logger.warn(message, { username });

            throw new Error(message);
          }
          context.params.userId = lodash.toLower(username);
        }
        if (context.method !== 'patch') {
          if (!data.name || !data.deviceType) {
            const message = `client ${
              context.method
            } failed. Need both name and deviceType`;
            logger.warn(message, { data });
            throw new Error(message);
          }
        }
        data.name = lodash.toLower(data.name);
        data.deviceType = DeviceType[data.deviceType];

        context.data = data;
      }

      return context;
    },
    async create(context: HookContext<IClient>) {
      const data: IClient = context.data;
      const userId: string = context.params.userId;

      const user: IUser = await context.app.service('users').get(userId);
      const clientId = Utility.generateId(userId, data.name);

      // #region Validation
      if (user === undefined) {
        const message =
          'Given user does not exist. Check username or create user';
        logger.warn(message, { device: data, user });
        throw new Error(message);
      }

      if (
        await Utility.isChild(clientId, context.service, {
          userId
        })
      ) {
        const message = 'Client already exists for given user';
        logger.warn(message, { device: data, user });
        throw new Error(message);
      }
      // #endregion

      // Add reverse reference
      data.userId = userId;

      data._id = clientId;

      return context;
    }
  }
};
