import LinvoDB from 'linvodb3'
import redis from 'redis'
import moment from 'moment'
import {levelupOptions} from '../core/db';
import {join, resolve} from 'path'

LinvoDB.dbPath = join(resolve(__dirname), '../../db')
LinvoDB.defaults.store = levelupOptions
const dbOpts = {}

const _dbs = new WeakMap();
export class Base {

  constructor(props) {
    this.props = props;

    this._db = this.constructor.db();
  }

  save(fn) {
    return this._db.insert(this.props, fn);
  }

  static firstBy(where, fn) {
    return this.findBy(where, (err, docs) => {
      if (err) return fn(err);

      if (docs && docs.length > 0) {
        return fn(null, docs[0]);
      } else {
        return fn(null, null);
      }
    })
  }

  static findBy(where, fn) {
    return this.db().find(where, fn);
  }

  static all(fn) {
    return this.db().find({}, fn);
  }

  static liveAll() {
    return this.db()
              .find({})
              .sort({created_at: -1})
              .live();
  }

  static updateBy(where, to, fn) {
    return this.db()
            .update(where, {$set: to}, fn);
  }

  static deleteBy(where, fn) {
    return this.db().remove(where, fn);
  }

  static deleteMulti(where, fn) {
    return this.db().remove(where, {multi: true}, fn);
  }

  static deleteAll(fn) {
    return this.db().remove({}, {multi: true}, fn)
  }

  static dataChannel() {
    const model = this;
    let subscriber;
    let lastUpdate = moment().subtract(1, 'minute');
    return {
      subscribe: (opts, cb) => {
        if (!cb) {
          cb = opts;
        }

        subscriber = this.db()
                      .find({ created_at: { $gt: lastUpdate.toDate() } })
                      .sort({ created_at: -1 })
                      .limit(10)
                      .live();
        this.db()
          .on('liveQueryUpdate', () => {
            cb.apply(subscriber, subscriber.res);
            lastUpdate = moment();
          })
      },
      publish: (json) => {
        model.db().insert(json);
      },
      unsubscribe: () => {
        if (subscriber) {
          subscriber.stop();
        }
      }
    }
  }

  static schema() {
    return {};
  }

  static db() {
    const modelName = this.name;
    if (!_dbs[modelName]) {
      console.log('db not created... creating database for', modelName);
      registerModel(modelName, this.schema());
    };

    // return new LinvoDB(modelName, this.schema, dbOpts)
    return _dbs[modelName];
  }
}

export function registerModel(name, modelSchema) {
  const now = new Date();
  let schema = Object.assign({}, modelSchema, {
    createdAt: {type: Date, default: now},
    updatedAt: {type: Date, default: now},
  });
  const opts = Object.assign({}, dbOpts)

  _dbs[name] = new LinvoDB(name, schema, opts)
  return _dbs[name];
}

export default Base
