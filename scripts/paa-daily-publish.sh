#!/usr/bin/env bash
set -euo pipefail

slug="$(node scripts/generate-drylining-paa.mjs)"
slug="${slug//$'\n'/}"

if [[ -z "${slug}" ]]; then
  exit 0
fi

npm run build

git restore dist
git clean -fd dist

git add -A
if git diff --cached --quiet; then
  exit 0
fi

git commit -m "feat: add Edinburgh PAA page ${slug}"
git push origin main

curl -fsSL "https://api.vercel.com/v1/integrations/deploy/prj_pisSftzEpJSGg0StHoID3np6gKZj/ms4AGymCqX" >/dev/null

echo "published ${slug}"
