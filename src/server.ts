import * as app from './app';

// import * as errorHandler from 'errorhandler';
// app.use(errorHandler());

const server = app.listen(app.get('port'), () => {
  console.log(
    `App is running at http://localhost:${app.get('port')} in ${app.get('env')}`
  );
  console.log(' Press CTRL-C to stop\n');
});

export = server;
