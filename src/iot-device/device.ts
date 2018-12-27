import { DevicePin } from './device-pin';
/**
 * Schema for data packet used for frontend.
 * @export
 * @interface IDevice
 */
export interface IDevice {
  id: DevicePin;
  isOn: boolean;
  name: string;
}
