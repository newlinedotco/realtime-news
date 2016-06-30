var express = require('express');
var router = express.Router();

module.exports = ({twit, db}) => {
  const getEvent = (id, fn) => {
    db.events.findOne({
      _id: id
    }, fn);
  }

  const getCurrent = (date, fn) => {
    db.events.find({
      "startAt": { $gt: date},
      "endAt": { $lt: date }
    }).sort({startAt: -1, endAt: 1}).exec(fn);
  }

  const search = (req, res) => {
    const evtId = req.query.evt || 1;
    getEvent(evtId, (err, doc) => {
      let hashtag = req.query.q || 'fullstackio';

      if (doc && doc.event) {
        hashtag = doc.event.hashtag;
      }

      const count = req.query.count || 10;

      twit.get('search/tweets', { q: hashtag, count }, function(err, data, response) {
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
