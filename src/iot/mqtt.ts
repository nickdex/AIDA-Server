import { EventEmitter } from 'events';
import { connect, MqttClient } from 'mqtt';

import { logger } from '../logger';
export namespace Mqtt {
  const URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const IOT_TOPIC = process.env.MQTT_TOPIC_IOT || 'up-test';
  const SERVER_TOPIC = process.env.MQTT_TOPIC_SERVER || 'down-test';
  const PRESENCE_TOPIC = process.env.MQTT_PRESENCE_TOPIC || 'presence';

  let mqttClient: MqttClient;

  export const iotEmitter = new EventEmitter();

  export const init = () => {
    if (mqttClient === undefined) {
      mqttClient = connect(URL);
      logger.debug('Mqtt Client connected', URL);
      mqttClient.subscribe(IOT_TOPIC, undefined, logger.debug);
      mqttClient.subscribe(PRESENCE_TOPIC, undefined, logger.debug);
      logger.debug('Mqtt Client subscribed', IOT_TOPIC, PRESENCE_TOPIC);
      mqttClient.on('message', (topic, dataBuffer) => {
        const data = dataBuffer.toString();
        let incomingMessage = '';
        try {
          incomingMessage = JSON.parse(data);
        } catch (err) {
          incomingMessage = data;
        }
        logger.debug('Message Received', { topic }, { incomingMessage });

        switch (topic) {
          case PRESENCE_TOPIC:
            iotEmitter.emit('presence', incomingMessage);
            break;
          case IOT_TOPIC:
            iotEmitter.emit('action', incomingMessage);
            break;

          default:
            logger.info('Topic not recognized', { topic, incomingMessage });
        }
      });
    }
  };

  export const send = (payload): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (mqttClient.connected) {
        logger.verbose('Client is connected');

        logger.debug('Payload sent', SERVER_TOPIC, { payload });

        mqttClient.publish(SERVER_TOPIC, JSON.stringify(payload), err => {
          if (err) {
            return reject(err);
          }

          logger.debug('Payload sent successfully', SERVER_TOPIC, { payload });

          return resolve();
        });
      } else if (!mqttClient.reconnecting) {
        mqttClient.reconnect();

        return reject('Reconnecting Please try later');
      }
    });
  };
}
