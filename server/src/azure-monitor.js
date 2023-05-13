import debugFn from 'debug'
import crypto from 'crypto'
import AbortController from 'abort-controller'
import fetch from './fetch.js'
import bus from './bus.js'

const debug = debugFn('app:azure-monitor')

export async function sendLoop(config) {
    let batch = []

    bus.on('log', log => batch.push(log))

    let uploadMs = Date.now()
    while (true) {
        uploadMs = Date.now() - uploadMs
        await timeout(Math.max(config.batchMs - uploadMs, 0))
        uploadMs = Date.now()

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
    const url = `https://${config.customerId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`
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
    signature = crypto.createHmac('sha256', Buffer.from(config.sharedKey, 'base64'))
        .update(signature)
        .digest('base64')

    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), config.batchMs)

    try {
        const res = await fetch(url, {
            signal: abortController.signal,
            method: 'POST',
            headers: {
                'Authorization': `SharedKey ${config.customerId}:${signature}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'x-ms-date': date,
                'Log-Type': config.logType,
                'time-generated-field': 'ts'
            },
            body: data
        })

        debug('HTTP %d %s', res.status, res.statusText)

        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`)
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Azure API call timed out after ${config.batchMs}ms`)
        }

        throw error;
    } finally {
        clearTimeout(timeoutHandle)
    }
}
