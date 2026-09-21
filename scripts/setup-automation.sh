#!/usr/bin/env bash
# motetai 記事自動化の GitHub 側セットアップ
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REPO="ATOHSaaa/motetai"

echo "🔐 GitHub Secrets を設定..."
if [[ -f .env.production ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env.production | xargs)
  gh secret set PUBLIC_GA_MEASUREMENT_ID -R "$REPO" --body "$PUBLIC_GA_MEASUREMENT_ID"
  gh secret set PUBLIC_CLARITY_PROJECT_ID -R "$REPO" --body "$PUBLIC_CLARITY_PROJECT_ID"
  gh secret set PUBLIC_GOOGLE_SITE_VERIFICATION -R "$REPO" --body "$PUBLIC_GOOGLE_SITE_VERIFICATION"
  echo "   ✅ 解析用 Secrets を設定しました"
else
  echo "   ⚠️  .env.production がないため Secrets はスキップ"
fi

echo ""
echo "✅ GitHub 側のセットアップ完了"
echo ""
echo "📋 残り: Cursor Automation の作成（1回だけ）"
echo "   1. Cursor で Cmd+Shift+P → 「Automations: New Automation」"
echo "   2. Trigger: Schedule → 毎日 6:00"
echo "   3. Repository: ATOHSaaa/motetai (main)"
echo "   4. Instructions に .cursor/automations/daily-articles.md を @参照"
echo "   5. Git commit/push を有効化して保存"
echo ""
echo "   またはチャットで:"
echo "   「Automations エディタを開いて、.cursor/automations/daily-articles.prefill.json の内容で下書きして」"
