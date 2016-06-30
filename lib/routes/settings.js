var express = require('express');
var router = express.Router();

module.exports = ({settings}) => {

  router.get('/', (req, res) => {
    res.send({msg: 'settings', settings: settings.all()})
  })
  router.get('/get', (req, res) => {
    const key = req.query.key || 'hashtag';
    res.send(settings.get(key))
  });
  router.get('/set', (req, res) => {
    const key = req.query.key || 'hashtag';
    const val = req.query.val;

    settings.set(key, val);
    res.send(settings.all())
  });

  return router
}
