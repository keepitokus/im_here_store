# Loaded by Apply. All Git operations in this file are read-only.
function Read-RuleBlock([string]$text, [string]$name, [string[]]$versions = @('v1')) {
    $blocks = @(Get-MarkdownParts $text -Fences | Where-Object { $_.info -match ('^' + $name + '\b') })
    if (!$blocks.Count) { return $null }
    $block = $blocks[0]
    $allowed = @($versions | ForEach-Object { "$name/$_" })
    if ($blocks.Count -ne 1 -or !$block.end -or $allowed -cnotcontains $block.info) {
        throw "Expected exactly one complete block of type $($allowed -join ' or ')."
    }
    $json = $text.Substring($block.body, $block.close - $block.body).Trim()
    if (!$json.StartsWith('{') -or !$json.EndsWith('}')) { throw "Expected a JSON object in $($block.info)." }
    # Windows PowerShell accepts unquoted keys and silently keeps the last
    # duplicate member. These contracts use only objects, arrays and strings.
    $stringLiteral = '"(?:[^"\\\x00-\x1F]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"'
    $skeleton = [regex]::Replace($json, $stringLiteral, '@')
    if ($skeleton -cmatch '[^@{}\[\]:, \r\n\t]|,\s*[}\]]') { throw "Invalid JSON structure in $($block.info)." }
    try { $value = ConvertFrom-Json -InputObject $json -ErrorAction Stop }
    catch { throw "Invalid JSON in $($block.info). $($_.Exception.Message)" }
    $parsed = ConvertTo-Json -InputObject $value -Depth 20 -Compress
    if ([regex]::Matches($skeleton, ':').Count -ne [regex]::Matches([regex]::Replace($parsed, $stringLiteral, '@'), ':').Count) {
        throw "Duplicate JSON member in $($block.info)."
    }
    return @{ type = $block.info; value = $value; prose = $text.Remove($block.start, $block.end - $block.start) }
}

function Assert-RuleFields($object, [string[]]$fields) {
    if ($object -isnot [pscustomobject]) { throw 'Expected a JSON object.' }
    $names = @($object.PSObject.Properties.Name)
    if ($names.Count -ne $fields.Count) { throw "Expected fields: $($fields -join ', ')." }
    foreach ($field in $fields) {
        if ($names -cnotcontains $field) { throw "Missing field: $field." }
    }
}

function Test-RuleString($value) {
    return ($value -is [string] -and ![string]::IsNullOrWhiteSpace($value))
}

function Read-RuleRequest([string]$text) {
    $block = Read-RuleBlock $text 'product-rule-update'
    if (!$block) { return $null }
    $rule = $block.value
    Assert-RuleFields $rule @('section','before','after','requiredCriteria')
    if ($rule.section -isnot [string] -or $rule.section -cnotmatch '\A### [^\s#][^\r\n]*\z') {
        throw 'section must be a complete level-three heading.'
    }
    foreach ($field in 'before','after') {
        if (!(Test-RuleString $rule.$field) -or $rule.$field -match '\r(?!\n)|\n\z') {
            throw "$field must contain complete nonempty Markdown text without a final newline."
        }
        $rule.$field = $rule.$field.Replace("`r`n", "`n")
    }
    if ($rule.before.Equals($rule.after)) { throw 'before and after must differ.' }
    if ($rule.requiredCriteria -isnot [array] -or !$rule.requiredCriteria.Count) { throw 'Expected a nonempty requiredCriteria array.' }
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($id in $rule.requiredCriteria) {
        if ($id -isnot [string] -or $id -cnotmatch '\A[\p{L}\p{N}_-]+\z' -or $id -cin 'unknown','optional' -or !$seen.Add($id)) {
            throw "Invalid or repeated required criterion ID: $id."
        }
        if ($block.prose -cnotmatch ('(?<![\w-])' + [regex]::Escape($id) + '(?![\w-])')) {
            throw "The specification must describe the check for $id outside its block."
        }
    }
    return $rule
}

