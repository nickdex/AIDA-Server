import { DialogFlowIntent } from '../dialogflow/intent';
import { IotPayload } from '../iot/payload';

import { client, TOPIC } from './mqtt';
import { MqttClient } from 'mqtt';

export class IotDevice {
  client: MqttClient;

  constructor() {
    this.client = client;
    this.client.subscribe(TOPIC);
  }

  send(payload: IotPayload): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.client.connected) {
        this.client.publish(TOPIC, JSON.stringify(payload), (err, packet) => {
          client.on('message', (TOPIC, dataBuffer, packet) => {
            const message: any = JSON.parse(dataBuffer.toString());
            console.log(`On#Message: ${JSON.stringify(message)}`);

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
