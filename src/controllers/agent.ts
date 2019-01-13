import { Request, Response } from 'express';
import { find } from 'lodash';
import { Mqtt } from '../iot/mqtt';
import { IotPayload } from '../iot/payload';

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
  const parsedContext = parseContext(data.outputContexts);

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
    payload.device = 5;
  } else if (device === 'fan') {
    payload.device = 4;
  } else if (device === 'lights') {
    payload.device = 2;
  }

  return payload;
};

export let agent = (req: Request, res: Response) => {
  const payload: IotPayload = parseIntent(req.body.result);

  Mqtt.send(payload)
    .then(response => {
      res.send(
        JSON.stringify({
          fulfillmentText: response,
          fulfillmentMessages: [{ text: response }]
        })
      );
    })
    .catch(reason => {
      res.send(
        JSON.stringify({
          fulfillmentText: reason,
          fulfillmentMessages: [{ text: reason }]
        })
      );
    });
};
