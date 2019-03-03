import { Request, Response } from '@feathersjs/express';
import { Application, Service } from '@feathersjs/feathers';
import * as webPush from 'web-push';

import { IClient } from '../client-device/client-model';
import { Mqtt } from '../iot/mqtt';
import { IotPayload } from '../iot/payload';
import { logger } from '../logger';

export namespace PushController {
  let app: Application;

  export const setup = (feathersApp: Application) => {
    app = feathersApp;
  };

  /**
   * POST /push/click
   * @param req Express Request
   * @param res Express Response
   */
  export const click = async (req: Request, res: Response) => {
    const action = req.body.action;
    const agentId = req.body.agentId;
    logger.debug(`User clicked: ${action}`);

    // Execute action using mqtt
    const payload: IotPayload = {
      action,
      device: 2, // Fan demo,
      agentId
    };
    const response = await Mqtt.send(payload);
    logger.info(`Mqtt message send successfully. Response: ${response}`);

    res.sendStatus(200);
  };

  /**
   * POST /push
   * @param req Express Request
   * @param res Express Response
   */
  export const send = async (req: Request, res: Response) => {
    const name = req.query.name;
    const deviceType = req.query.deviceType;

    const payload = req.body.payload;
    const username = req.body.username;

    const clientService: Service<IClient> = app.service('clients');
    const client = await clientService.get(name, {
      query: { username, deviceType }
    });

    if (!client.subscriptionToken) {
      logger.info('Can not push to unsubscribed client');
      res.sendStatus(403);

      return;
    }

    const actions = [
      { action: 'on', title: 'Turn on' },
      { action: 'off', title: 'Turn off' }
    ];
    payload.actions = actions;

    logger.info(
      `Sending notification to ${name} with Data: ${JSON.stringify(payload)}`
    );

    webPush.setGCMAPIKey(process.env.FCM_API_KEY);
    webPush.setVapidDetails(
      `mailto:${process.env.OPERATOR_MAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    webPush.sendNotification(client.subscriptionToken, JSON.stringify(payload));

    res.sendStatus(200);
  };
}
