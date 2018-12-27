import express, { rest } from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';
import * as path from 'path';

import { logger } from './logger';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: 'env/.env' });
logger.verbose('Environment file loaded');

import { Mqtt } from './iot/mqtt';

// Controllers (route handlers)
import * as agentController from './controllers/agent';
import { PushController } from './controllers/push';

// Hooks
import { iotDeviceHooks } from './iot-device/iot-device-hook';
import { clientHooks } from './userclient/client-hook';

// Services;
import { IotDeviceService } from './iot-device/iot-device-service';
import { UserService } from './user/user-service';
import { ClientService } from './userclient/client-service';

// Create Express server
const app = express(feathers());
logger.verbose('Express app created using feathers');

// #region Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(morgan('dev', { stream: { write: msg => logger.info(msg) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());
app.use(
  cors({
    origin: process.env.CORS_CLIENT_WHITELIST_URL
  })
);
// #endregion

app.configure(rest());

Mqtt.init();
logger.info('Mqtt Initialized');

// #region Service Registration
app.use('/clients', new ClientService());
app.use('/devices', new IotDeviceService());
app.use('/users', new UserService());

app.service('clients').hooks(clientHooks);
app.service('devices').hooks(iotDeviceHooks);
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

export = app;
