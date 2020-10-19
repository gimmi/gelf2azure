const debug = require('debug')('app:gelf-udp-listener')
const bus = require('./bus')
const dgram = require('dgram')
const zlib = require('zlib')
const isGzip = require('is-gzip')

module.exports.create = function () {
    return dgram.createSocket('udp4')
        .on('message', onMessage)
        .on('error', onError)
}

function onError(err) {
    console.error(err)
}

function onMessage(buffer) {
    if (isGzip(buffer)) {
        zlib.gunzip(buffer, (err, buffer) => {
            if (err) {
                console.error(err)
                return
            }

            process(buffer)
        })
    } else {
        process(buffer)
    }
}

function process(buffer) {
    if (buffer[0] === 0x1E && buffer[1] === 0x0F) {
        console.error('Skipping chunked message, they seems to be not sent by Docker gelf plugin')
        return
    }

    const json = buffer.toString('utf8', 0)
    const gelf = JSON.parse(json)
    const log = {
        host: gelf.host,
        ts: new Date(gelf.timestamp * 1000).toISOString(),
        log: gelf.short_message,
        container_name: gelf._container_name
    }
    debug('emit log: %o', log)
    bus.emit('log', log)
}
