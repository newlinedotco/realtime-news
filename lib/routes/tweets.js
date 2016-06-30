var express = require('express');
var router = express.Router();

module.exports = ({twit}) => {
  const search = (req, res) => {
    const q = req.query.q || 'fullstackio';
    const count = req.query.count || 10;

    twit.get('search/tweets', { q, count }, function(err, data, response) {
      if (err) {
        return res.send(500, {err});
      }

      res.send({tweets: data})
    });
  }

  router.get('/', (req, res) => search(req, res));
  router.get('/search', (req, res) => search(req, res));

  return router
}
