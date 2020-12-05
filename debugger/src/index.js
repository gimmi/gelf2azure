const buildMsg = require('./msgbuilder')


const graygelf = require('graygelf')({
  host: '127.0.0.1',
  port: 12201,

  alwaysCompress: true,
  compressType: 'gzip', // Default for docker gelf plugin https://docs.docker.com/config/containers/logging/gelf/

  chunkSize: 128 // To trigger chunking more often
})

setInterval(() => {
    const gelf = buildMsg()
    console.dir(gelf)
    graygelf.raw(gelf)
}, 1000)

// const dgram = require('dgram');
// const client = dgram.createSocket('udp4');

// setInterval(() => {
//     const gelf = buildMsg()
//     console.dir(gelf)
//     client.send(JSON.stringify(gelf), 12201)
// }, 1000);
