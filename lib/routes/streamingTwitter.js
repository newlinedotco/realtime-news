var express = require('express');
var router = express.Router();

import Tweet from '../models/tweet'

let streamHolder;
let searchTag;

module.exports = ({twit, wss, settings}) => {

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      try {
        client.send(JSON.stringify(data));
      } catch (e) {}
    });
  };

  wss.on('connection', function connection(ws) {

    const dc = Tweet.dataChannel();
    ws.on('message', (data, flags) => {
      let d;
      try {
        d = JSON.parse(data);
      } catch (e) {
        d = {tag: data};
      }
      searchTag = d.tag;

      if (!streamHolder) {
        startTwitterStream(ws);
      }

      dc.subscribe(tweet => {
        wss.broadcast(tweet);
      });
    });

    ws.on('close', () => {
      dc.unsubscribe()
      if (streamHolder) {
        streamHolder.stop();
      }
      streamHolder = searchTag = null;
    });
  });

  function startTwitterStream(ws) {
    if (!searchTag) return;

    streamHolder = twit.stream('statuses/filter', { track: searchTag });

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
