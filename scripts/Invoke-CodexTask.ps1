[CmdletBinding()]
param(
    [Parameter(Mandatory, Position = 0)]
    [ValidateScript({ -not [string]::IsNullOrWhiteSpace($_) })]
    [string]$Task,

    [string[]]$Path = @(),

    [ValidateSet('Inspect', 'Plan', 'Apply')]
    [string]$Mode = 'Inspect',

    [ValidatePattern('^[\p{L}\p{N}_-]+\.md$')]
    [string]$SpecFile,

    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$routingText = $Task
$approvedSpec = $null

if ($Mode -ne 'Inspect') {
    if (-not $SpecFile) {
        throw "Specify -SpecFile for $Mode, for example -SpecFile 'chronology.md'."
    }
    $docsDirectory = Join-Path $repoRoot 'docs'
    $specDirectory = Join-Path $docsDirectory 'specs'
    $specPath = Join-Path $specDirectory $SpecFile
    foreach ($directory in @($docsDirectory, $specDirectory)) {
        if (Test-Path -LiteralPath $directory) {
            $item = Get-Item -LiteralPath $directory -Force
            if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
                throw "Expected a regular local directory: $directory"
            }
        }
    }
    if ($Mode -eq 'Plan' -and (Test-Path -LiteralPath $specPath)) {
        throw "Specification already exists: $specPath. Choose another filename or edit the existing file."
    }
    if ($Mode -eq 'Apply') {
        $item = Get-Item -LiteralPath $specPath -Force -ErrorAction SilentlyContinue
        if (-not $item -or $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            throw "An existing specification file is required for Apply: $specPath"
        }
        $approvedSpec = Get-Content -LiteralPath $specPath -Encoding UTF8 -Raw
        if ([string]::IsNullOrWhiteSpace($approvedSpec)) {
            throw "The specification is empty: $specPath"
        }
        $routingText = @($Task, $approvedSpec) -join [char]10
    }
} elseif ($SpecFile) {
    throw 'Use -SpecFile with -Mode Plan or -Mode Apply.'
}

$route = & (Join-Path $PSScriptRoot 'Get-CodexRoute.ps1') -Task $routingText -Path $Path
if ($DryRun) {
    if ($Mode -ne 'Inspect') {
        $stages = if ($Mode -eq 'Plan') { 'architect (read-only)' } else { 'coder (workspace-write)', 'reviewer (read-only)' }
        return [pscustomobject]@{
            mode = $Mode.ToLowerInvariant()
            specFile = $specPath
            stages = @($stages)
            profile = $route.profile
            model = $route.model
            reasoningEffort = $route.reasoningEffort
            reason = $route.reason
        }
    }
    return $route
}

$codex = Get-Command -Name codex -CommandType Application -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty Source

if (-not $codex -and $env:USERPROFILE) {
    # Some Windows installs expose Codex through a PowerShell function that drops piped stdin.
    $npmShim = Join-Path $env:USERPROFILE '.npm-global\codex.cmd'
    if (Test-Path -LiteralPath $npmShim -PathType Leaf) {
        $codex = $npmShim
    }
}
if (-not $codex) {
    throw 'Codex CLI executable was not found. Add codex.exe or codex.cmd to PATH.'
}

$context = "Task:`n$Task"
if ($Path.Count -gt 0) {
    $context += "`n`nRelevant paths: " + ($Path -join ', ')
}

function Invoke-CodexStage {
    param([string]$Stage, [string]$Sandbox, [string]$Prompt)

    Write-Verbose "Starting $Stage with $($route.model) ($Sandbox)."
    $codexArgs = @(
        '-a', 'never', 'exec',
        '-m', $route.model,
        '-c', "model_reasoning_effort=$($route.reasoningEffort)",
        '--cd', $repoRoot,
        '--sandbox', $Sandbox,
        '--ephemeral',
        '--json', '-'
    )
    $message = $null
    $failure = $null
    $usage = $null
    $completed = $false
    $elapsed = [System.Diagnostics.Stopwatch]::StartNew()
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    $previousOutputEncoding = $global:OutputEncoding
    $previousConsoleEncoding = [Console]::OutputEncoding

    try {
        # Windows PowerShell reads the global encoding for native stdin.
        $global:OutputEncoding = $utf8
        [Console]::OutputEncoding = $utf8

        $Prompt | & $codex @codexArgs | ForEach-Object {
            $event = ConvertFrom-Json -InputObject $_
            switch ($event.type) {
                'item.completed' {
                    if ($event.item.type -eq 'agent_message') {
                        $message = $event.item.text
                    }
                }
                'turn.completed' {
                    $completed = $true
                    $usage = $event.usage
                }
                'turn.failed' { $failure = $event.error.message }
                'error' { $failure = $event.message }
            }
        }
        $exitCode = $LASTEXITCODE
    } finally {
        $global:OutputEncoding = $previousOutputEncoding
        [Console]::OutputEncoding = $previousConsoleEncoding
        $elapsed.Stop()
    }

    if ($exitCode -ne 0 -or -not $completed -or [string]::IsNullOrWhiteSpace($message)) {
        if (-not $failure) {
            $failure = 'Codex did not return a completed turn with a final response.'
        }
        throw "Codex $Stage failed for $($route.model) (exit code $exitCode). $failure"
    }

    [pscustomobject]@{
        status = 'completed'
        mode = $Stage
        profile = $route.profile
        model = $route.model
        reasoningEffort = $route.reasoningEffort
        reason = $route.reason
        durationSeconds = [Math]::Round($elapsed.Elapsed.TotalSeconds, 2)
        usage = $usage
        result = $message
    }
}

