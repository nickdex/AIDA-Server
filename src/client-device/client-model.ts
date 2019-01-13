export interface IClient {
  name: string;
  deviceType: DeviceType;
  subscriptionToken: string;
}

export enum DeviceType {
  BROWSER,
  ANDROID,
  IOS
}
