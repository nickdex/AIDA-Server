import { Request, Response } from 'express';
import { find } from 'lodash';

import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';
import { connect } from 'mqtt';
import { DevicePin } from '../constants';
import { DeviceService } from '../service';

export const parseActionString = (str: string): any => {
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

export const parseContext = (contexts: any[]) => {
  const context: any = {
    device: '',
    room: ''
  };
  const deviceSwitchContext = find(contexts, ['name', 'device-switch']);
  const switchContext = find(contexts, ['name', 'switch']);

  if (deviceSwitchContext)
    context.device = deviceSwitchContext.parameters.device;
  if (switchContext) context.room = switchContext.parameters.room;

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
  const parsedParam = parseParams(data.parameters);
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
  DeviceService.deviceService
    .patch(payload.device, { isOn: isOn })
    .then(item => console.log(`DB Update: ${JSON.stringify(item)}`));

  iotDevice
    .send(payload)
    .then(response => {
      res.send(JSON.stringify({ speech: response, displayText: response }));
    })
    .catch(reason => {
      res.send(JSON.stringify({ speech: reason, displayText: reason }));
    });
};
