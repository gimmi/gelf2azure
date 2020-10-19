'use strict';

const fetch = require('node-fetch')
const ProxyAgent = require('proxy-agent')

module.exports = (url, options) => {
  const agent = new ProxyAgent()
  return fetch(url, { agent, ...options })
}