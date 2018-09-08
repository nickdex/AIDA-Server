import { IIotDevice } from './iot-device';

export interface IDeviceGroup {
  devices: IIotDevice[];
  group: string;
}
