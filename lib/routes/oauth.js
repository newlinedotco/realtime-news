const express = require('express');
const router = express.Router();
const moment = require('moment');

const path = require('path'),
      fs   = require('fs');

const oauthshim = require('oauth-shim');

module.exports = ({}) => {
  router.all('/oauthproxy',
       oauthshim.interpret,
       oauthshim.proxy,
       oauthshim.redirect,
       oauthshim.unhandled);

  oauthshim.init([{
    id: 'twitter',
    client_id: process.env.TWITTER_KEY,
    client_secret: process.env.TWITTER_SECRET,
    grant_url: 'https://api.twitter.com/oauth/access_token',
    domain: 'http://localhost:3000, http://localhost:3001, http://localhost:8000, http://keepmeupdated.surge.sh, https://keepmeupdated.surge.sh'
  }])

  return router;
}
