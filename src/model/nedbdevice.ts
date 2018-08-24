import { DevicePin } from '../constants';
/**
 * Schema for data packet used for nedb.
 * @export
 * @class NedbDevice
 */
export class NedbDevice {
  // tslint:disable-next-line:variable-name
  public _id: DevicePin;
  public isOn: boolean;
  public name: string;
}
