import { Request, Response } from 'express';
import axios from 'axios';
import * as fcm from 'node-gcm';
import logger from '../logger';

const kvUrl = 'https://api.keyvalue.xyz/7428d0ee/pushdata';

export const index = async (req: Request, res: Response) => {
  const name = req.body.name;
  const uid = req.body.uid;
  logger.debug(`Data received: Name: ${name}, UID: ${uid}`);

  let pushData = (await axios.get(kvUrl)).data;

  pushData[name] = uid;
  axios.post(kvUrl, pushData);

  res.sendStatus(200);
};

export const test = async (req: Request, res: Response) => {
  logger.info(
    `Test request with Name: ${req.params.name} Data: ${req.query.data}`
  );
  const devices = (await axios.get(kvUrl)).data;
  logger.debug(JSON.stringify(devices));

  const uid = devices[req.params.name];

  // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
  var sender = new fcm.Sender(process.env.FCM_API_KEY);
  // Prepare a message to be sent
  var message = new fcm.Message({
    data: { title: req.query.data }
  });
  // Specify which registration IDs to deliver the message to
  var regTokens = [uid];
  // Actually send the message
  sender.send(message, { registrationTokens: regTokens }, function(
    err,
    response
  ) {
    if (err) logger.error(err);
    else logger.info(JSON.stringify(response));
  });

  res.sendStatus(200);
};
