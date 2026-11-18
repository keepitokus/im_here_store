[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateScript({ -not [string]::IsNullOrWhiteSpace($_) })]
    [string]$Task,

    [string[]]$Path = @()
)

$ErrorActionPreference = 'Stop'
$configPath = Join-Path $PSScriptRoot 'codex-routes.json'
$routes = Get-Content -LiteralPath $configPath -Encoding UTF8 -Raw | ConvertFrom-Json
$normalizedPaths = ($Path -join [char]10).Replace('\', '/')

$selected = $routes | Where-Object {
    ($_.taskPattern -and $Task -match $_.taskPattern) -or
    ($_.pathPattern -and $normalizedPaths -match $_.pathPattern)
} | Select-Object -First 1

if (-not $selected) {
    $selected = $routes | Where-Object { $_.profile -eq 'standard' }
}

[pscustomobject]@{
    profile = $selected.profile
    model = $selected.model
    reasoningEffort = $selected.reasoningEffort
    reason = $selected.reason
}
