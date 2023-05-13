import debugFn from 'debug'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import expressWs from 'express-ws'
import bus from './bus.js'
import { fileURLToPath } from 'url'

const debug = debugFn('app:express')

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export function create() {
    const app = express()
    expressWs(app)
    app.use(bodyParser.urlencoded({ extended: false }))

    app.ws('/ws', ws)

    app.route('/curl')
        .get(curl)
        .post(curl)

    app.use(express.static(path.join(__dirname, 'static')))

    return app
}

function ws(webSocket) {
    debug('ws connected');
    bus.on('log', messageListener);

    webSocket.on('close', function() {
        debug('ws close');
        bus.off('log', messageListener);
    });

    webSocket.on('disconnect', function() {
        debug('ws disconnect');
        bus.off('log', messageListener);
    });

    function messageListener(message) {
        webSocket.send(JSON.stringify(message));
    }
}

function curl(req, res) {
    // curl 127.0.0.1:54313/curl -d myhost.local/my_container
    debug('curl connected')
    req.on('close', onClose)
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Connection': 'close'
    })

    const noFilter = Object.keys(req.body).length < 1
    const filter = { ...req.body, ...req.query }
    Object.keys(filter).forEach(key => {
        res.write(`include: ${key}\n`)
        filter[key] = true
    })

    bus.on('log', onLog)

    function onClose() {
        debug('curl disconnected')
        bus.off('log', onLog)
    }

    function onLog(message) {
        const host = message.host || 'unknown'
        const container = message.container_name || 'unknown'
        const name = `${host}/${container}`
        const text = message.log || 'unknown'

        if (noFilter || filter[name]) {
            res.write(`${name}\n${text}\n`)
        }
    }
}
