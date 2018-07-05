import { MqttClient } from 'mqtt';
import { IotPayload } from '../iot/payload';
import { client, IOT_TOPIC, SERVER_TOPIC } from './mqtt';

import logger from '../logger';

/**
 * It can send a message to listening iot device on Server topic.
 * It listens to messages on the iot topic from the devices.
 * @export
 * @class IotDevice
 */
export class IotDevice {
  private client: MqttClient;

  constructor() {
    this.client = client;
    this.client.subscribe(IOT_TOPIC);
  }

  public send(payload: IotPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.client.connected) {
        logger.verbose('Client is connected');
        logger.verbose(
          `Topic: ${SERVER_TOPIC} | Payload sent: ${JSON.stringify(payload)}`
        );

        this.client.publish(
          SERVER_TOPIC,
          JSON.stringify(payload),
          (err, packet) => {
            client.once('message', (topic, dataBuffer, incomingData) => {
              const message: any = JSON.parse(dataBuffer.toString());
              logger.verbose(
                `Topic: ${topic} | Message Received: ${JSON.stringify(message)}`
              );

              if (message.sender === 'iot') {
                resolve(message.message);
              }
            });

            if (err) {
              reject(err.message);
            }
          }
        );
      } else if (!this.client.reconnecting) {
        this.client.reconnect();
        reject('Reconnecting Please try later');
      }
    });
  }
}

export const iotDevice = new IotDevice();
