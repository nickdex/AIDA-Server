import { Request, Response } from 'express';
import { error, log } from 'util';

import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DeviceService } from '../service';

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('home');
};

export const devices = async (req: Request, res: Response) => {
  res.json(await DeviceService.find());
};

export let iot = (req: Request, res: Response) => {
  const iotDevice = new IotDevice();
  const payload: IotPayload = { ...req.body };

  log(`Payload recieved: ${JSON.stringify(payload)}`);

  iotDevice
    .send(payload)
    .then(result => {
      log(`Message sent successfully. Result: ${JSON.stringify(result)}`);
      res.send(result);
    })
    .catch(reason => {
      error(`Sending to IOT failed\n${reason}`);
    });
};
