"""Run with python tests/test_product_rule.py (Git and PowerShell required)."""
import codecs
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
SECTION = "## 6. Действующие правила продукта"
TOPIC = "### Черновик"
BEFORE = "Старое правило.\nВторая строка."
AFTER = "Новая строка.\nПравило принято."
OLD_BYTES = BEFORE.replace("\n", "\r\n").encode()
NEW_BYTES = AFTER.replace("\n", "\r\n").encode()
REQUEST = dict(section=TOPIC, before=BEFORE, after=AFTER, requiredCriteria=["C1", "C2"])
PASS = [
    dict(id="C1", status="passed", evidence="server: reopened draft retained item 2 first"),
    dict(id="C2", status="passed", evidence="Pages: reopened draft retained item 2 first"),
]


def fenced(name, data, version="v1"):
    return f"```{name}/{version}\n{json.dumps(data, ensure_ascii=False)}\n```"


def review(criteria=PASS, findings=(), gaps=()):
    data = dict(criteria=criteria, findings=list(findings), missingCriteria=list(gaps))
    return "REVIEWED\nFindings from review.\n" + fenced("product-rule-review", data)


REPAIR = dict(decision="repair", finding="Reopening loses the order.", reference="C1",
              path="tracked.txt", location="line 1", observed="Item 1 precedes item 2.",
              check="Reopen and check item 2 is first.")
CLEAN = dict(decision="clean")
FAILED = [dict(PASS[0], status="failed", evidence=REPAIR["observed"]), PASS[1]]
FINDING = dict(impact="C1", description=REPAIR["finding"])


def follow(decision, report="REVIEWED\nOrdinary findings."):
    return report + "\n" + fenced("apply-review-followup", decision)


def batch(data, report="REVIEWED\nOrdinary findings."):
    return report + "\n" + fenced("apply-review-followup", data, "v2")


RED = dict(id="R1", severity="red", action="repair", description=REPAIR["finding"],
           fix="Persist the new order.", **{key: REPAIR[key] for key in ("path", "location", "reference", "check")})
YELLOW = dict(RED, id="Y1", severity="yellow", reference="C2", location="loadDraft",
              description="Pages restores a stale draft.", fix="Load the saved draft.", check="Reopen on Pages.")
OWNER = dict(id="Q1", severity="red", action="owner", description="Lifetime is undecided.",
             question="When should a draft expire?")
GREEN = dict(id="G1", severity="green", action="recommendation", description="Long label.",
             suggestion="Shorten the label.")
DEPENDENT = dict(id="D1", severity="yellow", action="dependent", description="Expiry depends on lifetime.",
                 reason="Waiting for the answer to Q1.")


def outcome(item, status="fixed", evidence="Reopened the saved draft and verified its order."):
    return dict(id=item["id"], status=status, evidence=evidence)


FAKE = r'''
import json, os, subprocess, sys
from pathlib import Path
root = Path(sys.argv[sys.argv.index("--cd") + 1])
control = Path(os.environ["MOCK_CODEX"])
config = json.loads((control / "input").read_text(encoding="utf-8"))
prompt = sys.stdin.buffer.read().decode("utf-8")
role = next((r for r in ("coder", "reviewer", "architect") if prompt.startswith("Act directly as the " + r)), "inspect")
calls = control / "calls"
number = calls.read_text().splitlines().count(role) + 1 if calls.exists() else 1
with calls.open("a") as f:
    print(role, file=f)
label = role + str(number)
(control / label).write_text(prompt, encoding="utf-8")
(control / (label + ".json")).write_text(json.dumps(dict(args=sys.argv[1:], pid=os.getpid(),
    tracked=(root / "tracked.txt").read_bytes().hex())))
step = config.get(label, {})
if step.get("observeStatus"):
    status = (control / "stderr").read_text(encoding="utf-8")
    assert step["observeStatus"] in status, status
if step.get("crash") or role == "reviewer" and config.get("crash"):
    sys.exit(13)
action = step.get("write", config.get(role + "Write"))
if action and role == "coder":
    (root / action[0]).write_bytes(bytes.fromhex(action[1]))
message = {"reviewer": config["review"], "coder": "IMPLEMENTED\nChecked synthetic draft.", "inspect": "Inspected.", "architect": "SPEC_READY\nLegacy plan."}[role]
message = step.get("message", message)
print(json.dumps(dict(type="item.completed", item=dict(type="agent_message", text=message))), flush=True)
if action and role == "reviewer":
    (root / action[0]).write_bytes(bytes.fromhex(action[1]))
if step.get("stage"):
    subprocess.run(["git", "add", "--", step["stage"]], cwd=root, check=True)
print(json.dumps(dict(type="turn.completed")))
'''


