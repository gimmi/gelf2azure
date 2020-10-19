const debug = require('debug')('app:azure-monitor')
const crypto = require('crypto')
const fetch = require('./fetch')
const bus = require('./bus')

async function sendLoop(config) {
    let batch = []

    bus.on('log', log => batch.push(log))

    for (; ;) {
        await timeout(config.azure.batchMs)

        if (batch.length) {
            const data = batch
            batch = []

            await send(config, data)
                .catch(console.error)
        }
    }
}

async function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function send(config, logs) {
    const date = new Date().toUTCString()
    const url = `https://${config.azure.customerId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`
    const data = Buffer.from(JSON.stringify(logs), 'utf8')

    debug('Sending %d logs (%d bytes) to %s', logs.length, data.length, url)

    let signature = [
        'POST',
        data.length,
        'application/json',
        'x-ms-date:' + date,
        '/api/logs'
    ]
    signature = signature.join('\n')
    signature = Buffer.from(signature, 'utf8')
    signature = crypto.createHmac('sha256', Buffer.from(config.azure.sharedKey, 'base64'))
        .update(signature)
        .digest('base64')

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `SharedKey ${config.azure.customerId}:${signature}`,
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'x-ms-date': date,
            'Log-Type': config.azure.logType,
            'time-generated-field': 'ts'
        },
        body: data
    })

    debug('HTTP %d %s', res.status, res.statusText)

    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
}

Object.assign(module.exports, { sendLoop, send })
