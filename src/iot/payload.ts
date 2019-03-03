/**
 * Schema class for payload that is sent to iot device.
 * @export
 * @class IotPayload
 */
export interface IotPayload {
  device: number;
  action: string;
  agentId: string;
}
