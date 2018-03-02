import { DevicePin } from '../constants';
/**
 * Schema for data packet used for frontend.
 * @export
 * @class Device
 */
export class Device {
  // tslint:disable-next-line:variable-name
  public _id: DevicePin;
  public isOn: boolean;
  public name: string;
}
