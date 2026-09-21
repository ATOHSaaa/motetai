#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! gh auth status >/dev/null 2>&1; then
  echo "❌ GitHub未ログインです。先に以下を実行してください:"
  echo "   gh auth login"
  exit 1
fi

OWNER=$(gh api user -q .login)
REPO="motetai"

echo "👤 GitHubユーザー: $OWNER"

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "📦 リポジトリ $OWNER/$REPO は既に存在します"
else
  echo "📦 リポジトリを作成中..."
  gh repo create "$REPO" \
    --public \
    --description "男性向け婚活・恋愛メディア motetai"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "https://github.com/$OWNER/$REPO.git"
fi

echo "🚀 push中..."
git push -u origin main

echo "⚙️  GitHub Pages (Actions) を設定中..."
gh api "repos/$OWNER/$REPO/pages" -X POST -f build_type=workflow 2>/dev/null || \
  gh api "repos/$OWNER/$REPO/pages" -X PUT -f build_type=workflow 2>/dev/null || \
  echo "ℹ️  Pages設定は手動で「GitHub Actions」を選択してください"

echo ""
echo "✅ 完了！"
echo "📍 公開URL: https://$OWNER.github.io/$REPO/"
echo "🔗 リポジトリ: https://github.com/$OWNER/$REPO"
echo ""
echo "Actions タブでデプロイ完了を確認してください（1〜3分）"
