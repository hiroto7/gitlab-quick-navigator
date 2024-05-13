# GitLab Quick Navigator

## インストール

1. リポジトリをクローンする
   ```
   git clone https://github.com/hiroto7/gitlab-quick-navigator.git
   ```
2. 依存関係をインストールしてビルドする
   - distディレクトリが生成される
   ```
   cd gitlab-quick-navigator
   pnpm install
   pnpm build
   ```
3. https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics?hl=ja#load-unpacked の手順を参考に、「パッケージ化されていない拡張機能を読み込む」からdistディレクトリを読み込む
   - ChromeにGitLab Quick Navigatorがインストールされる

## 仕組み

1. 現在開いているページのURLを取得する
2. URLのpathnameから **Group/Project名** および **feature** を取得する
   - pathnameが `/-/` を含む場合
     - Group/Project名は `/-/` より前の文字列
     - featureは `/-/` より後の文字列
   - pathnameが `/-/` を含まない場合
     - Group/Project名はpathname全体
     - featureは無し
3. [Groups API](https://docs.gitlab.com/ee/api/groups.html) および [Projects API](https://docs.gitlab.com/ee/api/projects.html) を使用して、Group詳細とGroupに属するProjectの一覧を取得する
4. 取得したGroupとProjectの一覧を表示する。現在のページのURLにfeatureが含まれている場合、一覧のアイテムのリンク先のURLにfeatureを連結する

## 制約

Group/Projectのルートページ以外でURLに `/-/` を含まないURLには対応していません。
