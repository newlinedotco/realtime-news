const express = require('express');
const router = express.Router();

const readdir = require('recursive-readdir');
const path = require('path'),
      fs   = require('fs');

module.exports = ({root, db}) => {

  const findEvent = (id, cb) => db.events.findOne({
    _id: id
  }, cb)

  router.get('/', (req, res) => {
    db.events.find({}, function (err, docs) {
      if (err) {
        return res.send({err});
      }

      res.send({events: docs});
    });
  })
  router.post('/', (req, res) => {
    const body = req.body.event;
    db.events.insert(body, (err, newDoc) => {
      if (err) {
        return res.send({err});
      }

      res.send({event: newDoc});
    })
  });
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body.event;
    findEvent(req.params.id, (err, currentEvent) => {
      if (err) {
        return res.status(500).send({err});
      }

      const newEvent = Object.assign({}, currentEvent, body);
console.log('newBody ->', newEvent);
      db.events.update({
        _id: id
      }, newEvent, {}, (err, numReplaced) => {
        if (err) {
          return res.status(500).send({err});
        }
        res.send({numReplaced});
      })
    })
  })
  router.delete('/:id', (req, res) => {
    db.events.remove({_id: req.params.id}, {}, (err, numRemoved) => {
      if (err) {
        return res.send({err});
      }

      res.send({numRemoved})
    })
  })
  router.get('/:id', (req, res) => {
    findEvent(req.params.id, (err, event) => {
      if (err) {
        return res.status(500).send({err});
      }

      res.send({event});
    })
    // const json = events.get(req.params.id);
    //
    // return res.send({event: json});
  })
  return router
}
