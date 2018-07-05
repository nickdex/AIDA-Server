import { Server } from 'http';
import { logger } from './logger';
import { startAiScheduler } from './scheduler';

import * as app from './app';

const server: Server = app.listen(app.get('port'), () => {
  logger.info(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')}`
  );
  logger.info(' Press CTRL-C to stop\n');
});

startAiScheduler();

export = server;
