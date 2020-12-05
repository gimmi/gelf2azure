/* eslint-env jasmine */

const bus = require('./bus')
const gelf = require('./gelf-udp-listener')
const util = require('util')
const gzip = util.promisify(require('zlib').gzip)

describe('gelf-udp-listener', () => {
    const logs = []
    const onLog = (log) => logs.push(log)

    beforeEach(function() {
        logs.length = 0
        bus.on('log', onLog)
    })

    afterEach(function() {
        bus.off('log', onLog)
    })

    it('Should emit messages', async function() {
        await gelf.process(Buffer.from(JSON.stringify({
            host: 'host',
            timestamp: 0,
            short_message: 'short_message',
            _container_name: '_container_name'
        })))

        expect(logs.length).toEqual(1)
        expect(logs[0]).toEqual({
            host: 'host',
            ts: '1970-01-01T00:00:00.000Z',
            log: 'short_message',
            container_name: '_container_name'
        })
    })

    it('Should emit single chunk messages', async function() {
        const id = BigInt(123)
        const buf = Buffer.alloc(12)
        buf.writeInt8(0x1E, 0)
        buf.writeInt8(0x0F, 1)
        buf.writeBigUInt64LE(id, 2)
        buf.writeInt8(0, 10)
        buf.writeInt8(1, 11)
        const msg = Buffer.from(JSON.stringify({
            host: 'host',
            timestamp: 0,
            short_message: 'short_message',
            _container_name: '_container_name'
        }))

         await gelf.process(Buffer.concat([buf, msg]))

        expect(logs.length).toEqual(1)
        expect(logs[0]).toEqual({
            host: 'host',
            ts: '1970-01-01T00:00:00.000Z',
            log: 'short_message',
            container_name: '_container_name'
        })
    })

    it('Should emit 2 chunks messages',async function() {
        const id = BigInt(789)
        const msg = await gzip(Buffer.from(JSON.stringify({
            host: 'host',
            timestamp: 0,
            short_message: 'short_message',
            _container_name: '_container_name'
        })))

        const head1 = Buffer.alloc(12)
        head1.writeInt8(0x1E, 0)
        head1.writeInt8(0x0F, 1)
        head1.writeBigUInt64LE(id, 2)
        head1.writeInt8(0, 10)
        head1.writeInt8(2, 11)
        await gelf.process(Buffer.concat([head1, msg.slice(0, Math.floor(msg.length / 2))]))

        expect(logs.length).toEqual(0)

        const head2 = Buffer.alloc(12)
        head2.writeInt8(0x1E, 0)
        head2.writeInt8(0x0F, 1)
        head2.writeBigUInt64LE(id, 2)
        head2.writeInt8(1, 10)
        head2.writeInt8(2, 11)
        await gelf.process(Buffer.concat([head2, msg.slice(Math.floor(msg.length / 2))]))

        expect(logs.length).toEqual(1)
        expect(logs[0]).toEqual({
            host: 'host',
            ts: '1970-01-01T00:00:00.000Z',
            log: 'short_message',
            container_name: '_container_name'
        })
    })

    it('Should emit gzipped 2 chunks messages',async function() {
        const id = BigInt(456)
        const msg = Buffer.from(JSON.stringify({
            host: 'host',
            timestamp: 0,
            short_message: 'short_message',
            _container_name: '_container_name'
        }))

        const head1 = Buffer.alloc(12)
        head1.writeInt8(0x1E, 0)
        head1.writeInt8(0x0F, 1)
        head1.writeBigUInt64LE(id, 2)
        head1.writeInt8(0, 10)
        head1.writeInt8(2, 11)
        await gelf.process(Buffer.concat([head1, msg.slice(0, Math.floor(msg.length / 2))]))

        expect(logs.length).toEqual(0)

        const head2 = Buffer.alloc(12)
        head2.writeInt8(0x1E, 0)
        head2.writeInt8(0x0F, 1)
        head2.writeBigUInt64LE(id, 2)
        head2.writeInt8(1, 10)
        head2.writeInt8(2, 11)
        await gelf.process(Buffer.concat([head2, msg.slice(Math.floor(msg.length / 2))]))

        expect(logs.length).toEqual(1)
        expect(logs[0]).toEqual({
            host: 'host',
            ts: '1970-01-01T00:00:00.000Z',
            log: 'short_message',
            container_name: '_container_name'
        })
    })
})