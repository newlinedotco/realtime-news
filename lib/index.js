let streamHolder;

const Twit = require('twit');

const http = require('http');
const express = require('express');
const path = require('path');
const url = require('url');
const WebSocketServer = require('ws').Server;
const cors = require('cors');
const whiskers = require('whiskers');

const favicon = require('serve-favicon');
const logger = require('morgan');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const multer = require('multer');
const errorHandler = require('errorhandler');
const oauthshim = require('oauth-shim');
const config = require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'dev';

const root = path.join(__dirname, '..');
const dbPath = path.join(root, 'db')

let app = express();

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
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  // access_token: process.env.TWITTER_ACCESS_KEY,
  // access_token_secret: process.env.TWITTER_SECRET_KEY
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

const makeTwit = (cfg) => {
  const newOpts = Object.assign({}, twitterConfig, cfg);
  return new Twit(newOpts);
}

app.all('/oauthproxy',
     oauthshim.interpret,
     makeTwitInRequest,
     oauthshim.proxy,
     oauthshim.redirect,
     oauthshim.unhandled);

function makeTwitInRequest(req, res, next){

	// Check that this is a login redirect with an access_token (not a RESTful API call via proxy)
	if( req.oauthshim &&
		req.oauthshim.redirect &&
		req.oauthshim.data &&
		req.oauthshim.data.access_token &&
		req.oauthshim.options &&
		!req.oauthshim.options.path ){

			// do something with the token (req.oauthshim.data.access_token)
			const twitCfg = Object.assign({}, twitterConfig, {
        access_token: req.oauthshim.data.oauth_token,
        access_token_secret: req.oauthshim.data.oauth_token_secret
      });

      const twit = new Twit(twitCfg);
      req.twit = twit;
	}

	// Call next to complete the operation
	next()
}

oauthshim.init([{
  id: 'twitter',
  client_id: process.env.TWITTER_KEY,
  client_secret: process.env.TWITTER_SECRET,
  grant_url: 'https://api.twitter.com/oauth/access_token',
  domain: 'http://localhost:3000, http://localhost:8000, http://keepmeupdated.surge.sh, https://keepmeupdated.surge.sh'
}])

// Return a useless greetings on the root
app.get('/', function(req, res) {
  res.render('index.html', {})
});

const routeCfg = {
  wss, logger,
  root, makeTwit
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
