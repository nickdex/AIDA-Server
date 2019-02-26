export interface IUser {
  _id: string;
  username: string;
  password: string;
  groupIds: string[]; // IDeviceGroup._id
}
