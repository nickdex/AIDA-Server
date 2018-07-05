import * as webpush from 'web-push';

import { logger } from '../logger';

import axios from 'axios';

export namespace PushNotification {
  const actions = [
    { action: 'on', title: 'Turn on' },
    { action: 'off', title: 'Turn off' }
  ];

  const getClientSubscription = async (
    clientName: string
  ): Promise<{
    endpoint: string;
    expirationTime?;
    keys: { auth: string; p256dh: string };
  }> => {
    const devices = (await axios.get(process.env.KV_PUSH_URL)).data;
    logger.debug(`Subscription: ${JSON.stringify(devices)}`);
    return devices[clientName];
  };

  const send = async (clientName, payload) => {
    webpush.setGCMAPIKey(process.env.FCM_API_KEY);
    webpush.setVapidDetails(
      `mailto:${process.env.OPERATOR_MAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    const subscription = await getClientSubscription(clientName);
    webpush.sendNotification(subscription, JSON.stringify(payload));
  };

  export const sendNotification = async (
    clientName: string,
    payload: {
      title: string;
      body: string;
      actions?: { action: string; title: string }[];
    }
  ) => {
    if (payload.actions == null) payload.actions = actions;

    await send(clientName, payload);
  };
}
