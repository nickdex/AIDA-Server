import * as webPush from 'web-push';

import { Request, Response } from 'express';
import { Mqtt } from '../iot/device';
import { IotPayload } from '../iot/payload';

import axios from 'axios';
import { logger } from '../logger';

const kvUrl = process.env.KV_PUSH_URL;

/**
 * GET /push/:name
 * @param req Express Request
 * @param res Express Response
 */
export const isSubscribed = async (req: Request, res: Response) => {
  const pushData = (await axios.get(kvUrl)).data;
  if (pushData == null || pushData[req.params.name] == null) {
    return res.json({ isSubscribed: false });
  }

  return res.json({ isSubscribed: true });
};

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

/**
 * POST /push/click
 * @param req Express Request
 * @param res Express Response
 */
export const click = async (req: Request, res: Response) => {
  const action = req.body.action;
  logger.debug(`User clicked: ${action}`);

  // Execute action using mqtt
  const payload: IotPayload = {
    action,
    device: 2, // Fan demo
    sender: 'server'
  };
  const response = await Mqtt.send(payload);
  logger.info(`Mqtt message send successfully. Response: ${response}`);

  res.sendStatus(200);
};

/**
 * POST /push/:name
 * @param req Express Request
 * @param res Express Response
 */
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

  webPush.setGCMAPIKey(process.env.FCM_API_KEY);
  webPush.setVapidDetails(
    `mailto:${process.env.OPERATOR_MAIL}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  webPush.sendNotification(pushSubscription, JSON.stringify(payload));

  res.sendStatus(200);
};
