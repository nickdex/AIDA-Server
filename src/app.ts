// tslint:disable-next-line match-default-export-name
import express from '@feathersjs/express';
import feathers, { HookContext } from '@feathersjs/feathers';
import * as cors from 'cors';
import * as morgan from 'morgan';

import { logger } from './logger';

// Deprecated, we now use docker compose
// Load environment variables from .env file, where API keys and passwords are configured
// import * as dotenv from 'dotenv';
// dotenv.config({ path: 'env/.env.development' });
//logger.verbose('Environment file loaded');

import { Mqtt } from './iot/mqtt';

// Controllers (route handlers)
import * as agentController from './controllers/agent';
import { PushController } from './controllers/push';

// Hooks
import { clientHooks } from './client-device/client-hook';
import { iotAgentHooks } from './iot-agent/iot-agent-hook';
import { iotDeviceHooks } from './iot-device/iot-device-hook';
import { roomHooks } from './room/room-hook';

// Database
import { databaseService } from './database';

// Create Express server
const app = express(feathers());
logger.verbose('Express app created using feathers');

// const whitelist = JSON.parse(process.env.CORS_CLIENT_WHITELIST_URLS);

// #region Express configuration
app.set('port', process.env.PORT || 3000);
app.use(morgan('dev', { stream: { write: msg => logger.info(msg) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.errorHandler());
app.use(
  cors({
    origin: (_, callback) => {
      // if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(undefined, true);
      // } else {
      //   callback(new Error('Not allowed by CORS'));
      // }
    }
  })
);
// #endregion

app.configure(express.rest());

Mqtt.init();
logger.info('Mqtt Initialized');

app.hooks({
  before: {
    all(context: HookContext) {
      const {id, data, params, method, path} = context;
      logger.verbose('Request Initiated', path, method, id, data, params);
    }
  },
  after: {
    all(context: HookContext) {
      const {id, data, params, method, path} = context;
      logger.verbose('Request Completed', path, method, id, data, params);
    }
  }
});

// #region Service Registration
app.use('/clients', databaseService('clients'));
app.use('/users', databaseService('users'));

app.use('/devices', databaseService('devices'));
app.use('/agents', databaseService('agents'));
app.use('/rooms', databaseService('rooms'));
app.use('/groups', databaseService('groups'));

app.service('clients').hooks(clientHooks);
app.service('devices').hooks(iotDeviceHooks);
app.service('agents').hooks(iotAgentHooks);
app.service('rooms').hooks(roomHooks);
logger.verbose('Service initialization complete');
// #endregion

// #region Web Push Notifications
PushController.setup(app);
app.post('/push', PushController.send);
app.post('/push/click', PushController.click);
//#endregion

// #region App Router
app.post('/agent', agentController.agent);
// #endregion

app.get('/', (req, res) => {
  res.send('Hello from AIDA-Server');
});

export = app;
