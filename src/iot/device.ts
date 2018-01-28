import { IotPayload } from '../iot/payload';

import { client, SERVER_TOPIC, IOT_TOPIC } from './mqtt';
import { MqttClient } from 'mqtt';

export class IotDevice {
  client: MqttClient;

  constructor() {
    this.client = client;
    this.client.subscribe(IOT_TOPIC);
  }

  send(payload: IotPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.client.connected) {
        console.log(`Topic: ${SERVER_TOPIC} | Send#Payload: ${JSON.stringify(payload)}`);

        this.client.publish(SERVER_TOPIC, JSON.stringify(payload), (err, packet) => {

          client.once('message', (topic, dataBuffer, packet) => {
            const message: any = JSON.parse(dataBuffer.toString());
            console.log(`Topic: ${topic} | Once#Message: ${JSON.stringify(message)}`);

            if (message.sender === 'iot') resolve(message.message);
          });

          if (err) reject(err.message);
        });
      } else if (!this.client.reconnecting) {
        this.client.reconnect();
        resolve('Reconnecting Please try later');
      }
    });
  }
}
