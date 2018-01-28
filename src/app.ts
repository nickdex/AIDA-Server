import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env'});

// Controllers (route handlers)
import * as agentController from './controllers/agent';

// Create Express server
const app = express();

// #region Express configuration
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
// #endregion

// #region App Router
app.post('/agent', agentController.agent);
// #endregion

export = app;
