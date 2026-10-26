#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

backup="$(mktemp -d)"
restore() {
  local d
  for d in api account admin checkout orders preview b create; do
    if [[ -d "$backup/src/app/$d" ]]; then
      rm -rf "src/app/$d"
      mkdir -p "src/app"
      mv "$backup/src/app/$d" "src/app/$d"
    fi
  done
}
trap restore EXIT

mkdir -p "$backup/src/app"
for d in api account admin checkout orders preview b create; do
  if [[ -d "src/app/$d" ]]; then
    mv "src/app/$d" "$backup/src/app/$d"
  fi
done

mkdir -p "src/app/account" "src/app/admin" "src/app/create/[slug]"

cat > src/app/account/page.tsx <<'EOF'
"use client";

import { FreeAccountApp } from "@/components/free-cabinet";

export default function AccountStaticPage() {
  return <FreeAccountApp />;
}
EOF

cat > src/app/admin/page.tsx <<'EOF'
"use client";

import { FreeAdminApp } from "@/components/free-cabinet";

export default function AdminStaticPage() {
  return <FreeAdminApp />;
}
EOF

cat > "src/app/create/[slug]/page.tsx" <<'EOF'
import { FreeEditor } from "@/components/free-editor";
import { PRODUCT_SLUGS } from "@/lib/catalog";

export function generateStaticParams() {
  return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export default async function CreateStaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FreeEditor slug={slug} />;
}
EOF

export GITHUB_PAGES=1
export DEMO_MODE=false
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://keepitokus.github.io/im_here_store}"
rm -rf .next
npx next build
python3 - <<'PY'
import re
from pathlib import Path
root = Path("out")
pat = re.compile(r"(?<!im_here_store)/images/")
encoded = re.compile(r"(?<!im_here_store)%2Fimages%2F")
for path in root.rglob("*"):
    if not path.is_file():
        continue
    if path.suffix not in {".html", ".js", ".css", ".txt", ".json"}:
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    updated = encoded.sub("%2Fim_here_store%2Fimages%2F", pat.sub("/im_here_store/images/", text))
    if updated != text:
        path.write_text(updated, encoding="utf-8")
PY
