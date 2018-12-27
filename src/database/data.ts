import { IDeviceGroup } from '../iot-device/device-group';

export const clientData = {
  Nikhil: [
    {
      name: 'VIVALDI',
      deviceType: 'BROWSER'
    },
    {
      name: 'ONEPLUS',
      deviceType: 'ANDROID'
    }
  ]
};

export const userData = { Nikhil: { username: 'Nikhil', group: 'Nik' } };

export const iotDevicesData: IDeviceGroup[] = [
  {
    devices: [
      {
        name: 'fan',
        pin: 4,
        isOn: false,
        room: "nick's bedroom"
      },
      {
        name: 'lights',
        pin: 2,
        isOn: false,
        room: "nick's bedroom"
      },
      {
        name: 'outdoor',
        pin: 5,
        isOn: false,
        room: "nick's bedroom"
      }
    ],
    group: 'Nik'
  }
];
