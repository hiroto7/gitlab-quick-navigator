# GitLab Quick Navigator

GitLab Quick Navigatorは、GitLab上でのページ移動を1クリックで素早く行えるChrome拡張機能です。
グループやプロジェクトをまたいでページを移動する際の、クリック数や読み込み時間を減らせます。

## 主な機能

- 現在表示しているグループやプロジェクト内のページから、別のグループやプロジェクト内の対応するページへ1クリックで移動できます
  - 例：プロジェクトAのIssue一覧からプロジェクトBのIssue一覧への移動
    - 拡張機能がない場合、2回のページ移動（読み込み待ち）が必要です
  - 例：グループX内のプロジェクトAのマージリクエスト一覧から、グループX全体のマージリクエスト一覧への移動
    - 拡張機能がない場合、3回のページ移動（読み込み待ち）が必要です
- よく使うグループやプロジェクトを「スター」して優先的に表示したり、ドラッグ&ドロップで並べ替えたりできます
- Featuresタブでは、「Issue一覧 → マージリクエスト一覧」といった移動も可能です
  - オプションで「アイテム選択時に自動でタブを切り替える」をオンにすると、「プロジェクトAのIssue一覧からプロジェクトBのマージリクエスト一覧へ」の移動が2クリックで完了し、読み込み待ち時間も短くなります
- アクセストークンを設定することで、プライベートなグループやプロジェクトでも利用できます
- GitLab.com以外でも利用可能です

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
