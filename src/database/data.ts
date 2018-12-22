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
        pin: 2,
        isOn: false,
        room: "nick's bedroom"
      }
    ],
    group: 'Nik'
  }
];
