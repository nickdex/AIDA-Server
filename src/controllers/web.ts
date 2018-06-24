import { Request, Response } from 'express';
import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DeviceService } from '../service';

import logger from '../logger';

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
  logger.info(`Request received: ${JSON.stringify(req.body)}`);

  const iotDevice = new IotDevice();
  logger.verbose('MQTT object created');

  const payload: IotPayload = { ...req.body };

  iotDevice
    .send(payload)
    .then(result => {
      logger.info(
        `Message sent successfully. Result: ${JSON.stringify(result)}`
      );
      res.send(result);
    })
    .catch(reason => {
      logger.error(`Sending to IOT failed\n${reason}`);
    });
};
