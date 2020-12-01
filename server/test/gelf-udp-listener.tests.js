const assert = require('assert')
const bus = require('../src/bus')
const gelf = require('../src/gelf-udp-listener')

describe('gelf-udp-listener', () => {
    const logs = []
    const onLog = (log) => logs.push(log)

    beforeEach(() => {
        logs.length = 0
        bus.on('log', onLog)
    })

    afterEach(() => {
        bus.off('log', onLog)
    })

    it('Should emit messages', () => {
        gelf.process(Buffer.from(JSON.stringify({
            host: 'host',
            timestamp: 0,
            short_message: 'short_message',
            _container_name: '_container_name'
        })))

        assert.equal(logs.length, 1)
        assert.deepStrictEqual(logs[0], {
            host: 'host',
            ts: '1970-01-01T00:00:00.000Z',
            log: 'short_message',
            container_name: '_container_name'
        })
    })
})