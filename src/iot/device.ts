import { MqttClient } from 'mqtt';
import { IotPayload } from '../iot/payload';
import { client, IOT_TOPIC, SERVER_TOPIC } from './mqtt';

import { logger } from '../logger';

export namespace IotDevice {
  var mqttClient: MqttClient = null;

  const init = () => {
    if (mqttClient == null) {
      mqttClient = client;
      mqttClient.subscribe(IOT_TOPIC);
    }
  };

  export const send = async (payload: IotPayload) => {
    init();

    if (mqttClient.connected) {
      logger.verbose('Client is connected');
      logger.verbose(
        `Topic: ${SERVER_TOPIC} | Payload sent: ${JSON.stringify(payload)}`
      );

      mqttClient.publish(
        SERVER_TOPIC,
        JSON.stringify(payload),
        (err, packet) => {
          client.once('message', (topic, dataBuffer, incomingData) => {
            const message: any = JSON.parse(dataBuffer.toString());
            logger.verbose(
              `Topic: ${topic} | Message Received: ${JSON.stringify(message)}`
            );

            if (message.sender === 'iot') {
              return message.message;
            }
          });

          if (err) {
            throw new Error(err.message);
          }
        }
      );
    } else if (!mqttClient.reconnecting) {
      mqttClient.reconnect();
      throw new Error('Reconnecting Please try later');
    }
  };
}
