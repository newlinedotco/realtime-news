const express = require('express');
const router = express.Router();

const levelup   = require('levelup')
const redisdown = require('redisdown');
const redis     = require('redis');

const DB_NAME = process.env.DB_NAME || 'twit';
const port = process.env.REDIS_PORT_6379_TCP_PORT || 6379;
const host = process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost';

const redisClient = redis.createClient(port, host);
const levelupOptions =  {db: redisdown, host, port};

module.exports = {redisClient, levelupOptions};
