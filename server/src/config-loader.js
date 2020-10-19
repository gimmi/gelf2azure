const { URL, fileURLToPath } = require('url')
const fs = require('fs').promises
const fetch = require('./fetch')

module.exports.load = async function () {
    const url = new URL(process.argv[2])

    if (url.protocol === 'file:') {
        const path = fileURLToPath(url)
        console.log('Loading config from file: ' + path)
        const json = await fs.readFile(path, 'utf8')
        return JSON.parse(json)
    }

    console.log('Loading config from url: ' + url)
    return await fetch(url, {
        headers: {
            Accept: 'application/json'
        }
    }).then(res => res.json())
}
