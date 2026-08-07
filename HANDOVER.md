# irodori HP 開発・運用引き継ぎ資料（Claude Code向け）

このドキュメントは、irodoriのHP（ https://irodori-fukuoka.com ）の更新・改修作業を引き継ぐAIアシスタント（Claude Code等）に向けたシステム仕様書です。

## 1. プロジェクトの基本構造
このサイトは、React等のフレームワークを使用しない **Vanilla HTML/CSS/JS によるSPA（シングルページアプリケーション）** として構築されています。
バックエンド（カレンダー連携用）として、Vercel Serverless Functions (`api/events.js`) を使用しています。

*   **`index.html`**: メインのHTMLファイル。すべてのセクション（トップ、活動内容、メンバー紹介、過去の活動実績など）がこのファイル内に記述されており、JavaScriptで表示/非表示を切り替えています。
*   **`style.css`**: デザイン用のCSS。変数は `:root` に定義されています（テーマカラー等）。
*   **`script.js`**: フロントエンドのロジック。SPAのルーティング（`navigateTo`）、イベントリストの描画、カレンダーの描画、URLリンクの紐付けなどを行います。
*   **`api/events.js`**: Googleカレンダーの公開iCal URLからデータを取得し、JSONにパースしてフロントエンドに返すAPIです。

## 2. よくある更新作業と対応箇所

### ① イベントのリンク（URL）の追加・変更
カレンダーやイベントリストから飛ぶInstagramなどのURLを設定する場合、**`script.js` の上部にある `EVENT_URLS`** を編集してください。
```javascript
const EVENT_URLS = {
    '20260718': 'https://www.instagram.com/p/...',
    '20260908': 'https://www.instagram.com/p/...',
};
```
※ 日付キー（YYYYMMDD形式）に対してURLを追加するだけで、自動的に過去のイベント一覧にもリンクが適用されます。

### ② トップページの「お知らせ」への手動追加
トップページの「お知らせ」に数日間だけ特定の情報をピン留めしたい場合、**`index.html` の `<div id="note-blog-grid">` 内** に `<a>` タグを手動で追加します。
この際、`class="manual-news-item"` と `data-publish-date="YYYY-MM-DD"`（追加した日の日付）を付与してください。
`script.js` 側で、この `publish-date` から7日間経過すると自動的に非表示になるように制御されています。

### ③ Googleカレンダーに登録された特定イベントの非表示
Googleカレンダーには存在するがHPには表示させたくないイベントがある場合は、**`api/events.js`** 内のフィルタリング処理（`!e.title.includes('非表示にしたいキーワード')`）に追加してください。

## 3. SPAルーティングについて
*   `navigateTo(pageId, pushState, targetSectionId)` 関数で画面の切り替えとスクロール制御を行っています。
*   `index.html` 内の各ページセクションは `id="page-home"`, `id="page-history"` などのIDを持ち、`.page` クラスが付与されています。
*   直接リンク（例: `/#events`）に対応するため、`DOMContentLoaded` イベント内でURLのハッシュを解釈して初期ルーティングを行っています。

## 4. デプロイとGit管理
このプロジェクトはGitHub（`main` ブランチ）と連携しており、**`git push origin main`** を実行することで、Vercelへ自動的にデプロイされます。ファイルの編集後は必ず commit と push を行ってください。
