import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmdirSync, statSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, relative, resolve } from 'node:path';

const root = realpathSync(process.cwd());
const input = JSON.parse(readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
const baseline = input.baseline ? JSON.parse(input.baseline) : null;
const lintable = /\.(?:[cm]?[jt]s|[jt]sx)$/i;
const eslint = 'node_modules/eslint/bin/eslint.js';
const vitest = 'node_modules/vitest/vitest.mjs';

function workingFile(path) {
    try {
        const target = realpathSync(resolve(root, path));
        const within = relative(root, target);
        return within !== '..' && !within.startsWith('..\\') && !within.startsWith('../') &&
            !isAbsolute(within) && statSync(target).isFile();
    } catch {
        return false;
    }
}

function gitPaths(args) {
    const result = spawnSync('git', ['--no-optional-locks', ...args], { encoding: 'utf8' });
    if (result.error || result.status !== 0) {
        throw new Error(result.error?.message ?? result.stderr.trim());
    }
    return result.stdout.split('\0').filter(Boolean);
}

function lintPaths() {
    const paths = new Set([
        ...gitPaths(['diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z']),
        ...gitPaths(['ls-files', '-z', '--modified', '--others', '--exclude-standard']),
    ]);
    return [...paths].filter(path => lintable.test(path) && workingFile(path)).sort();
}

function hash(path) {
    return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function runCheck(tool, paths, before) {
    const name = tool === eslint ? 'eslint' : 'vitest';
    const report = { name, paths, status: 'skipped', exitCode: null, diagnostics: [] };
    if (!paths.length) return report;

    const missing = paths.filter(path => !workingFile(path));
    if (missing.length || !existsSync(tool)) {
        return { ...report, status: 'unavailable', diagnostics: missing.length
            ? missing.map(path => 'Missing or outside the repository: ' + path)
            : ['Local ' + name + ' is unavailable. Install the locked project dependencies.'] };
    }

    const temp = name === 'vitest' ? mkdtempSync(join(tmpdir(), 'ya-zdes-checks-')) : null;
    const reportFile = temp && join(temp, 'vitest.json');
    const args = name === 'eslint'
        ? ['--format', 'json', '--no-error-on-unmatched-pattern', '--', ...paths.map(path => './' + path)]
        : ['run', '--reporter=json', '--outputFile=' + reportFile, ...paths.map(path => './' + path)];
    const result = spawnSync(process.execPath, [tool, ...args], {
        encoding: 'utf8', timeout: 60000, maxBuffer: 2 * 1024 * 1024, windowsHide: true,
    });
    report.exitCode = result.status;
    try {
        if (result.error) throw result.error;
        const output = JSON.parse(reportFile ? readFileSync(reportFile, 'utf8') : result.stdout);
        if (name === 'eslint') {
            if (![0, 1].includes(result.status) || !Array.isArray(output)) throw new Error('ESLint did not return a file report.');
            report.diagnostics = output.flatMap(file => file.messages.filter(message => message.severity === 2)
                .map(message => relative(root, file.filePath).replaceAll('\\', '/') + ':' +
                    message.line + ':' + message.column + ' ' + (message.ruleId ?? 'parse') + ' ' + message.message));
        } else {
            if (!output.numTotalTests || ![0, 1].includes(result.status)) throw new Error('Vitest did not run any selected tests.');
            const reported = new Set(output.testResults.map(suite => relative(root, suite.name).replaceAll('\\', '/')));
            if (paths.some(path => !reported.has(path))) throw new Error('Vitest did not report every selected test file.');
            report.diagnostics = output.testResults.filter(suite => suite.status === 'failed').map(suite => [
                relative(root, suite.name).replaceAll('\\', '/'),
                suite.message,
                ...suite.assertionResults.filter(test => test.status === 'failed')
                    .flatMap(test => [test.fullName, ...test.failureMessages]),
            ].filter(Boolean).join('\n'));
            if (result.status !== 0 && !report.diagnostics.length) throw new Error('Vitest stopped without a failed suite.');
        }
        if (result.status === 0) report.status = 'passed';
        else if (report.diagnostics.length && before?.diagnostics?.length &&
            report.diagnostics.every(line => before.diagnostics.includes(line))) report.status = 'pre_existing';
        else report.status = 'failed';
    } catch (error) {
        report.status = 'unavailable';
        report.diagnostics = [error.message, result.stderr?.trim()].filter(Boolean);
    } finally {
        if (temp) {
            if (existsSync(reportFile)) unlinkSync(reportFile);
            rmdirSync(temp);
        }
    }
    return report;
}

const dirty = lintPaths();
if (baseline === null) {
    const planned = input.paths.map(path => path.replaceAll('\\', '/').replace(/^\.\//, ''));
    const candidates = [...new Set([...dirty, ...planned.filter(path => lintable.test(path) && workingFile(path))])].sort();
    console.log(JSON.stringify({
        hashes: Object.fromEntries(candidates.map(path => [path, hash(path)])),
        eslint: runCheck(eslint, candidates),
        vitest: runCheck(vitest, input.tests),
    }));
} else {
    const changed = dirty.filter(path => baseline.hashes[path] !== hash(path));
    const checks = [
        runCheck(eslint, changed, baseline.eslint),
        runCheck(vitest, input.tests, baseline.vitest),
    ];
    for (const check of checks) {
        check.diagnostics = check.diagnostics.slice(0, 12).map(line => line.slice(0, 1200));
    }
    console.log(JSON.stringify({ checks }));
}