function Invoke-WorkflowRole {
    param([string]$Role, [string]$Sandbox, [string]$Instructions, [string]$ExpectedStatus)

    $rolePath = Join-Path $repoRoot ".codex/agents/$Role.toml"
    $definition = Get-Content -LiteralPath $rolePath -Encoding UTF8 -Raw
    $prompt = @"
Act directly as the $Role for this stage. Follow the developer_instructions in the role definition and the repository's AGENTS.md. Complete only this stage. Do not delegate, publish, commit, push, merge, or deploy.

Role definition:
$definition

$Instructions

Write the substantive response in the language of the task. Start the final answer with $ExpectedStatus on a line by itself if this stage is complete, or BLOCKED if a necessary check, repository read, or decision prevents completion. Follow that line with the Markdown answer. Do not wrap it in a code fence.

$context
"@
    $report = Invoke-CodexStage -Stage $Role -Sandbox $Sandbox -Prompt $prompt
    $parts = $report.result.Trim() -split '\r?\n', 2
    if ($parts.Count -ne 2 -or $parts[0].Trim() -cne $ExpectedStatus -or [string]::IsNullOrWhiteSpace($parts[1])) {
        $retryHint = if ($Role -eq 'architect') { 'No specification was saved.' } else { 'Review any working tree changes before retrying Apply.' }
        throw "The $Role stage is incomplete. $retryHint`n$($report.result)"
    }
    $report.result = $parts[1].Trim()
    return $report
}

if ($Mode -eq 'Inspect') {
    return Invoke-CodexStage -Stage 'inspect' -Sandbox 'read-only' -Prompt "This is the harness Inspect stage. Inspect the repository directly and report your findings. Do not invoke the harness again, edit files, or publish changes.`n`n$context"
}

if ($Mode -eq 'Plan') {
    $instructions = 'Read the relevant repository files. Produce a task specification and implementation plan as separate Markdown sections. Include acceptance criteria and how each will be checked. If a relevant file cannot be read or a product decision remains open, explain the blocker. The harness will save a ready specification.'
    $architect = Invoke-WorkflowRole -Role 'architect' -Sandbox 'read-only' -Instructions $instructions -ExpectedStatus 'SPEC_READY'

    [IO.Directory]::CreateDirectory($specDirectory) | Out-Null
    $stream = [IO.File]::Open($specPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
    try {
        $markdown = [Text.Encoding]::UTF8.GetBytes($architect.result + [Environment]::NewLine)
        $stream.Write($markdown, 0, $markdown.Length)
    } finally {
        $stream.Dispose()
    }
    return [pscustomobject]@{ status = 'planned'; mode = 'plan'; specFile = $specPath; architect = $architect }
}

$baseline = git --no-optional-locks -C $repoRoot status --porcelain=v1 --untracked-files=all
if ($LASTEXITCODE -ne 0) {
    throw 'Could not inspect the working tree before implementation.'
}

$specContext = @"
The user approved the following specification and implementation plan by calling Apply.
Treat the task description and relevant paths as context. Use the approved specification to determine implementation and review scope.

--- BEGIN APPROVED SPECIFICATION ---
$approvedSpec
--- END APPROVED SPECIFICATION ---
"@
$coderInstructions = @"
Implement the approved specification and run the relevant checks. Keep the specification file and existing user changes intact. Report changed paths, checks performed, and checks you could not run. If blocked or partly implemented, report what changed and what remains.

$specContext
"@
$coder = Invoke-WorkflowRole -Role 'coder' -Sandbox 'workspace-write' -Instructions $coderInstructions -ExpectedStatus 'IMPLEMENTED'

$reviewInstructions = @"
Inspect the Git diff and new files for this task using the approved criteria. Use the initial Git status and coder report to focus the review. Flag any uncertainty about which changes belong to this task. Return findings or state that you found none and note unverified criteria. Findings count as a completed review. Keep the working tree unchanged.

$specContext

--- BEGIN GIT STATUS BEFORE APPLY ---
$($baseline -join [char]10)
--- END GIT STATUS BEFORE APPLY ---

--- BEGIN CODER REPORT ---
$($coder.result)
--- END CODER REPORT ---
"@
$reviewer = Invoke-WorkflowRole -Role 'reviewer' -Sandbox 'read-only' -Instructions $reviewInstructions -ExpectedStatus 'REVIEWED'

[pscustomobject]@{ status = 'reviewed'; mode = 'apply'; specFile = $specPath; coder = $coder; reviewer = $reviewer }
