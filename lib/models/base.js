import LinvoDB from 'linvodb3'
import {join, resolve} from 'path'

LinvoDB.dbPath = join(resolve(__dirname), '../../db')
const dbOpts = {
}

const _dbs = new WeakMap();
export class Base {

  constructor(props) {
    this.props = props;

    this._db = this.constructor.db();
  }

  save(fn) {
    return this._db.insert(this.props, fn);
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
    return {
      subscribe: (cb) => {
        subscriber = this.db()
                      .find({})
                      .sort({ created_at: -1 })
                      .limit(2)
                      .live();
        this.db()
          .on('liveQueryUpdate', () => {
            cb.apply(subscriber, subscriber.res);
          })
      },
      publish: (json) => {
        const inst = new model(json);
        inst.save();
      },
      unsubscribe: () => {
        subscriber.stop();
      }
    }
  }

  static schema() {
    return {};
  }

  static db() {
    const modelName = this.name;
    if (!_dbs[modelName]) {
      _dbs[modelName]
        = new LinvoDB(modelName, this.schema(), dbOpts)
    };

    // return new LinvoDB(modelName, this.schema, dbOpts)
    return _dbs[modelName];
  }
}

export default Base