function Read-RuleReview($rule, [string]$text) {
    $block = Read-RuleBlock $text 'product-rule-review'
    if (!$block) { throw 'Missing product-rule-review/v1.' }
    $report = $block.value
    Assert-RuleFields $report @('criteria','findings','missingCriteria')
    foreach ($field in 'criteria','findings','missingCriteria') {
        if ($report.$field -isnot [array]) { throw "Expected an array for $field." }
    }
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($row in $report.criteria) {
        Assert-RuleFields $row @('id','status','evidence')
        if ($row.id -isnot [string] -or $rule.requiredCriteria -cnotcontains $row.id -or !$seen.Add($row.id)) {
            throw "Unknown or repeated review criterion: $($row.id)."
        }
        if (!(Test-RuleString $row.evidence)) { throw "Missing evidence for $($row.id)." }
        if ($row.status -isnot [string] -or $row.status -cnotin 'passed','failed','unverified') { throw "Invalid status for $($row.id)." }
    }
    foreach ($id in $rule.requiredCriteria) {
        if (!$seen.Contains($id)) { throw "Missing review for $id." }
    }
    foreach ($finding in $report.findings) {
        Assert-RuleFields $finding @('impact','description')
        if (!(Test-RuleString $finding.description)) { throw 'Missing finding description.' }
        if ($finding.impact -isnot [string] -or ($finding.impact -cnotin 'unknown','optional' -and $rule.requiredCriteria -cnotcontains $finding.impact)) {
            throw "Unknown finding impact: $($finding.impact)."
        }
    }
    return $report
}

function Assert-RuleOutcome($report, $repair) {
    if ($report.missingCriteria.Count) { throw "Missing material criteria: $($report.missingCriteria -join ', ')." }
    $material = @($report.findings | Where-Object { $_.impact -cne 'optional' })
    if ($repair) {
        if ($report.criteria.id -cnotcontains $repair.reference -or
            $material.Count -ne 1 -or $material[0].impact -cne $repair.reference -or
            $material[0].description -cne $repair.finding) {
            throw 'The repair must match the only material product-rule finding by criterion ID and description.'
        }
    } elseif ($material.Count) {
        throw "Open finding ($($material[0].impact)): $($material[0].description)"
    }
    foreach ($row in $report.criteria) {
        $expected = if ($repair -and $row.id -ceq $repair.reference) { 'failed' } else { 'passed' }
        if ($row.status -cne $expected) { throw "$($row.id): expected $expected, received $($row.status). $($row.evidence)" }
    }
}

function Assert-RepairReference($finding, [string]$approved) {
    if ([IO.Path]::IsPathRooted($finding.path) -or $finding.path -match '^[A-Za-z]:|^[\\/]|(^|[\\/])\.\.([\\/]|$)') {
        throw 'The finding path must be relative to the repository.'
    }
    $reference = '(?<![\w-])' + [regex]::Escape($finding.reference) + '(?![\w-])'
    if ($approved -cnotmatch $reference) { throw "Reference not found in the approved specification: $($finding.reference)." }
}

function Assert-BatchFindings($findings, $ids, [string]$approved, $rule) {
    if ($findings -isnot [array]) { throw 'Expected an array of findings.' }
    foreach ($item in $findings) {
        $fields = @('id','severity','description','action')
        $fields += switch -CaseSensitive ($item.action) {
            'repair' { 'path','location','reference','fix','check' }
            'owner' { 'question' }
            'dependent' { 'reason' }
            'needs_evidence' { 'reason' }
            'recommendation' { 'suggestion' }
            default { throw "Invalid action for $($item.id)." }
        }
        if ($rule) { $fields += 'impact' }
        Assert-RuleFields $item $fields
        foreach ($field in $fields) {
            if (!(Test-RuleString $item.$field)) { throw "Expected nonempty text for $field." }
        }
        if ($item.id -cnotmatch '\A[\p{L}\p{N}_-]+\z' -or !$ids.Add($item.id)) { throw "Invalid or repeated finding ID: $($item.id)." }
        if ($item.severity -cnotin 'red','yellow','green' -or
            (($item.severity -ceq 'green') -ne ($item.action -ceq 'recommendation'))) { throw "Invalid severity/action for $($item.id)." }
        if ($item.action -ceq 'repair') { Assert-RepairReference $item $approved }
        if ($rule -and (($rule.requiredCriteria -cnotcontains $item.impact -and $item.impact -cnotin 'unknown','optional') -or
            (($item.severity -ceq 'green') -ne ($item.impact -ceq 'optional')) -or
            ($item.action -ceq 'repair' -and ($item.reference -cne $item.impact -or $rule.requiredCriteria -cnotcontains $item.reference)))) {
            throw "Invalid product-rule impact for $($item.id)."
        }
    }
}

