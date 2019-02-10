import { connect, MqttClient } from 'mqtt';

import { logger } from '../logger';
import { IotPayload } from './payload';

export namespace Mqtt {
  const URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const IOT_TOPIC = process.env.MQTT_TOPIC_IOT || 'up-test';
  const SERVER_TOPIC = process.env.MQTT_TOPIC_SERVER || 'down-test';

  let mqttClient: MqttClient;

  export const init = () => {
    if (mqttClient === undefined) {
      mqttClient = connect(URL);
      logger.debug('Mqtt Client connected', URL);
      mqttClient.subscribe(IOT_TOPIC, undefined, logger.debug);
      logger.debug('Mqtt Client subscribed', IOT_TOPIC);
    }
  };

  export const send = (payload: IotPayload) => {
    return new Promise((resolve, reject) => {
      if (mqttClient.connected) {
        logger.verbose('Client is connected');
        logger.debug(
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
              logger.debug(
                `Topic: ${topic} | Message Received: ${JSON.stringify(message)}`
              );

              if (!message.response.error) {
                resolve(message);
              }
              reject(message);
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
