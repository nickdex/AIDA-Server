import { DevicePin } from '../constants';
/**
 * Schema class for payload that is sent to iot device.
 * @export
 * @class IotPayload
 */
export class IotPayload {
  public room: string;
  public device: DevicePin;
  public action: string;
  public sender: string;

  constructor() {
    this.sender = 'server';
  }
}
