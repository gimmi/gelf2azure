import debugFn from 'debug'
import crypto from 'crypto'
import timeoutSignal from 'timeout-signal'
import { default as fetch, AbortError } from 'node-fetch'
import { ProxyAgent } from 'proxy-agent'
import bus from './bus.js'
import { setTimeout } from 'timers/promises'

const debug = debugFn('app:azure-monitor')

export async function sendLoop(config) {
    let batch = []

    bus.on('log', log => batch.push(log))

    let uploadMs = Date.now()
    while (true) {
        uploadMs = Date.now() - uploadMs
        await setTimeout(config.batchMs - uploadMs)
        uploadMs = Date.now()

        if (batch.length) {
            const data = batch
            batch = []

            await send(config, data)
                .catch(console.error)
        }
    }
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

    try {
        const res = await fetch(url, {
            agent: new ProxyAgent(),
            signal: timeoutSignal(config.timeoutMs),
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
        if (error instanceof AbortError) {
            throw new Error(`Azure API call timed out after ${config.timeoutMs}ms`)
        }

        throw error;
    }
}
