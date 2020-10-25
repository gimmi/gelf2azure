if ($args[0] -eq "s") {
    cd "$PSScriptRoot\server"
    if (-not (Test-Path node_modules)) {
        npm install
    }
    $env:DEBUG = "app:*"
    node src\index.js
}

if ($args[0] -eq "c") {
    Start-Process -FilePath "http://localhost:54313/"

    cd "$PSScriptRoot\client"
    if (-not (Test-Path node_modules)) {
        npm install
    }
    npm run watch
}

if ($args[0] -eq "p") {
    node "$PSScriptRoot\debug-publisher.js"
}