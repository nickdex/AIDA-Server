import { Request, Response } from 'express';
import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DevicePin } from '../constants';
import { DeviceService } from '../service';
import { Device } from '../model/device';

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('home');
};

export const devices = async (req: Request, res: Response) => {
  res.json(await DeviceService.deviceService.find());
};

const getPayload = (data: Device): IotPayload => {
  const payload = new IotPayload();
  payload.device = data._id;
  payload.action = data.isOn ? 'on' : 'off';
  return payload;
};

export let iot = (req: Request, res: Response) => {
  const payload: IotPayload = getPayload(req.body);
  console.log(`Iot`);

  const iotDevice = new IotDevice();

  // DB Update
  const isOn = payload.action === 'on';
  DeviceService.deviceService
    .patch(payload.device, { isOn: isOn })
    .then(item => console.log(`DB Update: ${JSON.stringify(item)}`));

  iotDevice
    .send(payload)
    .then(response => {
      res.send(JSON.stringify({ speech: response, displayText: response }));
    })
    .catch(reason => {
      res.send(JSON.stringify({ speech: reason, displayText: reason }));
    });
};
