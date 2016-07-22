const schedule = require('node-schedule');
const moment = require('moment');
import Tweet from '../models/tweet'

module.exports = (cfg) => {
  let rule = new schedule.RecurrenceRule();
  rule.second = 5;
  rule.minute = 12;

  const count = cfg.cleanCount || 5;
  const interval = cfg.cleanInterval || 'minutes';

  const j = schedule.scheduleJob(rule, function(){
    const lastUpdate = moment(new Date())
                        .subtract(count, interval);

    Tweet.deleteMulti(
      { created_at: { $lte: lastUpdate.toDate() } },
      (err, count) => {
        console.log('Cleaned database', err, count)
      }
    )
  });

}
