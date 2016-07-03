const express = require('express');
const router = express.Router();
const moment = require('moment');

const path = require('path'),
      fs   = require('fs');

import Event from '../models/event';

module.exports = ({root, db}) => {

  const findEvent = (id, fn) => {
    Event.all({}, (err, data) => {
      console.log('err ', err);

      console.log('data', data);
    });
  }

  const handleError = (err, res, status=500) => {
    if (err) {
      return res
              .status(status)
              .send({err});
    }
  }

  router.get('/upcoming', (req, res) => {
    const timespan = req.query.timespan;
    const interval = req.query.interval;

    let fromDate = moment();
    let endDate = false;

    if (typeof timespan === 'string' &&
        typeof interval === 'string') {
          endDate = moment(fromDate).add(interval, timespan).toDate();
    }
    fromDate = fromDate.toDate();

    Event.between(fromDate, endDate, (err, events) => {
      if (err) {
        return handleError(err, res);
      }

      res.send({events});
    });
  });

  router.get('/', (req, res) => {
    const where  = req.query.where || {};
    Event.all((err, events) => {
      if (err) {
        console.log('err', err);
        return res.status(500).send({err});
      }

      res.send({events})
    });
  })

  router.post('/', (req, res) => {
    const body = req.body.event;

    const inst = new Event(body);

    inst.save((err, event) => {
      if (err) {
        return handleError(err, res);
      }

      res.send({event})
    })
  });

  /////// PUT
  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body.event;

    const where = Object.assign({}, {_id: id});

    Event.updateBy(where, body, (err, numReplaced) => {
      if (err) return handleError(err, res);

      Event.firstBy(where, (err, event) => {
        if (err) return handleError(err, res);

        res.send({event})
      });
    });
  });
  ///////

  ////// DELETE
  router.delete('/_clear', (req, res) => {
    Event.deleteAll((err, numRemoved) => {
      if (err) return handleError(err, res);

      res.send({numRemoved})
    })
  });

  router.delete('/:id', (req, res) => {
    const id = req.params.id;

    Event.deleteBy({_id: id}, (err, numRemoved) => {
      if (err) return handleError(err, res);

      res.send({numRemoved})
    })
  });
  /////////

  router.get('/:id', (req, res) => {
    const id = req.params.id;

    Event.firstBy({_id: id}, (err, event) => {
      if (err) return handleError(err, res);

      res.send({event})
    });
    // const json = events.get(req.params.id);
    //
    // return res.send({event: json});
  });

  return router
}
