import * as express from '@feathersjs/express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as morgan from 'morgan';
import * as path from 'path';

import logger from './logger';
import feathers from '@feathersjs/feathers';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: 'env/.env' });
logger.verbose('Environment file loaded');

// Controllers (route handlers)
import * as agentController from './controllers/agent';
import * as webController from './controllers/web';
import * as pushController from './controllers/push';
import { DeviceService } from './service';

// Create Express server
const app = express.default(feathers());
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
app.use(cors());
// #endregion

// #region Service Registration
app.configure(DeviceService.initDb);
logger.verbose('DB service initialization complete');
// #endregion

// #region Frontend
app.get('/', webController.index);
app.get('/devices', webController.devices);
app.post('/web', webController.iot);
// #endregion

// #region Web Push Notifications
app.post('/push', pushController.index);
app.post('/push/click', pushController.click);
app.post('/push/:name', pushController.send);
//#endregion

// #region App Router
app.post('/agent', agentController.agent);
// #endregion

export = app;
