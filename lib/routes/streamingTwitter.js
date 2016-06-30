var express = require('express');
var router = express.Router();

let streamHolder;
module.exports = ({twit, wss, logger}) => {

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    });
  };

  wss.on('connection', function connection(ws) {
      console.log('wss connection');

      if (!!streamHolder) {
        streamHolder.destroy();
      }

      startTwitterStream(ws);
  });

  function startTwitterStream(ws) {
    console.log('New stream created, searching for ', ws);

    streamHolder = twit.stream('statuses/filter', { track: 'hashtag' });
    streamHolder.on('tweet', (tweet) => {
      wss.broadcast(tweet);
    });
    streamHolder.on('disconnect', (response) => {
      wss.broadcast({'evt': 'disconnect'});
    })
    streamHolder.on('error', (err) => {
      console.error('Got an error from twitter stream', err);
    })
  }

  return (req, res, next) => next()
}