function Read-BatchDecision($data, $first, [string]$approved, $rule) {
    $ids = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    if (!$first) {
        Assert-RuleFields $data @('findings')
        Assert-BatchFindings $data.findings $ids $approved $rule
        $open = $data.findings
        $repairs = @($open | Where-Object { $_.action -ceq 'repair' })
        $result = [ordered]@{ version = 'v2'; findings = $open; repairs = $repairs }
    } else {
        Assert-RuleFields $data @('outcomes','newFindings')
        if ($data.outcomes -isnot [array]) { throw 'Expected an outcomes array.' }
        $originals = [Collections.Generic.Dictionary[string,object]]::new([StringComparer]::Ordinal)
        foreach ($item in $first.findings) { $originals.Add($item.id, $item) }
        $open = @(foreach ($row in $data.outcomes) {
            Assert-RuleFields $row @('id','status','evidence')
            if (!(Test-RuleString $row.id) -or !$originals.ContainsKey($row.id) -or !$ids.Add($row.id)) {
                throw "Unknown or repeated outcome ID: $($row.id)."
            }
            $item = $originals[$row.id]
            if (!(Test-RuleString $row.evidence) -or !(Test-RuleString $row.status) -or
                $row.status -cnotin 'fixed','open','owner','recommendation','not_rechecked' -or
                ($row.status -ceq 'recommendation' -and $item.severity -cne 'green') -or
                ($row.status -ceq 'fixed' -and $item.action -cin 'owner','dependent') -or
                ($item.severity -ceq 'green' -and $row.status -cnotin 'fixed','recommendation','not_rechecked')) {
                throw "Invalid outcome or missing evidence for $($row.id)."
            }
            if ($row.status -cne 'fixed') { $item }
        })
        if ($ids.Count -ne $originals.Count) { throw 'Missing outcomes for initial finding IDs.' }
        Assert-BatchFindings $data.newFindings $ids $approved $rule
        $open += $data.newFindings
        $result = [ordered]@{ version = 'v2'; outcomes = $data.outcomes; newFindings = $data.newFindings }
    }
    if (!$first -and $repairs.Count) { $result.decision = 'repair' }
    elseif (@($open | Where-Object { $_.severity -cne 'green' }).Count) {
        $result.decision = 'open'
        $result.reason = 'Material findings remain open. See the outcomes and new findings.'
    } else { $result.decision = 'clean' }
    return [pscustomobject]$result
}

function Assert-BatchRuleOutcome($report, $open) {
    if ($report.missingCriteria.Count) { throw "Missing material criteria: $($report.missingCriteria -join ', ')." }
    # Consume one match per finding, including repeated descriptions on the same criterion.
    $material = [Collections.Generic.List[object]]::new()
    foreach ($item in $report.findings) { if ($item.impact -cne 'optional') { $material.Add($item) } }
    foreach ($item in $open) {
        if ($item.severity -ceq 'green') { continue }
        $match = $material.FindIndex({ param($other) $item.impact.Equals($other.impact) -and $item.description.Equals($other.description) })
        if ($match -lt 0) { throw "Missing matching product-rule finding for $($item.id)." }
        $material.RemoveAt($match)
    }
    if ($material.Count) { throw "Unmatched product-rule finding: $($material[0].description)." }
    foreach ($row in $report.criteria) {
        $affected = @($open | Where-Object { $_.impact -ceq $row.id })
        if ($row.status -ceq 'unverified' -or ($row.status -ceq 'failed' -and !$affected.Count) -or
            ($row.status -cne 'failed' -and @($affected | Where-Object { $_.action -ceq 'repair' }).Count)) {
            throw "Inconsistent or incomplete criterion $($row.id): $($row.status). $($row.evidence)"
        }
    }
}

