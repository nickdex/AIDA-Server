import { Request, Response } from 'express';

import { DialogFlowIntent } from '../dialogflow/intent';
import { IotDevice } from '../iot/device';
import { IotPayload } from '../iot/payload';

export let agent = (req: Request, res: Response) => {
  const result = req.body.result;
  const intent: string[] = result.action.split('.');

  const action: string = intent[intent.length - 1];
  const room: string = result.parameters.room;
  const device: string = result.parameters.device;

  let entity: string;

  if (intent[1] === 'device') entity = device;
  else entity = intent[1];

  const payload: IotPayload = {
    room: room,
    action: action,
    device: entity,
    sender: 'server'
  };

  const iotDevice = new IotDevice();

  iotDevice.send(payload).then(response => {
    res.send(JSON.stringify({ speech: response, displayText: response }));
  }).catch(reason => {
    res.send(JSON.stringify({ speech: reason, displayText: reason }));
  });

};
