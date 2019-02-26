import { IIotAgent } from '../iot-agent/iot-agent-model';

export interface IRoom {
  _id: string; // join([IDeviceGroup._id, name], '-')
  name: string;

  deviceGroupId: string; // IDeviceGroup._id

  agents?: IIotAgent[];
}
