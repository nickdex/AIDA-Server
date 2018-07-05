import * as webpush from 'web-push';

import { Request, Response } from 'express';
import { iotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';

import axios from 'axios';
import { logger } from '../logger';

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
    device: 2, // TODO: Use from predictive model
    sender: 'server'
  };
  const response = await iotDevice.send(payload);
  logger.info(`Mqtt message send successfully. Response: ${response}`);

  res.sendStatus(200);
};

export const send = async (req: Request, res: Response) => {
  const name = req.params.name;
  const payload = req.body;
  const actions = [
    { action: 'on', title: 'Turn on' },
    { action: 'off', title: 'Turn off' }
  ];
  payload.actions = actions;

  logger.info(
    `Request for sending notification to ${name} with Data: ${JSON.stringify(
      payload
    )}`
  );

  const devices = (await axios.get(kvUrl)).data;
  logger.debug(`Subscription: ${JSON.stringify(devices)}`);
  const pushSubscription = devices[name];

  webpush.setGCMAPIKey(process.env.FCM_API_KEY);
  webpush.setVapidDetails(
    `mailto:${process.env.OPERATOR_MAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  webpush.sendNotification(pushSubscription, JSON.stringify(payload));

  res.sendStatus(200);
};
