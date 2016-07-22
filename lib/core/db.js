const express = require('express');
const router = express.Router();

const levelup   = require('levelup')
const redisdown = require('redisdown');
const redis     = require('redis');

const DB_NAME = process.env.DB_NAME || 'twit';
const port = 6379;
const host = 'redis' || 'localhost';

const redisClient = redis.createClient(port, host);
const levelupOptions = {db: redisdown, host, port};

module.exports = {redisClient, levelupOptions};
