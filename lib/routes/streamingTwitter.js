var express = require('express');
var router = express.Router();

import Tweet from '../models/tweet'

let streamHolder;
let searchTag;

module.exports = ({twit, makeTwit, wss, settings}) => {

  return router;
  //
  // let T; // twit instance
  // wss.broadcast = function broadcast(data) {
  //   if (!data) return;
  //   wss.clients.forEach(function each(client) {
  //     try {
  //       client.send(JSON.stringify(data));
  //     } catch (e) {
  //       console.log('client send failed?', e);
  //     }
  //   });
  // };
  //
  // wss.on('connection', function connection(ws) {
  //
  //   const dc = Tweet.dataChannel();
  //   ws.on('message', (data, flags) => {
  //     let d;
  //     try {
  //       d = JSON.parse(data);
  //       T = makeTwit(d)
  //     } catch (e) {
  //       ws.send(JSON.stringify({msg: 'error'}))
  //       return;
  //     }
  //     searchTag = d.tag;
  //
  //     if (!streamHolder) {
  //       startTwitterStream(T, ws);
  //     }
  //
  //     dc.subscribe(tweet => {
  //       wss.broadcast(tweet);
  //     });
  //   });
  //
  //   ws.on('close', () => {
  //     dc.unsubscribe()
  //     if (streamHolder) {
  //       streamHolder.stop();
  //     }
  //     streamHolder = searchTag = null;
  //   });
  // });
  //
  // function startTwitterStream(T, ws) {
  //   if (!searchTag) return;
  //
  //   streamHolder = T.stream('statuses/filter', { track: searchTag });
  //
  //   streamHolder.on('tweet', (tweet) => {
  //     Tweet.dataChannel().publish(tweet);
  //   });
  //   streamHolder.on('connected', (req) => ws.send(JSON.stringify({'_server': true, msg: 'connected'})))
  //   streamHolder.on('disconnect', (response) => {
  //     wss.broadcast({'evt': 'disconnect'});
  //   })
  //   streamHolder.on('error', (err) => {
  //     console.error('Got an error from twitter stream', err);
  //   })
  //
  // }
  //
}
