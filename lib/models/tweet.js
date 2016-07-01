import Base from './base';
import moment from 'moment'

export class Tweet extends Base {

  static schema() {
    return {
      created_at: Date,
      id: {type: Number, index: true, unique: true},
      text: String,
      source: String,
      geo: String,
      coordinates: String,
      retweet_count: Number,
      favorite_count: Number,
      lang: String,
      user: {
        id: Object,
        name: String,
        screen_name: String,
        location: String,
        url: String,
        description: String,
        followers_count: Number,
        friends_count: Number,
        created_at: Date,
        profile_background_color: String,
        profile_background_image_url: String,
        profile_background_image_url_https: String,
        profile_image_url: String,
        profile_image_url_https: String
      }
    }
  }
}

export default Tweet
