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

  static updateBy(where, to, fn) {
console.log('updateBy', to);
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
