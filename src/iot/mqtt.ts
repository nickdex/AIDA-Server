import { connect, MqttClient } from 'mqtt';

import { logger } from '../logger';
import { IotPayload } from './payload';

export namespace Mqtt {
  const URL = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
  const IOT_TOPIC = process.env.CLOUDMQTT_TOPIC_IOT || 'up-test';
  const SERVER_TOPIC = process.env.CLOUDMQTT_TOPIC_SERVER || 'down-test';

  let mqttClient: MqttClient = null;

  export const init = () => {
    if (mqttClient == null) {
      mqttClient = connect(URL);
      mqttClient.subscribe(IOT_TOPIC);
    }
  };

  export const send = (payload: IotPayload) => {
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

            mqttClient.once('message', (topic, dataBuffer, incomingData) => {
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
