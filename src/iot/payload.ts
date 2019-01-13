/**
 * Schema class for payload that is sent to iot device.
 * @export
 * @class IotPayload
 */
export class IotPayload {
  public device: number;
  public action: string;
  public sender: string;

  constructor() {
    this.sender = 'server';
  }
}
