#!/usr/bin/env bash
set -euo pipefail

# cron runs script jobs with cwd = ~/.hermes/scripts/, but this script
# uses repo-relative paths, so jump to the site repo root first.
cd /Users/hendrixclaw/.openclaw/workspace/sites/drylining-edinburgh

slug="$(node scripts/generate-drylining-paa.mjs)"
slug="${slug//$'\n'/}"

if [[ -z "${slug}" ]]; then
  exit 0
fi

url="https://dryliningedinburgh.co.uk/paa/${slug}/"

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

echo "published ${url}"
