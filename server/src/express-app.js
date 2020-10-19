const debug = require('debug')('app:express')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const expressWs = require('express-ws')
const bus = require('./bus');

module.exports.create = function () {
    const app = express()
    expressWs(app)
    app.use(bodyParser.json())
    app.use(express.static(path.join(__dirname, 'static')))

    app.ws('/ws', webSocket => {
        debug('ws connected');
        bus.on('log', messageListener);

        webSocket.on('close', function () {
            debug('ws close');
            bus.off('log', messageListener);
        });

        webSocket.on('disconnect', function () {
            debug('ws disconnect');
            bus.off('log', messageListener);
        });

        function messageListener(message) {
            webSocket.send(JSON.stringify(message));
        }
    })

    return app
}
