var express = require('express');
var router = express.Router();

import Event from '../models/event';
import Tweet from '../models/tweet';
import MediaTweet from '../models/mediaTweet';

module.exports = ({twit, db}) => {
  const getEvent = (id, query, fn) => {
    if (query) return fn(null, {hashtag: query});

    if (id) {
      Event.firstBy({_id: id}, fn);
    } else {
      Event.nextEvent(fn);
    }
  }
  const search = (req, res, opts={}) => {
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

      res.send({tweets})
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
