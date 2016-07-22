var express = require('express');
var router = express.Router();
const {resolve, join} = require('path');

var sockjs  = require('sockjs');
// const {SocketCluster} = require('socketcluster')

import Tweet from '../models/tweet'

let streamHolder;
let searchTag;

module.exports = ({makeTwit, root, server}) => {

  let T;
  let connections = {};

  const sockOpts = {
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
  }
  const tweet = sockjs.createServer(sockOpts);

  const write = (conn, msg) => {
    try {
      conn.write(JSON.stringify(msg));
    } catch (e) {
      console.log('Error writing to socket', e);
    }
  }
  const broadcast = (msg) => {
    Object.keys(connections).forEach(id => {
      write(connections[id].conn, msg);
    })
  }

  tweet.on('connection', (conn) => {
    let tweetStream;
    connections[conn.id] = {
      conn,
      tweetStream
    };

    const dc = Tweet.dataChannel();

    dc.subscribe(tweet => {
      if (tweet) { write(conn, tweet); }
    });

    conn.on('data', (message) => {
      console.log('on connection, got ', typeof message);
      let d;
      try {
        d = JSON.parse(message);
        T = makeTwit(d)
        let searchTag = d.search_tag || 'fullstack';
        tweetStream = startTwitterStream(T, conn, searchTag);
        connections[conn.id].tweetStream = tweetStream;

      } catch (e) {
        console.log('error ->', e);
        conn.write(JSON.stringify({msg: 'error', error: e}))
        return;
      }
    });

    conn.on('close', () => {
      delete connections[conn.id]
      console.log('disconnected...');
    });
  });

  tweet.installHandlers(server, { prefix:'/ts' });

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
    // const dc = Tweet.dataChannel();
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
      // dc.subscribe(tweet => {
      //   wss.broadcast(tweet);
      // });
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
  function startTwitterStream(T, conn, searchTag) {
    if (!searchTag) return;

    streamHolder = T.stream('statuses/filter', { track: searchTag });

    conn.on('close', () => {
      streamHolder.stop();
    });

    streamHolder.on('tweet', (tweet) => {
      Tweet.dataChannel().publish(tweet);
    });

    streamHolder.on('connected', (req) => write(conn, {
      '_server': true, msg: 'connected'
    }));

    streamHolder.on('disconnect', (response) => {
      write(conn, {'_server': 'disconnected'});
    });
    streamHolder.on('error', (err) => {
      write(conn, err);
      console.error('Got an error from twitter stream', err);
    })
  }

}
