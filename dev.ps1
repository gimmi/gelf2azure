param (
    [String]
    [Parameter(Mandatory=$true)]
    [ValidateSet('server', 'client', 'debugger')]
    $Cmd
)

Push-Location "$PSScriptRoot\$Cmd"
try {
    if (-not (Test-Path node_modules)) {
        npm install
    }

    switch ($Cmd) {
        'server' {
            $env:DEBUG = "app:*"
            node src\index.js
        }
        'client' {
            npm run watch
        }
        'debugger' {
            node src\index.js
        }
    }
}
finally {
    Pop-Location
}
