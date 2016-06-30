var express = require('express');
var router = express.Router();

import Event from '../models/event';

module.exports = ({twit, db}) => {
  // const getCurrent = (date, fn) => {
  //   Event.between()
  //   db.events.find({
  //     "startAt": { $gt: date},
  //     "endAt": { $lt: date }
  //   }).sort({startAt: -1, endAt: 1}).exec(fn);
  // }
  //

  const getEvent = (id, fn) => {
    if (id) {
      Event.findBy({_id: id}, fn);
    } else {
      Event.nextEvent(fn);
    }
  }
  const search = (req, res) => {
    const evtId = req.query.evt;
    const count = req.query.count || 10;

    getEvent(evtId, (err, doc) => {
      const q = doc ? doc.hashtag : req.query.q;

      if (!q) {
        return res.status(400).send({err});
      }


      twit.get('search/tweets',
        { q, count },
        function(err, data, response) {
          if (err) {
            return res.status(500).send({err});
          }

          res.send({tweets: data})
      });

    });
  }

  router.get('/', (req, res) => search(req, res));
  router.get('/search', (req, res) => search(req, res));

  return router
}
