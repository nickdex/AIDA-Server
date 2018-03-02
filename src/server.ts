import { Server } from 'http';
import { log } from 'util';

import * as app from './app';

// import * as errorHandler from 'errorhandler';
// app.use(errorHandler());

const server: Server = app.listen(app.get('port'), () => {
  log(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')}`
  );
  log(' Press CTRL-C to stop\n');
});

export = server;
