const gelf = require('./gelf-udp-listener')
const azure = require('./azure-monitor')
const app = require('./express-app')
const cfgLoader = require('./config-loader')

async function main() {
    const config = await cfgLoader.load()

    gelf.create().bind(12201, () => console.log('GELF UDP listener running'))

    app.create().listen(8080, () => console.log('Web app running'))

    if (config.azure) {
        console.log(`Starting Azure send loop customerId=${config.azure.customerId} logType=${config.azure.logType} batchMs=${config.azure.batchMs}`)
        azure.sendLoop(config).catch(console.error)
    }
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
