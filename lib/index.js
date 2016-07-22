const http = require('http');
const path = require('path');
const cluster = require('cluster');

// CONSTANTS
const root = path.join(__dirname, '..');
const makeDB = require('./core/db');
const numCPUs = require('os').cpus().length;
const NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('dotenv').config();

const twitterConfig = {
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
}

const routes = {
  '/oauthproxy': require('./routes/oauth'),
  '/events': require('./routes/events'),
  '/tweets': require('./routes/tweets'),
  '/ts': require('./routes/streamingTwitter')
}

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    // Create a worker
    cluster.fork();
  }
} else {
  const cfg = Object.assign({}, {
    numCPUs, root, NODE_ENV, config,
    routes, twitterConfig
  });

  const app = require('./worker')(cfg);
  const server = http.createServer(app);
  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

// const Twit = require('twit');
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
