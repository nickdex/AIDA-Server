import { Request, Response } from 'express';
import * as webpush from 'web-push';
import axios from 'axios';
import logger from '../logger';

const kvUrl = 'https://api.keyvalue.xyz/7428d0ee/pushdata';

export const index = async (req: Request, res: Response) => {
  const pushSubscription = req.body.subscription;
  logger.debug(`Data received: ${JSON.stringify(pushSubscription)}`);

  let pushData = (await axios.get(kvUrl)).data;

  pushData[req.body.name] = pushSubscription;
  axios.post(kvUrl, pushData);

  res.sendStatus(200);
};

export const send = async (req: Request, res: Response) => {
  const name = req.params.name;
  const payload = JSON.stringify(req.body);

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
  webpush.sendNotification(pushSubscription, payload);

  res.sendStatus(200);
};
