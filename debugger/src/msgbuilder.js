const rndFn = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const containerNames = ['container-one', 'container-two', 'container-three', 'container-four']

const sampleTexts = [
    '<2>ConsoleApp.Program[10] Critical message #',
    '<3>ConsoleApp.Program[10] Error message #',
    '<4>ConsoleApp.Program[10] Warning message #',
    '<6>ConsoleApp.Program[10] Information message #',
    '<7>ConsoleApp.Program[10] Debug message #',
]

let counter = 0;

module.exports = function() {
    counter += 1;
    const containerName = containerNames[rndFn(0, containerNames.length - 1)]
    const sampleText = sampleTexts[rndFn(0, sampleTexts.length - 1)]
    let shortMessage = `${sampleText} ${counter} ${'Blah '.repeat(rndFn(1, 300))}`

    if (rndFn(1, 5) === 1) {
        shortMessage = shortMessage.replace(/\s/g, 'x')
    }

    return {
        version: '1.1',
        host: 'example.org',
        short_message: shortMessage,
        timestamp: new Date().getTime() / 1000,
        _container_name: containerName
    }
}
