import { IIotDevice } from './iot-device-model';

export interface IDeviceGroup {
  devices: IIotDevice[];
  group: string;
}
