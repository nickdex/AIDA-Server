import { Request, Response } from 'express';
import axios from 'axios';
import * as fcm from 'node-gcm';
import logger from '../logger';

const kvUrl = 'https://api.keyvalue.xyz/7428d0ee/pushdata';

export const index = async (req: Request, res: Response) => {
  const device = req.body.device;
  logger.debug(`Data recieved: ${device}`);

  let pushData = (await axios.get(kvUrl)).data;
  pushData[device.name] = device.uid;
  axios.post(kvUrl, pushData);

  pushData.res.sendStatus(200);
};

export const test = async (req: Request, res: Response) => {
  const devices = await axios.get(kvUrl);
  const uid = devices[req.query.name];

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
    else logger.info(response);
  });
};
