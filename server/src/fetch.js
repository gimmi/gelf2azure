import fetch from 'node-fetch'
import { ProxyAgent } from 'proxy-agent'

export default (url, options) => {
  const agent = new ProxyAgent()
  return fetch(url, { agent, ...options })
}