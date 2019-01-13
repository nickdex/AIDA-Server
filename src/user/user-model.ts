import { IClient } from '../client-device/client-model';

export interface IUser {
  username: string;
  password: string;
  groups: string[];
  clients: IClient[];
}
