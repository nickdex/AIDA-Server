import { connect } from 'mqtt';

const URL = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
export const IOT_TOPIC = process.env.CLOUDMQTT_TOPIC_IOT || 'up-test';
export const SERVER_TOPIC = process.env.CLOUDMQTT_TOPIC_SERVER || 'down-test';

export const client = connect(URL);
