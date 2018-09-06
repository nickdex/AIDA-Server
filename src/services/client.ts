import { HookContext, HooksObject, Params } from '@feathersjs/feathers';
import axios from 'axios';

import { logger } from '../logger';
import { IClient } from '../model/client';

const clientUrl = process.env.CLIENT_DATA_URL;

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

export class ClientService {
  public async find(params: Params): Promise<IClient[]> {
    const clients = await this.getClients();
    const username = params.query.username;

    if (!clients[username]) {
      return [];
    }

    return clients[username];
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;
    const userClients: IClient[] = clients[username];

    for (const client of userClients) {
      if (client.name === id && client.deviceType === params.query.deviceType) {
        return client;
      }
    }

    const message = 'Client not found. Please check name and type again';
    logger.warn(message, {
      name: id,
      ...params.query
    });
    throw new Error(message);
  }

  public async create(data: IClient, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;

    if (!clients[username]) {
      clients[username] = [];
    }

    clients[username].push(data);

    await this.updateClients(clients);

    return data;
  }

  public async patch(id: string, data: IClient, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;
    const userClients: IClient[] = clients[username];

    for (let index = 0; index < userClients.length; index += 1) {
      const client = userClients[index];
      if (client.name === id && client.deviceType === params.query.deviceType) {
        // Only update subscription token, as other fields are auto populated
        client.subscriptionToken = data.subscriptionToken;
        clients[username][index] = client;
        await this.updateClients(clients);

        return data;
      }
    }

    const message = 'Client not found. Please check name and device type again';
    logger.warn(message, {
      name: id,
      ...params.query
    });
    throw new Error(message);
  }

  public async remove(id: string, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;
    const userClients: IClient[] = clients[username];

    for (let index = 0; index < userClients.length; index += 1) {
      const client = userClients[index];
      if (client.name === id && client.deviceType === params.query.deviceType) {
        const removed = userClients.splice(index, 1)[0];

        clients[username] = userClients;

        await this.updateClients(clients);

        return removed;
      }
    }

    const message = 'Client not found. Please check name and device type again';
    logger.warn(message, {
      name: id,
      ...params.query
    });
    throw new Error(message);
  }

  private async getClients() {
    const result = await axios.get(clientUrl);

    return result.data;
  }

  private async updateClients(clients: any) {
    return axios.post(clientUrl, clients);
  }
}
