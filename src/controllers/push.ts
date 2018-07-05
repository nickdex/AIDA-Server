import { Request, Response } from 'express';
import { iotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';

import axios from 'axios';
import { logger } from '../logger';
import { PushNotification } from '../prediction/notification';
import { DevicePin } from '../constants';

const kvUrl = process.env.KV_PUSH_URL;

/**
 * POST /push
 * @param req Express Request
 * @param res Express Response
 */
export const index = async (req: Request, res: Response) => {
  const pushSubscription = req.body.subscription;
  logger.debug(`Data received: ${JSON.stringify(pushSubscription)}`);

  const pushData = (await axios.get(kvUrl)).data;

  pushData[req.body.name] = pushSubscription;
  axios.post(kvUrl, pushData);

  res.sendStatus(200);
};

export const click = async (req: Request, res: Response) => {
  const action = req.body.action;
  logger.debug(`User clicked: ${action}`);

  // Execute action using mqtt
  const payload: IotPayload = {
    action,
    device: DevicePin.FAN, // TODO: Use from predictive model
    sender: 'server'
  };
  const response = await iotDevice.send(payload);
  logger.info(`Mqtt message send successfully. Response: ${response}`);

  res.sendStatus(200);
};

export const send = async (req: Request, res: Response) => {
  const clientName = req.params.name;
  const payload = req.body;

  await PushNotification.sendNotification(clientName, {
    title: payload.title,
    body: payload.body
  });

  res.sendStatus(200);
};
