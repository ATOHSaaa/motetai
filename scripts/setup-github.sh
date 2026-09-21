#!/usr/bin/env bash
set -euo pipefail

# GitHub CLI ログイン（未ログインの場合）
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI にログインしてください:"
  gh auth login
fi

# リポジトリ作成 & push
gh repo create motetai \
  --public \
  --description "男性向け婚活・恋愛メディア motetai" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "✅ リポジトリ作成 & push 完了"
echo ""
echo "次の手順:"
echo "1. https://github.com/$(gh api user -q .login)/motetai/settings/pages を開く"
echo "2. Build and deployment → Source を「GitHub Actions」に設定"
echo "3. Actions タブでデプロイ完了を確認"
echo ""
echo "公開URL: https://motetai.jp/"
echo "4. ドメイン設定で motetai.jp の DNS を GitHub Pages に向けてください"