function Read-ApplyDecision([string]$text, [string]$approved, $rule, [switch]$Final, $FirstDecision) {
    $block = Read-RuleBlock $text 'apply-review-followup' @('v1','v2')
    if ($Final -and $FirstDecision.version -ceq 'v2' -and $block.type -cne 'apply-review-followup/v2') {
        throw 'Expected apply-review-followup/v2 outcomes in the final review.'
    }
    if ($block.type -ceq 'apply-review-followup/v2') {
        if ($Final -and $FirstDecision.version -cne 'v2') { throw 'Expected a v1 decision after a v1 repair.' }
        $decision = Read-BatchDecision $block.value $FirstDecision $approved $rule
        try {
            if ($rule) {
                $open = $decision.findings
                if ($Final) {
                    $remaining = @($decision.outcomes | Where-Object { $_.status -cne 'fixed' })
                    $open = @($FirstDecision.findings | Where-Object { $remaining.id -ccontains $_.id }) + $decision.newFindings
                }
                Assert-BatchRuleOutcome (Read-RuleReview $rule $text) $open
            } elseif (Read-RuleBlock $text 'product-rule-review') { throw 'Unexpected product-rule-review/v1 without an approved rule change.' }
        } catch {
            # Preserve a valid initial inventory even if the accompanying rule report contradicts it.
            if ($Final) { throw }
            $decision.decision = 'invalid'
            $decision | Add-Member -Force NoteProperty reason $_.Exception.Message
        }
        return $decision
    }
    $decision = $block.value
    if ($block -and $decision.decision -isnot [string]) { throw 'Expected one decision string.' }
    if (!$block) {
        if ($Final) { throw 'Missing apply-review-followup/v1 in the final review.' }
        $decision = [pscustomobject]@{ decision = 'legacy' }
    } elseif ($decision.decision -ceq 'repair') {
        $fields = @('decision','finding','path','location','reference','observed','check')
        Assert-RuleFields $decision $fields
        foreach ($field in $fields) {
            if (!(Test-RuleString $decision.$field)) { throw "Expected nonempty text for $field." }
        }
        Assert-RepairReference $decision $approved
    } elseif ($decision.decision -ceq 'owner') {
        $fields = @('decision','kind','reason')
        if ($decision.kind -cin 'product_choice','unclear') { $fields += 'question' }
        Assert-RuleFields $decision $fields
        if ($decision.kind -isnot [string] -or $decision.kind -cnotin 'product_choice','unclear','multiple','other' -or
            !(Test-RuleString $decision.reason) -or ($fields -contains 'question' -and !(Test-RuleString $decision.question))) {
            throw 'Expected an owner kind, reason and a question for a product choice or unclear finding.'
        }
    } elseif ($decision.decision -ceq 'clean') {
        Assert-RuleFields $decision @('decision')
    } else { throw 'Expected a clean, repair or owner decision.' }

    if ($rule) {
        $report = Read-RuleReview $rule $text
        if ($decision.decision -cne 'owner') {
            $repair = if ($decision.decision -ceq 'repair') { $decision }
            Assert-RuleOutcome $report $repair
        }
    } elseif (!$rule -and $block -and (Read-RuleBlock $text 'product-rule-review')) {
        throw 'Unexpected product-rule-review/v1 without an approved rule change.'
    }
    return $decision
}

