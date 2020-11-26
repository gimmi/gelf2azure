const dgram = require('dgram');

const rndFn = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const containerNames = ['container-one', 'container-two', 'container-three', 'container-four']

const sampleTexts = [
    '<2>ConsoleApp.Program[10] Critical message #',
    '<3>ConsoleApp.Program[10] Error message #',
    '<4>ConsoleApp.Program[10] Warning message #',
    '<6>ConsoleApp.Program[10] Information message #',
    '<7>ConsoleApp.Program[10] Debug message #',
]

const client = dgram.createSocket('udp4');
let counter = 0;
setInterval(() => {
    counter += 1;
    const containerName = containerNames[rndFn(0, containerNames.length - 1)]
    const sampleText = sampleTexts[rndFn(0, sampleTexts.length - 1)]

    const gelf = {
        version: '1.1',
        host: 'example.org',
        short_message: `${sampleText} ${counter} ${'Blah '.repeat(rndFn(1, 30))}`,
        timestamp: new Date().getTime() / 1000,
        _container_name: containerName
    }
    console.dir(gelf)
    client.send(JSON.stringify(gelf), 12201)
}, 1000);
