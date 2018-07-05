import { Request, Response } from 'express';
import { find } from 'lodash';
import { DevicePin } from '../constants';
import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { DeviceService } from '../service';

import { logger } from '../logger';

export const parseActionString = (str: string): any => {
  const intent: string[] = str.split('.');

  return {
    action: intent[3],
    entity: intent[1]
  };
};

export const parseContext = (contexts: any[]) => {
  const context: any = {
    device: '',
    room: ''
  };
  const deviceSwitchContext = find(contexts, ['name', 'device-switch']);
  const switchContext = find(contexts, ['name', 'switch']);

  if (deviceSwitchContext) {
    context.device = deviceSwitchContext.parameters.device;
  }
  if (switchContext) {
    context.room = switchContext.parameters.room;
  }

  return context;
};

const parseIntent = (data: any): IotPayload => {
  const payload: any = {
    action: '',
    device: '',
    // room: '',
    sender: 'server'
  };

  const parsedAction = parseActionString(data.action);
  const parsedContext = parseContext(data.contexts);

  let device = '';
  let room = '';

  switch (parsedAction.entity) {
    case 'lights':
      room = parsedContext.room;
      device = parsedAction.entity;
      break;
    case 'device':
      device = parsedContext.device;
      break;
    default:
      device = 'invalid';
  }

  // payload.room = parsedParam.room;
  payload.action = parsedAction.action;

  if (room === 'outdoor') {
    payload.device = DevicePin.OUTDOOR;
  } else if (device === 'fan') {
    payload.device = DevicePin.FAN;
  } else if (device === 'lights') {
    payload.device = DevicePin.LIGHTS;
  }

  return payload;
};

export let agent = (req: Request, res: Response) => {
  const payload: IotPayload = parseIntent(req.body.result);

  const iotDevice = new IotDevice();

  // DB Update
  const isOn = payload.action === 'on';
  DeviceService.patch(payload.device, { isOn: isOn })
    .then(item => logger.info(`DB Update: ${JSON.stringify(item)}`))
    .catch(reason => logger.error(`DB update failed: ${reason}`));

  iotDevice
    .send(payload)
    .then(response => {
      res.send(JSON.stringify({ speech: response, displayText: response }));
    })
    .catch(reason => {
      res.send(JSON.stringify({ speech: reason, displayText: reason }));
    });
};
