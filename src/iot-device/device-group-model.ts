import { IIotRoom } from './iot-room-model';

export interface IDeviceGroup {
  _id: string; // join([IUser._id, name], '-')
  name: string;
  ownerId: string;
  userIds: string[];

  rooms: IIotRoom[];
}
