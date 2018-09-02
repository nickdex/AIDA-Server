import { Params } from '@feathersjs/feathers';
import { logger } from '../logger';
import { IUser } from '../model/user';

import axios from 'axios';

const userUrl = process.env.USER_DATA_URL;

export class UserService {
  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const users = this.getUsers();

    logger.debug('Get User request', {
      username: id,
      password: params.query.password
    });

    const user: IUser = users[id];
    if (user.password === params.query.password) {
      return users[id];
    }

    const message = 'User password is incorrect';
    logger.warn(message);
    throw new Error(message);
  }

  public async create(data: IUser, params: Params) {
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
    const result = await axios.get(userUrl);

    return result.data;
  }

  private async updateUsers(users: any) {
    return axios.post(userUrl, users);
  }
}
