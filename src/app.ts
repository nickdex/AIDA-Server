import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' });

// Controllers (route handlers)
import * as agentController from './controllers/agent';
import * as webController from './controllers/web';

// Create Express server
const app = express();

// #region Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// #endregion

// #region Frontend
app.get('/', webController.index);
app.post('/web', webController.iot);
// #endregion

// #region App Router
app.post('/agent', agentController.agent);
// #endregion

export = app;
