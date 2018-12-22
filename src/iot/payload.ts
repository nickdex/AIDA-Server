import { DevicePin } from '../iot-device/constants';
/**
 * Schema class for payload that is sent to iot device.
 * @export
 * @class IotPayload
 */
export class IotPayload {
  public device: DevicePin;
  public action: string;
  public sender: string;

  constructor() {
    this.sender = 'server';
  }
}
