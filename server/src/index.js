const gelf = require('./gelf-udp-listener')
const azure = require('./azure-monitor')
const app = require('./express-app')

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
