import * as gelf from './gelf-udp-listener.js'
import * as azure from './azure-monitor.js'
import * as app from './express-app.js'

const config = {
    customerId: process.env.AZURE_CUSTOMER_ID,
    sharedKey: process.env.AZURE_SHARED_KEY,
    logType: process.env.AZURE_LOG_TYPE,
    batchMs: parseInt(process.env.AZURE_BATCH_MS || '5000', 10)
}

gelf.create().bind(12201, () => console.log('GELF UDP listener bound on port 12201'))

app.create().listen(54313, () => console.log('Web app bound on port 54313'))

if (config.customerId) {
    console.log(`Starting Azure send loop customerId=${config.customerId} logType=${config.logType} batchMs=${config.batchMs}`)
    azure.sendLoop(config).catch(console.error)
}