function Format-FindingGroups($findings) {
    $titles = [ordered]@{ red = '🔴 Критические ошибки и блокеры'; yellow = '🟡 Стоит исправить'; green = '🟢 Необязательные мелочи' }
    foreach ($level in $titles.Keys) {
        "### $($titles[$level])"
        ''
        $items = @($findings | Where-Object { $_.severity -ceq $level })
        if (!$items.Count) { 'Нет замечаний' }
        foreach ($item in $items) {
            $action = switch ($item.action) {
                'repair' { "$($item.path), $($item.location) ($($item.reference)). $($item.fix) Проверка — $($item.check)" }
                'owner' { $item.question }
                'recommendation' { $item.suggestion }
                default { $item.reason }
            }
            "- **$($item.id)** $($item.description) $action"
        }
        ''
    }
}

function Get-BatchSummary($follow) {
    $initial = $follow.firstDecision.findings
    $final = $follow.finalDecision
    $verified = $final.version -ceq 'v2' -and $final.decision -cne 'invalid'
    $newFindings = @()
    if ($verified) { $newFindings = $final.newFindings }
    $outcomes = @(foreach ($item in $initial) {
        if ($verified) {
            $final.outcomes | Where-Object { $_.id -ceq $item.id }
        } else {
            $status = switch ($item.action) {
                'owner' { 'owner' }
                'recommendation' { 'recommendation' }
                'dependent' { 'open' }
                'needs_evidence' { 'open' }
                default { 'not_rechecked' }
            }
            $basis = switch ($item.action) {
                'owner' { $item.question }
                'recommendation' { $item.suggestion }
                'repair' { $follow.reason }
                default { $item.reason }
            }
            [pscustomobject]@{ id = $item.id; status = $status; evidence = $basis }
        }
    })
    $labels = @{ fixed = 'исправлено'; open = 'открыто'; owner = 'требует решения владелицы'; recommendation = 'рекомендация'; not_rechecked = 'повторно не проверено' }
    $lines = @(
        '## Первоначальные замечания'
        ''
        Format-FindingGroups $initial
        if ($outcomes.Count) {
            '## Итог по каждому замечанию'
            ''
            foreach ($row in $outcomes) { "- **$($row.id)** — $($labels[$row.status]). $($row.evidence)" }
            ''
        }
        if ($verified -and $newFindings.Count) {
            '## Новые замечания итогового ревью'
            ''
            Format-FindingGroups $newFindings
        }
        if (!$verified) { "Повторная проверка не подтверждена. $($follow.reason)" }
    )
    return [pscustomobject]@{ initialFindings = $initial; outcomes = $outcomes; newFindings = $newFindings; chat = ($lines -join [char]10).TrimEnd() }
}

# A fenced example may itself contain sample contract blocks or section titles.
function Get-MarkdownParts([string]$markdown, [switch]$Fences) {
    $fence = $null
    foreach ($line in [regex]::Matches($markdown, '(?m)^\uFEFF? {0,3}(?<token>`{3,}|~{3,}|#{1,6}(?=[ \t]|\r?$))(?<tail>[^\r\n]*)')) {
        $token = $line.Groups['token'].Value
        if ($token[0] -ne '#') {
            $info = $line.Groups['tail'].Value.Trim()
            if (!$fence) {
                $fence = @{ token = $token; info = $info; start = $line.Index; body = $line.Index + $line.Length }
            } elseif ($token.StartsWith($fence.token) -and !$info) {
                $fence.close = $line.Index
                $fence.end = $line.Index + $line.Length
                if ($Fences) { $fence }
                $fence = $null
            }
        } elseif (!$fence -and !$Fences) {
            [pscustomobject]@{ start = $line.Index; level = $token.Length; title = $line.Value.TrimStart([char]0xFEFF) }
        }
    }
    if ($Fences -and $fence) { $fence }
}

function Get-RuleRange($headings, [int]$length, [string]$title) {
    $hits = @($headings | Where-Object { $_.title.Equals($title) })
    if ($hits.Count -ne 1) { return $null }
    $hit = $hits[0]
    $end = $length
    foreach ($heading in $headings) {
        if ($heading.start -gt $hit.start -and $heading.level -le $hit.level) {
            $end = $heading.start
            break
        }
    }
    return @{ start = $hit.start; end = $end }
}

