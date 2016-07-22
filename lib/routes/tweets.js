const express = require('express');
const router = express.Router();
const moment = require('moment');

import Event from '../models/event';
import Tweet from '../models/tweet';
import MediaTweet from '../models/mediaTweet';

module.exports = ({twit, makeTwit, db}) => {
  const getEvent = (id, query, fn) => {
    if (query) return fn(null, {hashtag: query});

    if (id) {
      Event.firstBy({_id: id}, fn);
    } else {
      Event.nextEvent(fn);
    }
  }
  const search = (req, res, opts={}) => {
    const oauthToken = req.headers['x-auth-token'] || req.query.oauth_token;
    const oauthSecret = req.headers['x-auth-secret'] || req.query.oauth_secret

    const evtId = req.query.eventId;
    const count = req.query.count || 10;

    getEvent(evtId, req.query.q, (err, doc) => {
      const q = doc && doc.hashtag;

      if (!q) {
        return res.status(400).send({
          msg: 'No search term',
          error: err
        });
      }

      const twit = makeTwit({
        access_token: oauthToken,
        access_token_secret: oauthSecret
      })
      let twitOpts = {q, count};

      if (opts.filters && opts.filters.length > 0) {
        opts.filters.forEach(f => twitOpts.q = `${twitOpts.q} filter:${f}`)
      }

      twit.get('search/tweets',
        twitOpts,
        function(err, data, response) {
          if (err) {
            return res.status(500).send({err});
          }

          res.send({tweets: data})
      });

    });
  }

  router.get('/search', (req, res) => search(req, res));
  router.get('/images', (req, res) => {
    search(req, res, {
      filters: ['twimg']
    })
  })

  router.get('/all', (req, res) => {
    Tweet.all((err, tweets) => {
      if (err) return res.status(500).send(err);

      res.send({count: tweets.length, tweets})
    })
  })

  router.get('/old', (req, res) => {
    const count = req.query.count || 5;
    const interval = req.query.interval || 'minutes';

    const lastUpdate = req.query.lastDate || moment().subtract(count, interval);

    Tweet.findBy(
      { created_at: { $lte: lastUpdate.toDate() } },
      (err, tweets) => {
      if (err) return res.status(500).send(err);

      res.send({count: tweets.length, tweets});
    })
  })

  router.get('/count', (req, res) => {
    Tweet.all((err, tweets) => {
      if (err) return res.status(500).send(err);

      res.send({count: tweets.length});
    })
  })

  router.delete('/_clear', (req, res) => {
    Tweet.deleteAll((err, numRemoved) => {
      if (err) return handleError(err, res);

      res.send({numRemoved})
    })
  });



  return router
}
