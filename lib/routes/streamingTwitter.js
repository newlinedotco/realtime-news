var express = require('express');
var router = express.Router();

import Tweet from '../models/tweet'

let streamHolder;
module.exports = ({twit, wss, settings}) => {

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    });
  };

  wss.on('connection', function connection(ws) {
      if (!streamHolder) {
        startTwitterStream(ws);
      }

      const dc = Tweet.dataChannel();
      dc.subscribe(tweet => {
        wss.broadcast(tweet);
      });

      ws.on('close', () => {
        dc.unsubscribe()
        streamHolder.stop();
        streamHolder = null;
      })
  });

  function startTwitterStream(ws) {
    streamHolder = twit.stream('statuses/filter', { track: 'hashtag' });

    streamHolder.on('tweet', (tweet) => {
      Tweet.dataChannel().publish(tweet);
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
