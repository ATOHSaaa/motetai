#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

OWNER=$(gh api user -q .login)
REPO="motetai"

echo "🔨 ビルド中..."
npm run build

echo "🚀 gh-pages ブランチにデプロイ中..."
cd dist
git init -q
git config user.email "agent@cursor.com"
git config user.name "Cursor Agent"
git checkout -B gh-pages
git add -A
git commit -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -f "https://github.com/$OWNER/$REPO.git" gh-pages

echo "⚙️  Pages ビルドをトリガー..."
gh api "repos/$OWNER/$REPO/pages/builds" -X POST >/dev/null

echo ""
echo "⏳ Pages 反映待ち（15秒）..."
sleep 15

echo "📡 IndexNow に送信..."
cd "$(dirname "$0")/.."
if node scripts/indexnow.mjs --changed; then
  echo "✅ IndexNow 送信完了"
else
  echo "⚠️  IndexNow 送信失敗（後で npm run indexnow -- --changed を実行）"
fi

echo ""
echo "✅ デプロイ完了！"
echo "📍 https://$(echo "$OWNER" | tr '[:upper:]' '[:lower:]').github.io/$REPO/"
