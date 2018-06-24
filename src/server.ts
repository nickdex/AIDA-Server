import { Server } from 'http';
import logger from './logger';

import * as app from './app';

// import * as errorHandler from 'errorhandler';
// app.use(errorHandler());

const server: Server = app.listen(app.get('port'), () => {
  logger.info(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')}`
  );
  logger.info(' Press CTRL-C to stop\n');
});

export = server;
