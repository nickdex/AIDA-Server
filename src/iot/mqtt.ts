import { connect } from 'mqtt';

const URL = process.env.CLOUDMQTT_URL || 'mqtt://localhost:1883';
export const TOPIC = process.env.CLOUDMQTT_TOPIC || 'test';

export const client = connect(URL);
