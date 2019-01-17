import { IClient } from '../client-device/client-model';

export interface IUser {
  _id: string;
  username: string;
  password: string;
  groupIds: string[]; // IDeviceGroup._id
  clients: IClient[];
}
