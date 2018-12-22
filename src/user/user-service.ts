import { Params } from '@feathersjs/feathers';

import { logger } from '../logger';
import { IUser } from './user-model';

import { userData } from '../database/data';

export class UserService {
  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const users = await this.getUsers();

    // Don't return password
    return { ...users[id], password: '' };
  }

  public async create(data: IUser) {
    const users = await this.getUsers();
    users[data.username] = data;

    await this.updateUsers(users);

    return data;
  }

  public async patch(id: string, data: IUser, params: Params) {
    const users = await this.getUsers();

    if (!users[id]) {
      const message = 'User does not exist';
      logger.warn(message, { username: id });
      throw new Error(message);
    }

    if (users[id].password !== params.query.oldPassword) {
      const message = 'Password did not match for User';
      logger.warn(message, { username: id });
      throw new Error(message);
    }

    users[id].password = data.password;

    await this.updateUsers(users);

    return users[id];
  }

  public async remove(id: string, params: Params) {
    const users = await this.getUsers();
    const user = users[id];

    if (user.password !== params.query.password) {
      const message = 'Password did not match for User';
      logger.warn(message, { username: id });
      throw new Error(message);
    }

    delete users[id];

    await this.updateUsers(users);

    return user;
  }

  private async getUsers() {
    return Promise.resolve(userData);
  }

  private async updateUsers(users: any) {
    // userData = users;
    return Promise.resolve(null);
  }
}
