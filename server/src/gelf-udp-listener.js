import debugFn from 'debug'
import util from 'util'
import dgram from 'dgram'
import zlib from 'zlib'
import isGzip from 'is-gzip'
import bus from './bus.js'

const debug = debugFn('app:gelf-udp-listener')
const gunzip = util.promisify(zlib.gunzip)

export function create() {
    return dgram.createSocket('udp4')
        .on('message', onMessage)
        .on('error', onError)
}

function onError(err) {
    console.error(err)
}

function onMessage(buffer) {
    processMessage(buffer).catch(console.error)
}

const chunkedMessages = {}

export async function processMessage(buffer) {
    if (buffer[0] === 0x1E && buffer[1] === 0x0F) {
        const id = buffer.readBigUInt64LE(2)
        const index = buffer.readInt8(10)
        const count = buffer.readInt8(11)

        debug('Message %d chunk %d of %d', id, index, count)

        if (!chunkedMessages[id]) {
            chunkedMessages[id] = new Array(count).fill(null)
            setTimeout(() => delete chunkedMessages[id], 5000)
        }
        const chunks = chunkedMessages[id]
        chunks[index] = buffer.slice(12)
        if (chunks.some(x => x === null)) {
            return
        }
        buffer = Buffer.concat(chunks)
    }

    if (isGzip(buffer)) {
        debug('gzipped message detected')
        buffer = await gunzip(buffer)
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
