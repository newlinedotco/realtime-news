import Base from './base';

import moment from 'moment'

export class Event extends Base {

  static nextEvent(fn) {
    this.all()
      .sort({startAt: 1})
      .limit(1)
      .exec((err, docs) => {
        if (err) fn(err);

        fn(null, docs && docs.length > 0 ? docs[0] : null);
      });
  }

  static between(fromDate, toDate, fn) {
    let opts = {};

    if (fromDate != false) {
      const startAt = moment(fromDate).toDate()
      opts.startAt = { $gt: startAt }
    }

    if (toDate != false) {
      const endAt = moment(toDate).toDate()
      opts.endAt = { $lte: endAt }
    }

    return this.db().find(opts, fn);
  }

  static schema() {
    return {
      name: { type: String, index: true },
      startAt: Date,
      endAt: Date,
      hashtag: String,
      tags: [String],
    }
  }
}

export default Event
