import * as scheduler from 'node-schedule';
import { AI } from './prediction/ai';
import { PushNotification } from './prediction/notification';
import { logger } from './logger';

export const startAiScheduler = () => {
  logger.info('Started AI Scheduler');
  scheduler.scheduleJob('*/5 * * * *', () => {
    const date = new Date();
    if (AI.predict(date.getDay(), date.getHours(), date.getMinutes())) {
      logger.debug(`AI Predicted that I'm at home at ${date.toLocaleString()}`);
      // User is near/inside home
      PushNotification.sendNotification('nikhil', {
        title: 'Are you reaching home?',
        body: 'Should I turn on fan?'
      });
    } else {
      logger.verbose(
        `AI Predicted that I'm heading out at ${date.toLocaleString()}`
      );

      PushNotification.sendNotification('nikhil', {
        title: 'Are you heading out?',
        body: 'Should I turn off fan?'
      });
    }
  });
};
