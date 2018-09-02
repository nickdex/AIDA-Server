import { Params } from '@feathersjs/feathers';
import axios from 'axios';

import { logger } from '../logger';
import { IClient } from '../model/client';

const clientUrl = process.env.CLIENT_DATA_URL;

export class ClientService {
  public async find(params: Params): Promise<IClient[]> {
    const clients = await this.getClients();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to fetch clients';
      logger.warn(message, params.query);
      throw new Error(message);
    }

    if (!clients[username]) {
      return [];
    }

    return clients[username];
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const clients = await this.getClients();

    const username = params.query.username;

    if (!username) {
      const message = 'Need username to get clients';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }

    const userClients: IClient[] = clients[username];

    for (const client of userClients) {
      if (client.name === id && client.deviceType === params.query.deviceType) {
        return client;
      }
    }
    {
      const message = 'Client not found. Please check name and type again';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }
  }

  public async create(data: IClient, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to create clients';
      logger.warn(message, {
        name: data.name,
        deviceType: data.deviceType
      });
      throw new Error(message);
    }

    if (!data.name || !data.deviceType) {
      const message = 'Creating client failed. Need name and device type';
      logger.warn(message, {
        name: data.name,
        deviceType: data.deviceType
      });
      throw new Error(message);
    }

    if (!clients[username]) {
      clients[username] = [];
    }

    clients[username].push(data);

    await this.updateClients(clients);

    return data;
  }

  public async update(id: string, data: IClient, params: Params) {
    const clients = await this.getClients();

    const username = params.query.username;

    if (!username) {
      const message = 'Need username to update clients';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }

    const userClients: IClient[] = clients[username];

    for (let index = 0; index < userClients.length; index += 1) {
      const client = userClients[index];
      if (client.name === id && client.deviceType === data.deviceType) {
        clients[username][index] = data;
        await this.updateClients(clients);

        return data;
      }
    }
    {
      const message =
        'Client not found. Please check name and device type again';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }
  }

  public async remove(id: string, params: Params) {
    const clients = await this.getClients();
    const username = params.query.username;

    if (!username) {
      const message = 'Need username to remove clients';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }

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
    {
      const message =
        'Client not found. Please check name and device type again';
      logger.warn(message, {
        name: id,
        deviceType: params.query.deviceType
      });
      throw new Error(message);
    }
  }

  private async getClients() {
    const result = await axios.get(clientUrl);

    return result.data;
  }

  private async updateClients(clients: any) {
    return axios.post(clientUrl, clients);
  }
}