function Get-ProductSection([string]$markdown) {
    $range = Get-RuleRange @(Get-MarkdownParts $markdown) $markdown.Length '## 6. Действующие правила продукта'
    if ($range) { return $markdown.Substring($range.start, $range.end - $range.start) }
}

function Assert-RuleFile([string]$path) {
    $item = Get-Item -LiteralPath $path -Force -ErrorAction Stop
    if ($item -isnot [IO.FileInfo] -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Expected a regular local file: $path."
    }
}

function Read-RuleState([string]$path) {
    try {
        Assert-RuleFile $path
        # Decode strictly and retain any BOM as a character for an exact round trip.
        $markdown = [Text.UTF8Encoding]::new($false, $true).GetString([IO.File]::ReadAllBytes($path))
        return @{ markdown = $markdown; section = Get-ProductSection $markdown }
    } catch { return @{ error = $_.Exception.Message } }
}

function Read-ReviewGitList([string]$root, [string]$arguments) {
    $info = [Diagnostics.ProcessStartInfo]::new()
    $info.FileName = 'git'
    $info.Arguments = "--no-optional-locks ls-files -z $arguments"
    $info.WorkingDirectory = $root
    $info.UseShellExecute = $false
    $info.RedirectStandardOutput = $true
    $info.StandardOutputEncoding = [Text.UTF8Encoding]::new($false, $true)
    $process = [Diagnostics.Process]::Start($info)
    try {
        $list = $process.StandardOutput.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw 'Could not snapshot the Git working tree.' }
        return $list
    } finally { $process.Dispose() }
}

function Get-ReviewSnapshot([string]$root, [string]$approvedPath) {
    $result = [Text.StringBuilder]::new()
    # Stage entries include paths, object IDs, modes and merge stages. SPEC.md
    # itself is checked separately with its exclusive handle held.
    $entries = Read-ReviewGitList $root '-v --stage'
    [void]$result.Append($entries)
    $changes = Read-ReviewGitList $root '--modified --deleted --others --exclude-standard -- . :(exclude)SPEC.md'
    # Git may omit working-tree edits to assume-unchanged and skip-worktree files.
    foreach ($entry in $entries.Split([char]0)) {
        if ($entry -cmatch '^[a-zS] ') {
            $name = $entry.Substring($entry.IndexOf("`t") + 1)
            if ($name -cne 'SPEC.md') { $changes += $name + [char]0 }
        }
    }
    foreach ($name in $changes.Split([char[]]@([char]0), [StringSplitOptions]::RemoveEmptyEntries)) {
        $path = Join-Path $root $name
        $hash = 'deleted'
        if (Test-Path -LiteralPath $path -ErrorAction Stop) {
            Assert-RuleFile $path
            $hash = (Get-FileHash -LiteralPath $path -Algorithm SHA256 -ErrorAction Stop).Hash
            if (!$hash) { throw "Could not hash $name." }
        }
        [void]$result.Append($name).Append([char]0).Append($hash).Append([char]0)
    }
    [void]$result.Append((Get-FileHash -LiteralPath $approvedPath -ErrorAction Stop).Hash)
    return $result.ToString()
}

function Find-RuleLines([string]$body, [string]$fragment) {
    $lines = $fragment.Split([char]10) | ForEach-Object { [regex]::Escape($_) }
    $pattern = '(?m)^(?=(?<fragment>' + ($lines -join '\r?\n') + ')(?=\r?$))'
    return [regex]::Matches($body, $pattern)
}

