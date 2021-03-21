param (
    [String]
    [Parameter(Mandatory=$true)]
    [ValidateSet('server', 'client', 'debugger')]
    $Cmd
)

if ($Cmd -eq 'server') {
    cd "$PSScriptRoot\server"
    if (-not (Test-Path node_modules)) {
        npm install
    }
    $env:DEBUG = "app:*"
    node src\index.js
}

if ($Cmd -eq 'client') {
    Start-Process -FilePath "http://localhost:54313/"

    cd "$PSScriptRoot\client"
    if (-not (Test-Path node_modules)) {
        npm install
    }
    npm run watch
}

if ($Cmd -eq 'debugger') {
    cd "$PSScriptRoot\debugger"
    if (-not (Test-Path node_modules)) {
        npm install
    }
    node src\index.js
}