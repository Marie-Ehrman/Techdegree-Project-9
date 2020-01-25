'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
const { sequelize } = require('./models/index');


//set up sequelize authenticate based on sequelize docs
(async () => {
  try{
    console.log('Connection has been established successfully.');
    sequelize.authenticate();
  }catch(error){
    console.error('Unable to connect to the database:', error);
  }
})();


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

//parse request to have acces to the body
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup api routes here
app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API Course database project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  if(err.name === 'SequelizeValidationError'){
    err.status = 400;
    err.message = err.errors.map(err => err.message);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {err},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
