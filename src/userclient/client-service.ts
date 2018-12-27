import { Params } from '@feathersjs/feathers';

import { logger } from '../logger';
import { IClient } from './client-model';

import { ClientData } from './client-data';

export class ClientService {
  public async find(params: Params): Promise<IClient[]> {
    const clients = await ClientData.getClients();
    const username = params.query.username;

    if (!clients[username]) {
      return [];
    }

    return clients[username];
  }

  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const clients = await ClientData.getClients();
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
    const clients = await ClientData.getClients();
    const username = params.query.username;

    if (!clients[username]) {
      clients[username] = [];
    }

    const userClients: IClient[] = clients[username];
    const existingClients = userClients.filter(
      c => c.name === data.name && c.deviceType === data.deviceType
    );
    if (existingClients.length === 0) {
      clients[username].push(data);
    }

    await ClientData.updateClients(clients);

    return data;
  }

  public async patch(id: string, data: IClient, params: Params) {
    const clients = await ClientData.getClients();
    const username = params.query.username;
    const userClients: IClient[] = clients[username];

    for (let index = 0; index < userClients.length; index += 1) {
      const client = userClients[index];
      if (client.name === id && client.deviceType === params.query.deviceType) {
        // Only update subscription token, as other fields are auto populated
        client.subscriptionToken = data.subscriptionToken;
        clients[username][index] = client;
        await ClientData.updateClients(clients);

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
    const clients = await ClientData.getClients();
    const username = params.query.username;
    const userClients: IClient[] = clients[username];

    for (let index = 0; index < userClients.length; index += 1) {
      const client = userClients[index];
      if (client.name === id && client.deviceType === params.query.deviceType) {
        const removed = userClients.splice(index, 1)[0];

        clients[username] = userClients;

        await ClientData.updateClients(clients);

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
}
