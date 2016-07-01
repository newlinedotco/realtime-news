let streamHolder;

const Twit = require('twit');

const http = require('http');
const express = require('express');
const path = require('path');
const url = require('url');
const WebSocketServer = require('ws').Server;
const cors = require('cors');

const favicon = require('serve-favicon');
const logger = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const multer = require('multer');
const errorHandler = require('errorhandler');

const config = require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'dev';

const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'db')

let app = express();

app.set('port', process.env.PORT || 8001);
app.set('views', path.join(root, 'views'));
app.set('view engine', 'pug');
app.use(favicon(root + '/public/favicon.ico'));
app.use(logger(NODE_ENV));
app.use(cors());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(multer());
app.use(express.static(path.join(root, 'public')));

import './core/array'

// Routes
const routes = {
  '/events': require('./routes/events'),
  '/tweets': require('./routes/tweets'),
  '/ts': require('./routes/streamingTwitter')
}

const twitterConfig = {
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_SECRET_KEY
}

// error handling middleware should be loaded after the loading the routes
if ('development' == NODE_ENV) {
  app.use(errorHandler());
}


// Setup the http server
var server = http.createServer(app);
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Create a websockets server
const wss = new WebSocketServer({ server: server, path: '/ts' });

// Twitter client
const twit = new Twit(Object.assign({}, twitterConfig, {
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
}));

// let settingsCfg = {
//   hashtag: 'fullstackio'
// };
//
// const settings = {
//   all: () => settingsCfg,
//   get: (key) => settingsCfg[key],
//   set: (key, val) => {
//     settingsCfg[key] = val;
//     return settingsCfg
//   },
// }

// Return a useless greetings on the root
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<h1>Hello, I am the backend</h1>');
  res.end();
});

const routeCfg = {
  twit, wss, logger,
  root
}
Object.keys(routes).map(key => {
  app.use(key, routes[key](routeCfg))
});

// Catch all endpoint
app.get('*', function(req, res) {
    var error404 = {
        errors: [
            {
                status: "404",
                title: "Not found"
            }
        ]
    };
    res.status(404).send(error404);
});

// Handle server errors
server.on('error', function(err) {
    logger('server error: ' + err);
});

// Handle unhandled exceptions
process.on('uncaughtException', function(err) {
    logger('uncaughtException: ' + err.message);
    logger(err.stack);
    // process.exit(1);
});
