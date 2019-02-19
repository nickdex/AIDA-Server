export interface IIotDevice {
  _id: string; // join([IDeviceGroup._id, IIotRoom._id, name], '-')
  name: string;
  pin: number;
  isOn: boolean;
  roomId: string;
  groupId: string;
}
