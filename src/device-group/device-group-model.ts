import { IRoom } from '../room/room-model';

export interface IDeviceGroup {
  _id: string; // join([IUser._id, name], '-')
  name: string;
  ownerId: string;

  userIds: string[]; // IUser._id

  rooms?: IRoom[];
}
