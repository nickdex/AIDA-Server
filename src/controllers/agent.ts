import { Request, Response } from 'express';
import { find } from 'lodash';

import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { connect } from 'mqtt';

const parseActionString = (str: string): any => {
  const intent: string[] = str.split('.');

  return {
    action: intent[3],
    entity: intent[1]
  };
};

const parseParams = (params: any) => {

  return {
    device: params.device,
    room: params.room
  };
};

const parseContext = (contexts: any[]) => {
  const context: any = {
    device: '',
    room: ''
  };
  const deviceSwitchContext = find(contexts, ['name', 'device-switch']);
  const switchContext = find(contexts, ['name', 'switch']);

  if (deviceSwitchContext) context.device = deviceSwitchContext.parameters.device;
  if (switchContext) context.room = switchContext.parameters.room;

  return context;
};

const parseIntent = (data: any): IotPayload => {
  const payload: any = {
    action: '',
    device: '',
    room: '',
    sender: 'server'
  };

  const parsedAction = parseActionString(data.action);
  const parsedParam = parseParams(data.parameters);
  const parsedContext = parseContext(data.contexts);

  payload.room = parsedParam.room;
  payload.action =  parsedAction.action;

  switch (parsedAction.entity) {
    case 'lights':
      payload.room = parsedContext.room;
      payload.device = parsedAction.entity;
      break;
    case 'device':
      payload.device = parsedContext.device;
      break;
    default:
      payload.device = 'invalid';
  }

  return payload;
};

export let agent = (req: Request, res: Response) => {

  const payload: IotPayload = parseIntent(req.body.result);

  const iotDevice = new IotDevice();

  iotDevice.send(payload).then(response => {
    res.send(JSON.stringify({ speech: response, displayText: response }));
  }).catch(reason => {
    res.send(JSON.stringify({ speech: reason, displayText: reason }));
  });

};
