import * as express from '@feathersjs/express';
import * as dotenv from 'dotenv';
import * as logger from 'morgan';
import * as path from 'path';

import feathers from '@feathersjs/feathers';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: 'env/.env' });

// Controllers (route handlers)
import * as agentController from './controllers/agent';
import * as webController from './controllers/web';
import { DeviceService } from './service';

// Create Express server
const app = express.default(feathers());

// #region Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());
// #endregion

// #region Service Registration
app.configure(DeviceService.initDb);
// #endregion

// #region Frontend
app.get('/', webController.index);
app.get('/devices', webController.devices);
app.post('/web', webController.iot);
// #endregion

// #region App Router
app.post('/agent', agentController.agent);
// #endregion

export = app;