function Get-RuleEdit([string]$markdown, [string]$section, $rule) {
    $topic = Get-RuleRange @(Get-MarkdownParts $section) $section.Length $rule.section
    if (!$topic) { return @{ status = 'blocked'; reason = "Missing or ambiguous topic: $($rule.section)." } }
    $start = $section.IndexOf("`n", $topic.start) + 1
    if (!$start) { return @{ status = 'blocked'; reason = 'The topic has no body.' } }
    $body = $section.Substring($start, $topic.end - $start)
    $old = @(Find-RuleLines $body $rule.before)
    $new = @(Find-RuleLines $body $rule.after)
    if (!$old.Count -and $new.Count -eq 1) { return @{ status = 'already_current' } }
    if ($old.Count -ne 1 -or $new.Count) { return @{ status = 'blocked'; reason = 'No unique approved replacement in the topic.' } }
    $match = $old[0].Groups['fragment']
    $offset = $start + $match.Index
    $endings = [regex]::Matches($match.Value, '\r?\n')
    $eol = [regex]::Match($section.Substring($offset + $match.Length), '\r?\n').Value
    if (!$eol) { $eol = [regex]::Match($section, '\r?\n', 'RightToLeft').Value }
    $lines = $rule.after.Split([char]10)
    $replacement = $lines[0]
    for ($i = 1; $i -lt $lines.Count; $i++) {
        $separator = if ($i -le $endings.Count) { $endings[$i - 1].Value } else { $eol }
        $replacement += $separator + $lines[$i]
    }
    $updated = $section.Remove($offset, $match.Length).Insert($offset, $replacement)
    $range = Get-RuleRange @(Get-MarkdownParts $markdown) $markdown.Length '## 6. Действующие правила продукта'
    $document = $markdown.Remove($range.start, $section.Length).Insert($range.start, $updated)
    $newTopic = Get-RuleRange @(Get-MarkdownParts $updated) $updated.Length $rule.section
    $expectedEnd = $topic.end + $replacement.Length - $match.Length
    $updatedBody = $body.Remove($match.Index, $match.Length).Insert($match.Index, $replacement)
    if (!$updated.Equals((Get-ProductSection $document)) -or !$newTopic -or $newTopic.end -ne $expectedEnd -or
        @(Find-RuleLines $updatedBody $rule.after).Count -ne 1 -or @(Find-RuleLines $updatedBody $rule.before).Count) {
        return @{ status = 'blocked'; reason = 'Replacement would change a section boundary or leave an ambiguous rule.' }
    }
    return @{ status = 'ready'; document = $document }
}

function Write-RuleBytes([IO.FileStream]$stream, [byte[]]$bytes) {
    $stream.Position = 0
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.SetLength($bytes.Length)
    $stream.Flush($true)
}

function Update-ReviewedRule($path, $rule, $state, [string]$snapshot, $root, $approvedPath) {
    Assert-RuleFile $path
    $stream = [IO.File]::Open($path, 'Open', 'ReadWrite', 'None')
    try {
        $buffer = [IO.MemoryStream]::new()
        try {
            $stream.CopyTo($buffer)
            $original = $buffer.ToArray()
        } finally { $buffer.Dispose() }
        $utf8 = [Text.UTF8Encoding]::new($false, $true)
        $markdown = $utf8.GetString($original)
        if (!$markdown.Equals($state.markdown) -or !$snapshot.Equals((Get-ReviewSnapshot $root $approvedPath))) {
            return @{ status = 'blocked'; reason = 'The files or Git index changed since the reviewer received them.' }
        }
        $edit = Get-RuleEdit $markdown $state.section $rule
        if ($edit.status -ne 'ready') { return $edit }
        $bytes = $utf8.GetBytes($edit.document)
        $backup = [IO.Path]::GetTempFileName()
        $retainBackup = $false
        try {
            [IO.File]::WriteAllBytes($backup, $original)
            try { Write-RuleBytes $stream $bytes }
            catch {
                $failure = $_.Exception.Message
                try { Write-RuleBytes $stream $original }
                catch {
                    $retainBackup = $true
                    throw "Write failed: $failure Recovery failed: $($_.Exception.Message) Original bytes: $backup"
                }
                throw "Write failed; original bytes restored. $failure"
            }
        } finally {
            if (!$retainBackup) { [IO.File]::Delete($backup) }
        }
        return @{ status = 'updated' }
    } finally { $stream.Dispose() }
}
