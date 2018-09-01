import { Request, Response } from 'express';
import { Mqtt } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DeviceService } from '../service';

import { logger } from '../logger';
import { IDevice } from '../model/device';
import { NedbDevice } from '../model/nedbdevice';

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render('home');
};

export const devices = async (req: Request, res: Response) => {
  const devicesFound: NedbDevice[] = await DeviceService.find();
  const payload = devicesFound.map<IDevice>(d => {
    return { id: d._id, isOn: d.isOn, name: d.name };
  });
  res.json(payload);
};

export let iot = async (req: Request, res: Response) => {
  logger.info(`Request received: ${JSON.stringify(req.body)}`);

  const payload: IotPayload = { ...req.body };

  try {
    const result = await Mqtt.send(payload);
    logger.info(`Message sent successfully. Result: ${JSON.stringify(result)}`);

    await DeviceService.patch(payload.device, {
      isOn: payload.action === 'on' ? true : false
    });

    res.send({ id: payload.device, isSuccess: true });
  } catch (error) {
    logger.error(`Sending to IOT failed\n${error}`);
    res.send({ id: payload.device, isSuccess: false });
  }
};
