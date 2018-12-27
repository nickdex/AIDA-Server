import { Params } from '@feathersjs/feathers';

import { logger } from '../logger';
import { UserData } from './user-data';
import { IUser } from './user-model';

export class UserService {
  // tslint:disable no-reserved-keywords
  public async get(id: string, params: Params) {
    const users = await UserData.getUsers();

    // Don't return password
    return { ...users[id], password: '' };
  }

  public async create(data: IUser) {
    const users = await UserData.getUsers();
    users[data.username] = data;

    await UserData.updateUsers(users);

    return data;
  }

  public async patch(id: string, data: IUser, params: Params) {
    const users = await UserData.getUsers();

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

    await UserData.updateUsers(users);

    return users[id];
  }

  public async remove(id: string, params: Params) {
    const users = await UserData.getUsers();
    const user = users[id];

    if (user.password !== params.query.password) {
      const message = 'Password did not match for User';
      logger.warn(message, { username: id });
      throw new Error(message);
    }

    delete users[id];

    await UserData.updateUsers(users);

    return user;
  }
}
