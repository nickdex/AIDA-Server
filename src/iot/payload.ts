import { DevicePin } from '../constants';

export class IotPayload {
  room: string;
  device: DevicePin;
  action: string;
  sender: string;

  constructor() {
    this.sender = 'server';
  }
}
