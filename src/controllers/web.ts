import { Request, Response } from 'express';
import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DevicePin } from '../constants';

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.render('home');
};

const getPayload = (data: any): IotPayload => {
  const payload = new IotPayload();
  switch (data.key) {
    case 'fan':
      payload.device = DevicePin.FAN;
      break;
    case 'lights':
      payload.device = DevicePin.LIGHTS;
      break;
    case 'outdoor':
      payload.device = DevicePin.OUTDOOR;
      break;
  }
  payload.action = data.isOn ? 'on' : 'off';
  return payload;
};

export let iot = (req: Request, res: Response) => {
  const payload: IotPayload = getPayload(req.body);
  console.log(`Iot`);

  const iotDevice = new IotDevice();

  iotDevice
    .send(payload)
    .then(response => {
      res.send(JSON.stringify({ speech: response, displayText: response }));
    })
    .catch(reason => {
      res.send(JSON.stringify({ speech: reason, displayText: reason }));
    });
};
