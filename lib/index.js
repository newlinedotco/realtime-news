const http = require('http');
const path = require('path');
const cluster = require('cluster');
const Twit = require('twit');

// CONSTANTS
const root = path.join(__dirname, '..');
const makeDB = require('./core/db');
const numCPUs = require('os').cpus().length;
const NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('dotenv').config();

const	restartWorkers = function () {
	var wid, workerIds = [];

	// create a copy of current running worker ids
	for(wid in cluster.workers) {
		workerIds.push(wid);
	}

	workerIds.forEach(function(wid) {
		cluster.workers[wid].send({
			text: 'shutdown',
			from: 'master'
		});

		setTimeout(function() {
			if(cluster.workers[wid]) {
				cluster.workers[wid].kill('SIGKILL');
			}
		}, 5000);
	});
};

const twitterConfig = {
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
}

const makeTwit = (cfg) => {
  try {
    const newOpts = Object.assign({}, twitterConfig, cfg);
    return new Twit(newOpts);
  } catch (e) {
    console.log('makeTwit error: ** ', e);
  }
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

  cluster.on('online', function(worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    worker = cluster.fork();
  });
  require('./tasks/cleanLatest')(config);

} else {
  process.on('message', function(message) {
    if(message.type === 'shutdown') {
      process.exit(0);
    }
  });

  // Handle unhandled exceptions
  process.on('uncaughtException', function(err) {
    console.log('uncaughtException: ' + err.message);
    console.log(err.stack);
    // process.exit(1);
  });

  const cfg = Object.assign({}, {
    numCPUs, root, NODE_ENV, config,
    routes, makeTwit
  });
  const {app, server} = require('./worker')(cfg);

  server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });
}

// const Twit = require('twit');
//

// // Create a websockets server
// const wss = new WebSocketServer({ server: server, path: '/ts' });
//
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
