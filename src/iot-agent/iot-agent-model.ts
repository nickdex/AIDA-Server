import { IIotDevice } from '../iot-device/iot-device-model';

export interface IIotAgent {
  _id: string; // join([IRoom._id, site], '-') | Also used for channel
  site: string;

  roomId: string; // IRoom._id

  devices?: IIotDevice[];
}