class Workflow(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.control = Path(self.temp.name).resolve()
        self.repo = self.control / "repo"
        self.repo.mkdir()
        self.spec = self.repo / "SPEC.md"
        self.plan = self.repo / "docs/specs/task.md"
        self.plan.parent.mkdir(parents=True)
        self.plan.write_text("C1: check server. C2: check Pages.\n" +
                             fenced("product-rule-update", REQUEST), encoding="utf-8")
        shutil.copytree(ROOT / "scripts", self.repo / "scripts")
        shutil.copytree(ROOT / ".codex/agents", self.repo / ".codex/agents")
        self.original = (codecs.BOM_UTF8 + ("## 5. Harness\n```md\n" + SECTION +
                         "\n```\n" + SECTION + "\r\n" + TOPIC + "\r\n").encode() +
                         OLD_BYTES + "\r\n### Соседняя тема\n".encode() + OLD_BYTES +
                         "\n## 7. Следующий раздел\n".encode() + TOPIC.encode() + b"\n" + OLD_BYTES)
        self.spec.write_bytes(self.original)
        (self.repo / ".gitignore").write_text("/docs/\n")
        (self.repo / "tracked.txt").write_text("staged")
        self.git("init", "-q")
        self.git("config", "core.autocrlf", "false")
        self.git("add", ".")
        self.config = {"review": review()}
        fake = self.control / "fake.py"
        fake.write_text(FAKE, encoding="utf-8")
        if os.name == "nt":
            (self.control / "codex.cmd").write_text(f'@"{sys.executable}" "{fake}" %*\n')
        else:
            shim = self.control / "codex"
            shim.write_text(f'#!/bin/sh\nexec "{sys.executable}" "{fake}" "$@"\n')
            shim.chmod(0o755)
        self.env = dict(os.environ, MOCK_CODEX=str(self.control),
                        PATH=str(self.control) + os.pathsep + os.environ["PATH"],
                        TMP=str(self.control), TEMP=str(self.control), TMPDIR=str(self.control))

    def git(self, *args):
        return subprocess.check_output(["git", *args], cwd=self.repo)

    def run_stage(self, mode="Apply", dry=False, error=None, name="task.md", paths=(), progress=None, task="test"):
        (self.control / "calls").unlink(missing_ok=True)
        (self.control / "input").write_text(json.dumps(self.config), encoding="utf-8")
        cmd = "& ./scripts/Invoke-CodexTask.ps1 -Task '" + task.replace("'", "''") + "' -Mode " + mode
        if mode != "Inspect":
            cmd += f" -SpecFile '{name}'"
        if dry:
            cmd += " -DryRun"
        if paths:
            cmd += " -Path " + ",".join("'" + path.replace("'", "''") + "'" for path in paths)
        script = ("$ErrorActionPreference='Stop'; [Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); "
                  f"try {{ $r = {cmd}; $r | ConvertTo-Json -Depth 10 -Compress }} "
                  "catch { [Console]::Error.WriteLine($_.Exception.Message + [Environment]::NewLine + $_.ScriptStackTrace); exit 1 }")
        shell = shutil.which("powershell") or shutil.which("pwsh")
        stderr_path = self.control / "stderr"
        with stderr_path.open("wb") as stderr:
            result = subprocess.run([shell, "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
                                    stdout=subprocess.PIPE, stderr=stderr, cwd=self.repo, env=self.env, timeout=45)
        diagnostics = stderr_path.read_text(encoding="utf-8", errors="replace")
        output = result.stdout.decode("utf-8", errors="replace") + diagnostics
        if progress is not None:
            self.assertEqual([line for line in diagnostics.splitlines() if line.startswith("[Apply] ")],
                             progress, output)
        if error is not None:
            self.assertNotEqual(result.returncode, 0, output)
            self.assertIn(error, output)
            return
        self.assertEqual(result.returncode, 0, output)
        return json.loads(result.stdout.decode("utf-8-sig"))

    def update(self, status):
        report = self.run_stage()
        self.assertEqual(self.calls(), ["coder", "reviewer"])
        self.assertEqual((report["status"], report["mode"]), ("reviewed", "apply"))
        self.assertEqual(Path(report["specFile"]), self.plan)
        self.assertIn("Checked synthetic draft", report["coder"]["result"])
        self.assertEqual(report["reviewer"]["result"], self.config["review"].split("\n", 1)[1])
        result = report["productRuleUpdate"]
        self.assertEqual(result["status"], status, result)
        if status in ("error", "blocked"):
            self.assertTrue(result["reason"])
        return result

    def test_update_preserves_bytes_index_and_retry(self):
        self.original = self.original.replace(b"Harness", b"User edit")
        self.spec.write_bytes(self.original)
        (self.repo / "tracked.txt").write_text("unstaged")
        self.git("add", "SPEC.md")
        self.original = self.original.replace(b"User edit", b"Additional edit")
        self.spec.write_bytes(self.original)
        index = self.git("ls-files", "--stage")
        plan = self.plan.read_bytes()
        self.config["review"] = review(findings=[dict(impact="optional", description="Optional copy edit.")])
        self.update("updated")
        expected = self.original.replace(OLD_BYTES, NEW_BYTES, 1)
        self.assertEqual(self.spec.read_bytes(), expected)
        mtime = self.spec.stat().st_mtime_ns
        self.update("already_current")
        self.assertEqual(self.spec.read_bytes(), expected)
        self.assertEqual(self.spec.stat().st_mtime_ns, mtime)
        self.assertEqual(self.git("ls-files", "--stage"), index)
        self.assertEqual(self.plan.read_bytes(), plan)
        self.assertEqual(self.calls(), ["coder", "reviewer"])

    def calls(self):
        return (self.control / "calls").read_text().splitlines()

    def test_review_gate_and_retry(self):
        invalid = [review(criteria=PASS[:1]), review(criteria=PASS + PASS[:1]),
                   review(criteria=[PASS[0], dict(PASS[1], id="other")]),
                   review(gaps=["retry on server"]), "REVIEWED\nFree text",
                   "REVIEWED\n```product-rule-review/v1\n{\n```",
                   "REVIEWED\n" + fenced("product-rule-review", dict(criteria=PASS, findings=None, missingCriteria=[]))]
        invalid += [review(criteria=[PASS[0], dict(PASS[1], status=s)]) for s in ("failed", "unverified")]
        invalid += [review(criteria=[PASS[0], dict(PASS[1], evidence=" ")])]
        invalid += [review(findings=[dict(impact=i, description="Missing check")]) for i in ("C1", "unknown")]
        invalid.append(review().replace('"findings": []', '"findings": [{}], "findings": []'))
        for message in invalid:
            with self.subTest(message=message):
                self.config["review"] = message
                self.update("blocked")
                self.assertEqual(self.spec.read_bytes(), self.original)
        self.config["review"] = review()
        self.update("updated")

    def test_conflicts(self):
        manual = self.original.replace(OLD_BYTES, b"manual", 1)
        for stage in ("coder", "reviewer"):
            with self.subTest(stage=stage):
                self.spec.write_bytes(self.original)
                self.config[stage + "Write"] = ["SPEC.md", manual.hex()]
                self.update("blocked")
                self.assertEqual(self.spec.read_bytes(), manual)
                del self.config[stage + "Write"]
        double = self.original.replace(OLD_BYTES, OLD_BYTES + b"\n" + OLD_BYTES, 1)
        self.spec.write_bytes(double)
        self.update("blocked")
        self.assertEqual(self.spec.read_bytes(), double)
        self.spec.write_bytes(self.original)
        for filename in ("tracked.txt", "new file.txt"):
            self.config["coderWrite"] = [filename, b"reviewed".hex()]
            self.config["reviewerWrite"] = [filename, b"subsequent edit".hex()]
            self.update("blocked")
            self.assertEqual(self.spec.read_bytes(), self.original)
            self.assertEqual((self.repo / filename).read_bytes(), b"subsequent edit")

    def test_apply_streams_stage_progress(self):
        self.plan.write_text("C1: Reopen a draft.", encoding="utf-8")
        self.config.update(
            review=follow(REPAIR),
            coder1=dict(observeStatus="[Apply] coder started."),
            reviewer1=dict(observeStatus="[Apply] reviewer started."),
            coder2=dict(observeStatus="[Apply] repairCoder started."),
            reviewer2=dict(observeStatus="[Apply] finalReviewer started.", message=follow(CLEAN)),
        )
        progress = [f"[Apply] {stage} {status}."
                    for stage in ("checkBaseline", "coder", "checks", "reviewer", "repairCoder", "repairChecks", "finalReviewer")
                    for status in ("started", "completed")]
        skills = ["ya-zdes-book-editor", "ya-zdes-pages-export"]
        report = self.run_stage(progress=progress, task="Fix draft preview", paths=(r"src\lib\browser-demo.ts",))
        self.assertEqual(report["status"], "reviewed")
        follow_up = report["reviewFollowUp"]
        for stage, label in zip(("firstCoder", "firstReviewer", "repairCoder", "finalReviewer"),
                                ("coder1", "reviewer1", "coder2", "reviewer2")):
            self.assertEqual(follow_up[stage]["skills"], skills)
            prompt = (self.control / label).read_text(encoding="utf-8")
            self.assertEqual([line for line in prompt.splitlines() if line.startswith("- .agents/skills/")],
                             [f"- .agents/skills/{skill}/SKILL.md" for skill in skills])
        self.config["coder1"]["message"] = "BLOCKED\nMissing inputs"
        self.run_stage(error="coder stage is incomplete", progress=[
            "[Apply] checkBaseline started.",
            "[Apply] checkBaseline completed.",
            "[Apply] coder started.",
            "[Apply] coder blocked. Missing inputs",
        ])
        self.assertEqual(self.calls(), ["coder"])
        self.run_stage(dry=True, progress=[])

    def test_automatic_checks_before_review_and_after_repair(self):
        test_file = "tests/order.test.ts"
        self.plan.write_text("C1: Reopen a draft.\n" + fenced("apply-checks", {"tests": [test_file]}), encoding="utf-8")
        (self.repo / "tests").mkdir()
        (self.repo / test_file).write_text("synthetic case")
        self.git("add", test_file)
        eslint = self.repo / "node_modules/eslint/bin/eslint.js"
        vitest = self.repo / "node_modules/vitest/vitest.mjs"
        for tool in (eslint, vitest):
            tool.parent.mkdir(parents=True, exist_ok=True)
        eslint.write_text("""
const fs = require('node:fs'), path = require('node:path');
const files = process.argv.slice(process.argv.indexOf('--') + 1);
const output = files.map(file => ({filePath: path.resolve(file),
  messages: fs.readFileSync(file, 'utf8').startsWith('broken')
    ? [{severity: 2, line: 1, column: 1, ruleId: 'synthetic', message: 'Broken draft'}] : []}));
console.log(JSON.stringify(output)); process.exitCode = Number(output.some(file => file.messages.length));
""", encoding="utf-8")
        vitest.write_text("""
import fs from 'node:fs';
import path from 'node:path';
const failed = fs.existsSync('draft.ts') && fs.readFileSync('draft.ts', 'utf8') === 'broken';
const name = path.resolve(process.argv.at(-1));
const file = process.argv.find(arg => arg.startsWith('--outputFile=')).split('=')[1];
fs.writeFileSync(file, JSON.stringify({numTotalTests: 1, testResults: [{name,
  status: failed ? 'failed' : 'passed', message: '', assertionResults: failed
    ? [{status: 'failed', fullName: 'Reopens a draft', failureMessages: ['Wrong order']}] : []}]}));
process.exitCode = Number(failed);
""", encoding="utf-8")
        self.config.update(review=follow(REPAIR), reviewer2=dict(message=follow(CLEAN)),
                           coder1=dict(write=["draft.ts", b"broken".hex()]),
                           coder2=dict(write=["draft.ts", b"fixed".hex()]))
        dry = self.run_stage(dry=True)
        self.assertEqual(dry["checks"]["tests"], [test_file])
        self.assertFalse((self.control / "calls").exists())
        report = self.run_stage()
        self.assertEqual(report["status"], "reviewed")
        self.assertIsInstance(report["checks"]["first"], list, report["checks"])
        self.assertEqual([item["status"] for item in report["checks"]["first"]], ["failed", "failed"])
        self.assertEqual([item["status"] for item in report["checks"]["afterRepair"]], ["passed", "passed"])
        self.assertIn("Wrong order", (self.control / "reviewer1").read_text(encoding="utf-8"))
        self.assertNotIn("Wrong order", (self.control / "reviewer2").read_text(encoding="utf-8"))

        self.config["review"] = follow(CLEAN)
        self.assertEqual(self.run_stage()["status"], "blocked")
        pre_existing = self.run_stage()
        self.assertEqual(pre_existing["checks"]["first"][1]["status"], "pre_existing")
        vitest.unlink()
        unavailable = self.run_stage()
        self.assertEqual(unavailable["status"], "blocked")
        self.assertEqual(unavailable["checks"]["first"][1]["status"], "unavailable")

    def test_check_plan_rejects_command_arguments(self):
        self.plan.write_text(fenced("apply-checks", {"tests": ["--config", "../outside.test.ts"]}), encoding="utf-8")
        self.run_stage(dry=True, error="Invalid or duplicate apply-checks test path")
        self.assertFalse((self.control / "calls").exists())

    def test_stage_failure_and_recovery(self):
        self.config["coder1"] = dict(message="BLOCKED\nMissing inputs")
        self.run_stage(error="coder stage is incomplete")
        self.assertEqual(self.calls(), ["coder"])
        del self.config["coder1"]
        self.config["review"] = "BLOCKED\nMissing inputs"
        self.run_stage(error="reviewer stage is incomplete")
        self.config["crash"] = True
        self.run_stage(error="exit code 13")
        self.assertEqual(self.spec.read_bytes(), self.original)
        self.config = dict(review=review())
        if os.name == "nt":
            with self.spec.open("rb"):
                self.update("error")
            self.assertEqual(self.spec.read_bytes(), self.original)
        helper = self.repo / "scripts/ProductRule.ps1"
        source = helper.read_bytes()
        write = b"$stream.SetLength($bytes.Length)"
        for persistent in (False, True):
            fault = (b"throw 'Injected persistent failure'" if persistent else
                     b"if (!$script:injected) { $script:injected = $true; throw 'Injected write failure' }")
            helper.write_bytes(source.replace(write, fault + b"\n    " + write))
            reason = self.update("error")["reason"]
            self.assertIn("Injected", reason)
            if persistent:
                self.assertIn("Original bytes: ", reason)
                self.assertEqual(Path(reason.split("Original bytes: ")[1]).read_bytes(), self.original)
                self.spec.write_bytes(self.original)
            else:
                self.assertIn("restored", reason)
                self.assertEqual(self.spec.read_bytes(), self.original)
        helper.write_bytes(source)
        self.update("updated")

    def test_section_boundaries(self):
        prefix = ("## 5. Harness\n" + TOPIC + "\n" + BEFORE + "\n" + SECTION + "\n").encode()
        topic = (TOPIC + "\n").encode()
        tail = ("\n### Another topic\n" + BEFORE + "\n## 7. Other\n" + TOPIC + "\n" + BEFORE).encode()
        for body in [b"unrelated", BEFORE.encode() + b"\n" + AFTER.encode()]:
            sample = prefix + topic + body + tail
            self.spec.write_bytes(sample)
            self.update("blocked")
            self.assertEqual(self.spec.read_bytes(), sample)
        sample = prefix + topic + BEFORE.encode()
        self.spec.write_bytes(sample)
        plan = self.plan.read_bytes()
        for after in ["## 7. Other\nRule", "### Another topic\nRule"]:
            self.plan.write_text("C1 C2\n" + fenced("product-rule-update", dict(REQUEST, after=after)), encoding="utf-8")
            self.update("blocked")
            self.assertEqual(self.spec.read_bytes(), sample)
        self.plan.write_bytes(plan)
        self.update("updated")
        self.assertEqual(self.spec.read_bytes(), prefix + topic + AFTER.encode())

        self.spec.write_bytes(prefix + topic + b"A\r\nB\nC")
        mixed = dict(REQUEST, before="A\nB\nC", after="D\nE\nF\nG")
        self.plan.write_text("C1 C2\n" + fenced("product-rule-update", mixed), encoding="utf-8")
        self.update("updated")
        self.assertEqual(self.spec.read_bytes(), prefix + topic + b"D\r\nE\nF\nG")

    def test_route_uses_task_scope(self):
        self.plan.write_text("Review layout. Example: payment. Architecture notes.", encoding="utf-8")
        harness = ("scripts/Invoke-CodexTask.ps1", "SPEC.md")
        self.assertEqual(self.run_stage(dry=True, paths=harness)["profile"], "standard")
        self.assertEqual(self.run_stage(dry=True, paths=(*harness, "src/lib/commerce.ts"))["profile"], "critical")

    def test_publication_exclusion_preserves_other_routing_signals(self):
        paths = ("src/components/editor-wizard.tsx", "src/lib/timeline-view.ts", "tests/timeline-view.test.ts")
        lifecycle = "ya-zdes-book-lifecycle"
        cases = (
            ("Проверить хронологию без публикации", paths, "standard", False),
            ("Проверить хронологию БЕЗ  ПУБЛИКАЦИИ", paths, "standard", False),
            ("Исправить публикацию книги", (), "critical", True),
            ("Без публикации. Проверить оплату книги", paths, "critical", True),
            ("Проверить хронологию без публикации", (*paths, "src/lib/commerce.ts"), "critical", True),
        )
        for task, relevant_paths, profile, use_lifecycle in cases:
            with self.subTest(task=task, paths=relevant_paths):
                route = self.run_stage(mode="Inspect", dry=True, task=task, paths=relevant_paths)
                self.assertEqual(route["profile"], profile)
                self.assertEqual(lifecycle in route["skills"], use_lifecycle)
                if relevant_paths:
                    self.assertIn("ya-zdes-book-editor", route["skills"])

    def test_skill_routes_for_inspect_and_plan(self):
        routes = (
            ("Fix README typo", [], "package.json"),
            ("Исправить предпросмотр книги", ["ya-zdes-book-editor"], "src/lib/editor-copy.ts"),
            ("Приватная ссылка", ["ya-zdes-book-lifecycle"], "src/lib/commerce.ts"),
            ("Исправить статический экспорт", ["ya-zdes-pages-export"], ".github/workflows/pages.yml"),
        )
        for task, expected, path in routes:
            with self.subTest(task=task):
                preview = self.run_stage(mode="Inspect", dry=True, task=task)
                self.assertEqual(preview["skills"], expected)
                self.assertEqual([route["skill"] for route in preview["chatSkills"]],
                                 ["ya-zdes-clarify-product", "ya-zdes-retro", "ya-zdes-commit", "ya-zdes-review-pr"])
                report = self.run_stage(mode="Inspect", paths=(path,))
                self.assertEqual(report["skills"], expected)
                prompt = (self.control / "inspect1").read_text(encoding="utf-8")
                self.assertEqual([line for line in prompt.splitlines() if line.startswith("- .agents/skills/")],
                                 [f"- .agents/skills/{skill}/SKILL.md" for skill in expected])

        task = "Fix checkout and draft preview on GitHub Pages"
        expected = ["ya-zdes-book-editor", "ya-zdes-book-lifecycle", "ya-zdes-pages-export"]
        self.assertEqual(self.run_stage(mode="Plan", dry=True, name="new.md", task=task)["skills"], expected)
        self.assertEqual(self.run_stage(mode="Plan", name="new.md", task=task)["architect"]["skills"], expected)

    def test_product_skills_route_storefront_account_and_checkout(self):
        ux = "ya-zdes-design-ux"
        sales = "ya-zdes-sales-copy"
        lifecycle = "ya-zdes-book-lifecycle"
        cases = (
            ("Обновить первый экран витрины", (), [ux, sales]),
            ("Сделай экран оплаты понятнее", (), [lifecycle, ux, sales]),
            ("Починить повтор платежного вебхука", ("src/app/api/webhooks/yookassa/route.ts",), [lifecycle]),
            ("Проверить ЛК", (), [lifecycle]),
            ("Проверить экран личного кабинета", ("src/app/account/page.tsx",), [lifecycle, ux, "ya-zdes-pages-export"]),
            ("Проверить изменения", ("src/components/checkout-client.tsx",), [lifecycle, ux, sales]),
        )
        for task, paths, expected in cases:
            with self.subTest(task=task):
                preview = self.run_stage(mode="Inspect", dry=True, task=task, paths=paths)
                self.assertEqual(preview["skills"], expected)

        report = self.run_stage(task="Сделай экран оплаты понятнее")
        for role in ("coder", "reviewer"):
            expected = [lifecycle, ux, sales]
            self.assertEqual(report[role]["skills"], expected)
            prompt = (self.control / (role + "1")).read_text(encoding="utf-8")
            for skill in expected:
                self.assertIn(f".agents/skills/{skill}/SKILL.md", prompt)

    def test_editor_plan_carries_step_results_and_browser_checks_into_apply(self):
        task = "Keep the draft timeline order after reopening and in preview"
        paths = ("src/components/editor-wizard.tsx", "src/components/free-editor.tsx")
        plan = (
            "## Specification\nC1: Retain the saved timeline order on server and Pages.\n"
            "## Plan\n"
            "1. Save the timeline order in the editor.\n"
            "   Expected result: reopened drafts retain the order.\n"
            "   Check: reorder three events on mobile, save and reopen on server and Pages.\n"
            "2. Show the saved order in preview. Depends on step 1.\n"
            "   Expected result: the preview order equals the reopened draft order.\n"
            "   Check: open preview in both modes. Edge case: keep a one-event draft intact.\n"
        )
        evidence = "Server: reopened and previewed both drafts. Pages unverified: browser unavailable."
        self.config.update(
            architect1=dict(message="SPEC_READY\n" + plan),
            coder1=dict(message="IMPLEMENTED\n" + evidence),
        )
        planned = self.run_stage(mode="Plan", name="timeline.md", task=task, paths=paths)
        self.assertEqual(planned["status"], "planned")
        architect_prompt = (self.control / "architect1").read_text(encoding="utf-8")
        self.assertIn("step, expected result, and check format", architect_prompt)
        self.assertIn("separate runs for server and Pages", architect_prompt)
        self.assertIn("nearest meaningful edge case", architect_prompt)
        self.assertEqual(Path(planned["specFile"]).read_text(encoding="utf-8"), plan)

        self.run_stage(name="timeline.md", task=task, paths=paths)
        coder_prompt = (self.control / "coder1").read_text(encoding="utf-8")
        reviewer_prompt = (self.control / "reviewer1").read_text(encoding="utf-8")
        self.assertIn(plan.strip(), coder_prompt)
        self.assertIn(plan.strip(), reviewer_prompt)
        self.assertIn("the mode and the observed result", coder_prompt)
        self.assertIn("identify any unverified scenario", reviewer_prompt)
        self.assertIn(evidence, reviewer_prompt)

    def test_modes_and_invalid_inputs(self):
        dry = self.run_stage(dry=True)
        self.assertEqual(len(dry["stages"]), 3)
        self.assertEqual(dry["conditionalStages"], ["repair coder (workspace-write)", "final reviewer (read-only)"])
        self.assertIn("profile", self.run_stage("Inspect", dry=True))
        self.assertEqual(self.run_stage("Plan", dry=True, name="new.md")["stages"], ["architect (read-only)"])
        for bad in [dict(REQUEST, requiredCriteria=["C1", "C1"]), dict(REQUEST, requiredCriteria=["C3"]),
                    dict(REQUEST, section="## Wrong"), dict(REQUEST, requiredCriteria=[])]:
            self.plan.write_text("C1 C2\n" + fenced("product-rule-update", bad), encoding="utf-8")
            self.run_stage(error="")
        for text in ["```product-rule-update/v2\n{}\n```", "```product-rule-update/v1\n{"]:
            self.plan.write_text(text)
            self.run_stage(error="Expected exactly one")
        self.assertFalse((self.control / "calls").exists())
        self.assertEqual(self.run_stage("Inspect")["mode"], "inspect")
        self.assertEqual(self.run_stage("Plan", name="new.md")["status"], "planned")
        self.assertIn("Legacy plan", self.plan.with_name("new.md").read_text())
        self.plan.write_text("C1 C2. Literal Markdown example:\n````markdown\n" +
                             fenced("product-rule-update", REQUEST) + "\n````", encoding="utf-8")
        self.config["review"] = "REVIEWED\nOrdinary report."
        self.assertEqual(len(self.run_stage(dry=True)["stages"]), 2)
        self.update("not_requested")
        self.assertEqual(self.spec.read_bytes(), self.original)

    def test_one_repair_and_independent_review(self):
        self.plan.write_text("C1: Reopen a draft.", encoding="utf-8")
        self.config.update(review=follow(REPAIR), reviewer2=dict(message=follow(CLEAN)),
                           coder2=dict(message="IMPLEMENTED\nReopened and verified item 2.",
                                       write=["tracked.txt", b"fixed".hex()]))
        report = self.run_stage()
        self.assertEqual(report["status"], "reviewed")
        self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
        history = report["reviewFollowUp"]
        self.assertEqual(history["firstDecision"], REPAIR)
        self.assertEqual(history["finalDecision"], CLEAN)
        self.assertEqual(history["repairCoder"], report["coder"])
        self.assertEqual(history["finalReviewer"], report["reviewer"])
        self.assertIn(REPAIR["observed"], history["firstReviewer"]["result"])
        self.assertEqual(report["productRuleUpdate"]["status"], "not_requested")
        metadata = {}
        prompts = {}
        for label in ("coder1", "reviewer1", "coder2", "reviewer2"):
            prompts[label] = (self.control / label).read_text(encoding="utf-8")
            approved = prompts[label].split("--- BEGIN APPROVED SPECIFICATION ---\n")[1].split("\n--- END")[0]
            self.assertEqual(approved, self.plan.read_text())
            metadata[label] = json.loads((self.control / (label + ".json")).read_text())
            args = metadata[label]["args"]
            self.assertEqual(args[args.index("--sandbox") + 1], "read-only" if "reviewer" in label else "workspace-write")
            self.assertIn("--ephemeral", args)
        self.assertNotEqual(metadata["reviewer1"]["pid"], metadata["reviewer2"]["pid"])
        for value in REPAIR.values():
            self.assertIn(value, prompts["coder2"])
        for key in ("firstCoder", "firstReviewer", "repairCoder"):
            self.assertIn(history[key]["result"], prompts["reviewer2"])
        self.assertEqual(bytes.fromhex(metadata["reviewer2"]["tracked"]), b"fixed")

    def test_owner_invalid_and_optional(self):
        self.plan.write_text("C1: Reopen.", encoding="utf-8")
        for kind in ("product_choice", "unclear", "multiple"):
            owner = dict(decision="owner", kind=kind, reason="Requires owner decision.")
            if kind != "multiple":
                owner["question"] = "Which behavior should apply?"
            self.config["review"] = follow(owner)
            history = self.run_stage()["reviewFollowUp"]
            self.assertEqual(history["firstDecision"], owner)
            self.assertIn(owner["reason"], history["reason"])
            self.assertEqual(self.calls(), ["coder", "reviewer"])
        duplicate = follow(CLEAN) + "\n" + fenced("apply-review-followup", CLEAN)
        for message in (duplicate, follow(dict(REPAIR, location=" ")), follow(dict(REPAIR, reference="C10")),
                        follow(dict(decision="owner", kind="product_choice", reason="Choose.")),
                        follow(CLEAN).replace('"clean"', '"clean", "decision": "repair"'),
                        follow(CLEAN).replace("/v1", "/v2"), follow(CLEAN)[:-3]):
            with self.subTest(message=message):
                self.config["review"] = message
                report = self.run_stage()
                self.assertEqual(report["status"], "reviewed")
                self.assertEqual(report["reviewer"]["result"], message.split("\n", 1)[1].strip())
                self.assertTrue(report["reviewFollowUp"]["reason"])
                self.assertEqual(report["reviewFollowUp"]["firstDecision"]["decision"], "invalid")
                self.assertEqual(self.calls(), ["coder", "reviewer"])
        for message in ("REVIEWED\nOrdinary.", follow(CLEAN, "REVIEWED\nOptional copy edit.")):
            self.config["review"] = message
            self.update("not_requested")
            self.assertEqual(self.calls(), ["coder", "reviewer"])

    def test_retry_limit_and_failures(self):
        self.plan.write_text("C1: Reopen.", encoding="utf-8")
        for final in (follow(REPAIR), "REVIEWED\nOrdinary.", follow(dict(decision="owner", kind="other", reason="Missing check."))):
            self.config.update(review=follow(REPAIR), reviewer2=dict(message=final))
            report = self.run_stage()
            self.assertEqual(report["status"], "reviewed")
            self.assertEqual(report["reviewFollowUp"]["firstDecision"], REPAIR)
            self.assertEqual(report["reviewer"]["result"], final.split("\n", 1)[1])
            self.assertTrue(report["reviewFollowUp"]["reason"])
            self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
        for stage, key in (("coder2", "repairCoder"), ("reviewer2", "finalReviewer")):
            for fault, reason in ((dict(crash=True), "exit code 13"), (dict(message="BLOCKED\nNeed input."), "Need input.")):
                with self.subTest(stage=stage, reason=reason):
                    self.config = dict(review=follow(REPAIR), coder2=dict(message="IMPLEMENTED\nRepair checked."))
                    self.config[stage] = fault
                    report = self.run_stage()
                    history = report["reviewFollowUp"]
                    self.assertEqual(report["status"], "blocked")
                    self.assertEqual(history["errorStage"], key)
                    self.assertIn(reason, history["reason"])
                    self.assertEqual(history["firstDecision"], REPAIR)
                    self.assertEqual(report["reviewer"], history["firstReviewer"])
                    self.assertEqual(report["coder"], history["repairCoder"] or history["firstCoder"])
                    self.assertIsNone(history[key])
                    self.assertEqual(self.calls(), (["coder", "reviewer"] * 2)[:3 if stage == "coder2" else 4])

    def test_batch_history_and_chat(self):
        self.plan.write_text("C1: server. C2: Pages.", encoding="utf-8")
        findings = [RED, YELLOW, OWNER, GREEN]
        outcomes = [outcome(GREEN, "recommendation", GREEN["suggestion"]), outcome(RED),
                    outcome(OWNER, "owner", OWNER["question"]), outcome(YELLOW, "open", "Still stale on Pages.")]
        new = [dict(YELLOW, id="Y2", description="Saving duplicates the draft.")]
        self.config.update(review=batch(dict(findings=findings)), reviewer2=dict(
            message=batch(dict(outcomes=outcomes, newFindings=new))))
        report = self.run_stage()
        self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
        history = report["reviewFollowUp"]
        summary = history["summary"]
        self.assertEqual(summary["initialFindings"], findings)
        self.assertCountEqual(summary["outcomes"], outcomes)
        self.assertEqual(summary["newFindings"], new)
        for word in ("🔴 Критические ошибки и блокеры", "🟡 Стоит исправить", "🟢 Необязательные мелочи",
                     "исправлено", "открыто", "требует решения владелицы", "рекомендация",
                     "Новые замечания", "Нет замечаний"):
            self.assertIn(word, summary["chat"])
        for row in findings + new:
            self.assertIn(row["description"], summary["chat"])
        repair = (self.control / "coder2").read_text(encoding="utf-8")
        self.assertIn(self.plan.read_text(), repair)
        for item in (RED, YELLOW):
            for value in item.values():
                self.assertIn(value, repair)
        for item in (OWNER, GREEN):
            self.assertNotIn(item["description"], repair)
        prompt = (self.control / "reviewer2").read_text(encoding="utf-8")
        for key in ("firstCoder", "firstReviewer", "repairCoder"):
            self.assertIn(history[key]["result"], prompt)
        first, final = (json.loads((self.control / f"reviewer{i}.json").read_text()) for i in (1, 2))
        self.assertNotEqual(first["pid"], final["pid"])
        self.assertIn("read-only", final["args"])

    def test_batch_without_repair(self):
        self.plan.write_text("C1 C2")
        for findings, statuses in [([], []), ([GREEN], ["recommendation"]), ([OWNER], ["owner"]),
                                   ([OWNER, DEPENDENT], ["owner", "open"])]:
            with self.subTest(findings=findings):
                self.config["review"] = batch(dict(findings=findings))
                summary = self.run_stage()["reviewFollowUp"]["summary"]
                self.assertEqual(self.calls(), ["coder", "reviewer"])
                self.assertEqual([row["status"] for row in summary["outcomes"]], statuses)
                self.assertIn("Нет замечаний", summary["chat"])

    def test_invalid_batches_and_incomplete_finals(self):
        self.plan.write_text("C1 C2")
        first = batch(dict(findings=[RED, YELLOW]))
        invalid = [first.replace("/v2", "/v3"), first + "\n" + fenced("apply-review-followup", CLEAN),
                   first + "\n" + first, batch(dict(findings=[RED, RED]))]
        for changes in [dict(reference="C12"), dict(path="../outside"), dict(fix=" "), dict(severity="green"),
                        dict(action=["owner"]), dict(extra="unexpected")]:
            invalid.append(batch(dict(findings=[dict(RED, **changes)])))
        for message in invalid:
            with self.subTest(message=message):
                self.config["review"] = message
                history = self.run_stage()["reviewFollowUp"]
                self.assertEqual(history["firstDecision"]["decision"], "invalid")
                self.assertTrue(history["reason"])
                self.assertEqual(self.calls(), ["coder", "reviewer"])
        finals = [follow(CLEAN), "REVIEWED\nText only.", first,
                  batch(dict(outcomes=[outcome(RED)], newFindings=[])),
                  batch(dict(outcomes=[outcome(RED)] * 2, newFindings=[])),
                  batch(dict(outcomes=[outcome(RED), outcome(YELLOW)], newFindings=[RED]))]
        for message in finals:
            with self.subTest(final=message):
                self.config.update(review=first, reviewer2=dict(message=message))
                history = self.run_stage()["reviewFollowUp"]
                self.assertEqual(history["firstReviewer"]["result"], first.split("\n", 1)[1])
                self.assertEqual(history["finalDecision"]["decision"], "invalid")
                self.assertEqual([r["status"] for r in history["summary"]["outcomes"]], ["not_rechecked"] * 2)
                self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
        for stage, key, count in [("coder2", "repairCoder", 3), ("reviewer2", "finalReviewer", 4)]:
            self.config = dict(review=first)
            self.config[stage] = dict(crash=True)
            report = self.run_stage()
            history = report["reviewFollowUp"]
            self.assertEqual(history["errorStage"], key)
            self.assertEqual(len(self.calls()), count)
            self.assertEqual(report["reviewer"], history["firstReviewer"])
            self.assertEqual(history["summary"]["initialFindings"], [RED, YELLOW])
            self.assertIn("повторно не проверено", history["summary"]["chat"])

    def test_rule_batches(self):
        red = dict(RED, impact="C1")
        green = dict(GREEN, impact="optional")
        done = [outcome(RED), outcome(YELLOW), outcome(GREEN, "recommendation", GREEN["suggestion"])]
        final = batch(dict(outcomes=done, newFindings=[]),
                      review(findings=[dict(impact="optional", description=green["description"])]))
        index = (self.repo / ".git/index").read_bytes()
        for criterion in ("C1", "C2"):
            # Identical material entries are separate findings when IDs differ.
            yellow = dict(YELLOW, reference=criterion, impact=criterion, description=red["description"])
            criteria = [FAILED[0], dict(PASS[1], status="failed" if criterion == "C2" else "passed")]
            rows = [red, yellow, green]
            matching = [dict(impact=r["impact"], description=r["description"]) for r in reversed(rows)]
            self.spec.write_bytes(self.original)
            self.config.update(review=batch(dict(findings=rows), review(criteria, matching)), reviewer2=dict(message=final))
            for status in ("updated", "already_current"):
                report = self.run_stage()
                self.assertEqual(report["productRuleUpdate"]["status"], status, report["reviewFollowUp"]["reason"])
                self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
                self.assertEqual(self.spec.read_bytes(), self.original.replace(OLD_BYTES, NEW_BYTES, 1))
        self.spec.write_bytes(self.original)
        initial = self.config["review"]
        for bad in [review(criteria, matching[:-1]), review(criteria, matching + matching[-1:]),
                    review(criteria, [*matching[:-1], dict(matching[-1], impact="unknown")]),
                    review(criteria, [*matching[:-1], dict(matching[-1], description="Wrong")]),
                    review([dict(criteria[0], status="unverified"), criteria[1]], matching),
                    review(criteria, matching, ["Missing reopen check"]), review(PASS, matching),
                    review(criteria, matching + [dict(impact="C1", description="Unlisted")])]:
            with self.subTest(bad=bad):
                self.config["review"] = batch(dict(findings=rows), bad)
                self.update("blocked")
                self.assertEqual(self.spec.read_bytes(), self.original)
        question = dict(OWNER, impact="unknown")
        question_impact = dict(impact="unknown", description=OWNER["description"])
        self.config["review"] = batch(dict(findings=rows + [question]), review(criteria, matching + [question_impact]))
        self.config["reviewer2"] = dict(message=batch(dict(outcomes=done + [outcome(OWNER, "owner", OWNER["question"])],
                                                           newFindings=[]), review(findings=[question_impact])))
        self.assertEqual(self.run_stage()["productRuleUpdate"]["status"], "blocked")
        self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
        self.config["review"] = initial
        for message in [batch(dict(outcomes=done, newFindings=[dict(red, id="R2")]), review(FAILED, [FINDING])),
                        batch(dict(outcomes=done, newFindings=[]), review(FAILED, [FINDING])),
                        batch(dict(outcomes=done, newFindings=[]), review(gaps=["Missing check"]))]:
            self.config["reviewer2"] = dict(message=message)
            self.assertEqual(self.run_stage()["productRuleUpdate"]["status"], "blocked")
            self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
            self.assertEqual(self.spec.read_bytes(), self.original)
        self.assertEqual((self.repo / ".git/index").read_bytes(), index)

    def test_changes_before_repair(self):
        self.plan.write_text("C1: Reopen.", encoding="utf-8")
        for flag in ("assume-unchanged", "skip-worktree"):
            with self.subTest(flag=flag):
                self.git("update-index", "--" + flag, "tracked.txt")
                edit = flag.encode()
                self.config = dict(review=follow(REPAIR), reviewer1=dict(write=["tracked.txt", edit.hex()]))
                report = self.run_stage()
                self.assertEqual(self.calls(), ["coder", "reviewer"])
                self.assertIn("changed", report["reviewFollowUp"]["reason"])
                self.assertEqual((self.repo / "tracked.txt").read_bytes(), edit)
                self.git("update-index", "--no-" + flag, "tracked.txt")

        for target in ("tracked.txt", "new file.txt", "index", "docs/specs/task.md", "SPEC.md"):
            with self.subTest(target=target):
                self.plan.write_text("C1: Reopen.", encoding="utf-8")
                (self.repo / "tracked.txt").write_bytes(b"unstaged")
                action = dict(stage="tracked.txt") if target == "index" else dict(write=[target, b"user edit".hex()])
                self.config = dict(review=follow(REPAIR), reviewer1=action)
                report = self.run_stage()
                self.assertEqual(report["status"], "reviewed")
                self.assertEqual(self.calls(), ["coder", "reviewer"])
                self.assertIn("changed", report["reviewFollowUp"]["reason"])
                if target == "index":
                    self.assertEqual(self.git("show", ":tracked.txt"), b"unstaged")
                else:
                    self.assertEqual((self.repo / target).read_bytes(), b"user edit")

        # A failed pre-review snapshot must also stop repair if the reviewer
        # later sees a readable document again.
        self.spec.write_bytes(b"\xff")
        self.config = dict(review=follow(REPAIR), reviewer1=dict(write=["SPEC.md", self.original.hex()]))
        report = self.run_stage()
        self.assertEqual(self.calls(), ["coder", "reviewer"])
        self.assertTrue(report["reviewFollowUp"]["reason"])
        self.assertIsNone(report["reviewFollowUp"]["repairCoder"])
        self.assertEqual(self.spec.read_bytes(), self.original)

    def test_rule_repair_and_final_snapshot(self):
        initial = follow(REPAIR, review(FAILED, [FINDING]))
        final = follow(CLEAN, review())
        self.config.update(review=initial, reviewer2=dict(message=final),
                           coder2=dict(write=["tracked.txt", b"fixed".hex()]))
        index = self.git("ls-files", "--stage")
        index_bytes = (self.repo / ".git/index").read_bytes()
        approved = self.plan.read_bytes()
        for status in ("updated", "already_current"):
            report = self.run_stage()
            self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
            self.assertEqual(report["productRuleUpdate"]["status"], status)
            self.assertEqual(report["reviewFollowUp"]["finalDecision"], CLEAN)
            self.assertEqual(self.spec.read_bytes(), self.original.replace(OLD_BYTES, NEW_BYTES, 1))
        self.spec.write_bytes(self.original)
        for step in (dict(message=follow(CLEAN, review(criteria=PASS[:1]))),
                     dict(message=follow(CLEAN, review(findings=[FINDING]))),
                     dict(message=review()), dict(message=follow(REPAIR, review(FAILED, [FINDING]))),
                     dict(message=final, write=["tracked.txt", b"after review".hex()]),
                     dict(message="BLOCKED\nUnavailable.")):
            with self.subTest(step=step):
                self.config["reviewer2"] = step
                report = self.run_stage()
                self.assertEqual(report["productRuleUpdate"]["status"], "blocked")
                self.assertEqual(self.calls(), ["coder", "reviewer"] * 2)
                self.assertEqual(self.spec.read_bytes(), self.original)
        for message in (follow(REPAIR, review()), follow(REPAIR, review(FAILED, [dict(FINDING, impact="C2")])),
                        follow(REPAIR, review(FAILED, [dict(FINDING, description="Another finding.")])),
                        follow(REPAIR, review(FAILED, [FINDING] * 2)),
                        follow(REPAIR, review([FAILED[0], dict(PASS[1], status="unverified")], [FINDING])),
                        follow(REPAIR, review(FAILED, [FINDING], ["Missing retry coverage"])),
                        follow(CLEAN, review(FAILED, [FINDING]))):
            with self.subTest(message=message):
                self.config["review"] = message
                self.update("blocked")
                self.assertEqual(self.calls(), ["coder", "reviewer"])
                self.assertEqual(self.spec.read_bytes(), self.original)
        self.assertEqual(self.git("ls-files", "--stage"), index)
        self.assertEqual((self.repo / ".git/index").read_bytes(), index_bytes)
        self.assertEqual(self.plan.read_bytes(), approved)


if __name__ == "__main__":
    unittest.main(verbosity=2)
