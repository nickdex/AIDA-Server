import { MqttClient } from 'mqtt';
import { IotPayload } from '../iot/payload';
import { client, IOT_TOPIC, SERVER_TOPIC } from './mqtt';

import { logger } from '../logger';

export namespace Mqtt {
  let mqttClient: MqttClient = null;

  const init = () => {
    if (mqttClient == null) {
      mqttClient = client;
      mqttClient.subscribe(IOT_TOPIC);
    }
  };

  export const send = (payload: IotPayload) => {
    init();

    return new Promise((resolve, reject) => {
      if (mqttClient.connected) {
        logger.verbose('Client is connected');
        logger.verbose(
          `Topic: ${SERVER_TOPIC} | Payload sent: ${JSON.stringify(payload)}`
        );

        mqttClient.publish(
          SERVER_TOPIC,
          JSON.stringify(payload),
          (err, packet) => {
            if (err) {
              reject(err.message);
            }

            client.once('message', (topic, dataBuffer, incomingData) => {
              const message: any = JSON.parse(dataBuffer.toString());
              logger.verbose(
                `Topic: ${topic} | Message Received: ${JSON.stringify(message)}`
              );

              if (message.sender === 'iot') {
                resolve(message.message);
              }
            });
          }
        );
      } else if (!mqttClient.reconnecting) {
        mqttClient.reconnect();
        reject('Reconnecting Please try later');
      }
    });
  };
}
