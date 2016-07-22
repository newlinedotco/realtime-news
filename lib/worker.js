const http = require('http');
const express = require('express');
const path = require('path');

const cors = require('cors');
const whiskers = require('whiskers');
const favicon = require('serve-favicon');
const logger = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

module.exports = (cfg) => {
  const {root, numCPUs, routes, NODE_ENV} = cfg;
  // Workers share the TCP connection in this server
  const app = express();

  app.set('port', process.env.PORT || 8001);
  app.set('views', path.join(root, 'views'));
  app.engine('.html', whiskers.__express);
  app.use(favicon(root + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(cors());
  app.use(methodOverride());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(multer());
  app.use(express.static(path.join(root, 'public')));

  // error handling middleware should be loaded after the loading the routes
  if ('development' == NODE_ENV) {
    app.use(errorHandler());
  }

  Object.keys(routes).map(key => {
    app.use(key, routes[key](cfg));
  });

  // Return a useless greetings on the root
  app.get('/', function(req, res) {
    res.render('index.html', {})
  });

  // Catch all endpoint
  app.get('*', function(req, res) {
    const error404 = {
      errors: [
        {
          status: "404",
          title: "Not found"
        }
      ]
    };
    res.status(404).send(error404);
  });

  // All workers use this port
  return app;
}
// let streamHolder;
//
// const Twit = require('twit');
//
// const url = require('url');
// const WebSocketServer = require('ws').Server;
//
// const multer = require('multer');

// const oauthshim = require('oauth-shim');
//
// const NODE_ENV = process.env.NODE_ENV || 'dev';
//
// const dbPath = path.join(root, 'db')
//
// let app = express();
//
// import './core/array'
//
// // Routes
// const routes = {
//   '/oauthproxy': require('./routes/oauth'),
//   '/events': require('./routes/events'),
//   '/tweets': require('./routes/tweets'),
//   '/ts': require('./routes/streamingTwitter')
// }
//
// const twitterConfig = {
//   consumer_key: process.env.TWITTER_KEY,
//   consumer_secret: process.env.TWITTER_SECRET,
// }
//
//
//
// // Setup the http server
// var server = http.createServer(app);
// server.listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });
//
// // Create a websockets server
// const wss = new WebSocketServer({ server: server, path: '/ts' });
//
// const makeTwit = (cfg) => {
//   const newOpts = Object.assign({}, twitterConfig, cfg);
//   return new Twit(newOpts);
// }
//
//
// const routeCfg = {
//   wss, logger,
//   root, makeTwit
// }
// Object.keys(routes).map(key => {
//   app.use(key, routes[key](routeCfg))
// });
//
//
// // Handle server errors
// server.on('error', function(err) {
//     logger('server error: ' + err);
// });
//
// // Handle unhandled exceptions
// process.on('uncaughtException', function(err) {
//     logger('uncaughtException: ' + err.message);
//     logger(err.stack);
//     // process.exit(1);
// });
