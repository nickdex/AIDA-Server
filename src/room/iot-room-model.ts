import { IIotDevice } from '../iot-device/iot-device-model';

export interface IIotRoom {
  devices?: IIotDevice[];
  deviceIds: string[];
  _id: string; // join([IDeviceGroup._id, name], '-')
  name: string;
}
