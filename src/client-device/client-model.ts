export interface IClient {
  _id: string;

  name: string;
  deviceType: DeviceType;
  subscriptionToken?: string;

  userId: string; // IUser._id
}

export enum DeviceType {
  BROWSER = 'browser',
  ANDROID = 'android',
  IOS = 'ios'
}
