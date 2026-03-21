# AIプラス受講生専用サイト

キャリドラAIプラス受講生向けのコンテンツ閲覧ポータルサイト + 管理画面（CMS）です。

## 実装済み機能

### 受講生機能（Phase 1-3）
- ✅ ログイン・認証（JWT + Cookie）
- ✅ 契約ステータスチェック
- ✅ コンテンツ一覧表示（新着5件）
- ✅ コンテンツ詳細閲覧
- ✅ コンテンツ検索（ページネーション対応）

### 管理機能（Phase 4）
- ✅ 管理者ログイン（role='admin'）
- ✅ コンテンツ一覧表示（下書き含む）
- ✅ コンテンツ作成
- ✅ コンテンツ編集
- ✅ ステータス管理（下書き/公開）
- ✅ 公開日設定
- ✅ カテゴリ管理
- ✅ 権限ガード（受講生は管理画面にアクセス不可）
- ✅ 下書きガード（受講生は下書きコンテンツを閲覧不可）

### ユーザー管理機能（Phase 6）
- ✅ 生徒アカウント一覧表示
- ✅ 生徒検索（生徒ID・名前で検索）
- ✅ 生徒アカウント作成（管理者のみ）
- ✅ 自動パスワード生成（12〜16文字、英数字混合）
- ✅ 契約ステータス管理（有効/期限切れ/キャンセル/停止中）
- ✅ パスワード1回限り表示（作成時のみ）

### パフォーマンス最適化（Phase 3）
- ✅ データベースインデックス（12個）
- ✅ ページネーション実装
- ✅ PostgreSQL対応準備
- ✅ キャッシュ抽象化レイヤー

### 動画再生機能（Phase 5）
- ✅ YouTube動画の埋め込み再生（watch?v= と youtu.be 両対応）
- ✅ Vimeo動画の埋め込み再生
- ✅ 直リンク動画の再生（mp4/mov/webm対応）
- ✅ 未対応URL形式の検出とガイド表示
- ✅ 管理画面でのURL形式ヘルプテキスト

## 技術スタック

- **フレームワーク**: Next.js 16.1.5 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS v4
- **データベース**: SQLite + Prisma ORM v6
- **認証**: JWT + bcryptjs

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルがプロジェクトルートに存在することを確認してください。

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-please-change-in-production"
JWT_EXPIRES_IN="24h"

# App
NEXT_PUBLIC_APP_NAME="AIプラス"
```

### 3. Prisma Clientの生成

Prismaスキーマから型安全なクライアントを生成します。

```bash
npx prisma generate
```

このコマンドは以下を実行します：
- `prisma/schema.prisma` を読み込み
- 型安全なPrisma Clientを `node_modules/@prisma/client` に生成
- TypeScriptの型定義を生成

**重要**: スキーマを変更した場合は必ずこのコマンドを実行してください。

### 4. データベースのマイグレーション

Prismaスキーマからデータベースを作成します。

```bash
npx prisma migrate dev
```

このコマンドは以下を実行します：
- SQLiteデータベースファイル（dev.db）を作成
- スキーマに基づいてテーブルを作成
- 自動的に `npx prisma generate` を実行

### 5. シードデータの投入

テスト用のユーザーとコンテンツデータを投入します。

```bash
npx prisma db seed
```

このコマンドで以下のデータが作成されます：

**ユーザー:**
- ADMIN001（管理者）- role: admin, contract_status: active - **管理画面ログイン可能**
- STU001（山田太郎）- role: student, contract_status: active - ログイン可能
- STU002（佐藤花子）- role: student, contract_status: expired - ログイン不可

**カテゴリ:**
- キャリア戦略
- 面接対策
- 職務経歴書

**コンテンツ:**
- 5件の公開済みコンテンツ（動画、テキスト、PDF、音声の混合）

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## ログイン情報

### 管理者（Phase 4）
管理画面にアクセスするには以下の認証情報を使用してください：

```
URL: http://localhost:3000/admin/login
管理者ID: ADMIN001
パスワード: password123
```

ログイン後、コンテンツの作成・編集・公開が可能です。

### 受講生（Phase 1-3）

**アクティブユーザー（ログイン成功）:**
```
URL: http://localhost:3000/login
生徒ID: STU001
パスワード: password123
```

**契約終了ユーザー（ログイン失敗）:**
```
生徒ID: STU002
パスワード: password123
```

---

## クイックスタート：コンテンツ公開フロー

管理画面でコンテンツを作成してから受講生側に反映されるまでの流れ：

### 1. 管理者でログイン
```
http://localhost:3000/admin/login
ADMIN001 / password123
```

### 2. コンテンツを作成
1. 「新規作成」ボタンをクリック
2. フォームに入力：
   - タイトル: 「新しいコンテンツ」
   - 説明: 「テストコンテンツです」
   - タイプ: 「テキスト」
   - カテゴリ: 「キャリア戦略」
   - ステータス: **「下書き」**
3. 「作成」ボタンをクリック

### 3. 下書き状態の確認
- 管理画面の一覧に表示される（「下書き」バッジ付き）
- 受講生側のホーム画面には**表示されない**

### 4. 公開
1. 作成したコンテンツの「編集」リンクをクリック
2. ステータスを **「公開」** に変更
3. 公開日を今日の日付に設定
4. 「更新」ボタンをクリック

### 5. 受講生側で確認
1. 別タブで `http://localhost:3000/login` にアクセス
2. STU001でログイン
3. ホーム画面に新しいコンテンツが**表示される**
4. カードをクリックして詳細ページで閲覧可能

---

## 動作確認手順

### Phase 1: 認証機能

#### 1. ログイン成功テスト
1. http://localhost:3000/login にアクセス
2. 以下の認証情報でログイン：
   - 生徒ID: `STU001`
   - パスワード: `password123`
3. ✅ `/home` にリダイレクトされることを確認
4. ✅ ヘッダーにキャリドラロゴと「AIプラス」が表示されることを確認

#### 2. ログイン失敗テスト（契約終了）
1. http://localhost:3000/login にアクセス
2. 以下の認証情報でログイン：
   - 生徒ID: `STU002`
   - パスワード: `password123`
3. ✅ エラーメッセージ「契約が終了しています。ログインできません。」が表示されることを確認
4. ✅ `/login` ページに留まることを確認

#### 3. 未認証アクセステスト
1. ログアウト状態で http://localhost:3000/home に直接アクセス
2. ✅ 自動的に `/login` にリダイレクトされることを確認

#### 4. ログアウトテスト
1. ログイン後、ヘッダーの「ログアウト」ボタンをクリック
2. ✅ `/login` にリダイレクトされることを確認
3. `/home` に直接アクセスを試みる
4. ✅ `/login` にリダイレクトされることを確認

### Phase 2: コンテンツ閲覧機能

#### 1. ホーム画面のコンテンツ一覧表示
1. STU001でログイン
2. ✅ 新着コンテンツが5件、カード形式で表示されることを確認
3. ✅ 各カードに以下が表示されることを確認：
   - タイトル
   - 説明文
   - カテゴリ名（青いバッジ）
   - コンテンツタイプ（動画/テキスト/PDF/音声）
   - 公開日

#### 2. コンテンツ詳細ページ
1. ホーム画面でコンテンツカードをクリック
2. ✅ `/content/[id]` ページに遷移することを確認
3. ✅ 以下の情報が表示されることを確認：
   - タイトル
   - カテゴリ
   - コンテンツタイプ
   - 公開日
   - 説明文
   - 詳細内容（bodyフィールド）

#### 3. コンテンツタイプ別の表示
- **動画コンテンツ**: video_urlが表示され、「動画の再生機能はPhase 3で実装予定です」というメッセージが表示される
- **テキストコンテンツ**: 詳細内容が表示される
- **PDFコンテンツ**: 「PDF表示機能は準備中です」というメッセージが表示される
- **音声コンテンツ**: 「音声の再生機能は準備中です」というメッセージが表示される

#### 4. ナビゲーション
1. コンテンツ詳細ページで「ホームに戻る」リンクをクリック
2. ✅ `/home` ページに戻ることを確認

### Phase 3: 検索機能

#### 1. コンテンツ検索機能
1. ヘッダーまたはホーム画面から `/search` ページにアクセス
2. 検索フォームにキーワードを入力（例: 「キャリア」「面接」）
3. ✅ 検索ボタンをクリックして検索を実行
4. ✅ 検索結果がカード形式で表示されることを確認
5. ✅ 各カードに以下が表示されることを確認：
   - タイトル
   - 説明文
   - カテゴリ名
   - コンテンツタイプ
   - 公開日
6. ✅ 検索結果が0件の場合、適切なメッセージが表示されることを確認
7. ✅ 検索結果のカードをクリックして詳細ページに遷移できることを確認

**テストケース**:
- キーワード「キャリア」→ 該当コンテンツが表示される
- キーワード「面接」→ 該当コンテンツが表示される
- キーワード「存在しないワード」→ 0件のメッセージが表示される

### Phase 4: 管理画面（ミニCMS）

#### 1. 管理者ログイン
1. http://localhost:3000/admin/login にアクセス
2. 以下の認証情報でログイン：
   - 管理者ID: `ADMIN001`
   - パスワード: `password123`
3. ✅ `/admin/contents` にリダイレクトされることを確認
4. ✅ ヘッダーに「AIプラス CMS」が表示されることを確認

#### 2. コンテンツ一覧（管理画面）
1. ✅ 既存の5件のコンテンツが表示されることを確認
2. ✅ 各コンテンツに以下が表示されることを確認：
   - タイトルと説明
   - カテゴリ名
   - タイプ（動画/テキスト/音声/PDF）
   - ステータス（公開中/下書き）
   - 公開日
   - 編集リンク
3. ✅ ステータス絞り込み（すべて/公開中/下書き）が動作することを確認
4. ✅ 「新規作成」ボタンが表示されることを確認

#### 3. コンテンツ作成
1. 「新規作成」ボタンをクリック
2. `/admin/contents/new` に遷移することを確認
3. 以下の内容で新規コンテンツを作成：
   ```
   タイトル: テスト投稿 - Phase 4
   説明: 管理画面から作成したテストコンテンツ
   本文: これは管理画面のテストです。
   タイプ: テキスト
   カテゴリ: キャリア戦略
   ステータス: 下書き
   ```
4. ✅ 「作成」ボタンをクリックして保存
5. ✅ 一覧ページにリダイレクトされることを確認
6. ✅ 作成したコンテンツが一覧の先頭に表示されることを確認
7. ✅ ステータスが「下書き」バッジで表示されることを確認

#### 4. コンテンツ編集・公開
1. 作成したコンテンツの「編集」リンクをクリック
2. ✅ `/admin/contents/[id]/edit` に遷移することを確認
3. ✅ フォームに既存の値が入力されていることを確認
4. 以下の内容を変更：
   ```
   タイトル: テスト投稿 - Phase 4（公開）
   ステータス: 公開
   公開日: 今日の日付を選択
   ```
5. ✅ 「更新」ボタンをクリックして保存
6. ✅ 一覧ページにリダイレクトされることを確認
7. ✅ タイトルとステータスが更新されていることを確認

#### 5. 受講生側での反映確認
1. 別のブラウザまたはシークレットウィンドウで http://localhost:3000/login にアクセス
2. 受講生でログイン：
   - 生徒ID: `STU001`
   - パスワード: `password123`
3. ✅ ホーム画面（`/home`）に新しく公開したコンテンツが表示されることを確認
4. ✅ コンテンツが公開日順（新しい順）に並んでいることを確認
5. 新しいコンテンツのカードをクリック
6. ✅ 詳細ページで内容が正しく表示されることを確認

#### 6. 下書きコンテンツのガード
1. 管理画面で新しい下書きコンテンツを作成：
   ```
   タイトル: 下書きテスト
   説明: これは下書きです
   ステータス: 下書き
   ```
2. ✅ 一覧に表示されることを確認
3. コンテンツIDをURLからコピー
4. 受講生ログイン状態で `/content/[コピーしたID]` に直接アクセス
5. ✅ 404ページが表示される、またはホームにリダイレクトされることを確認
6. ✅ ホーム画面の新着一覧に下書きが表示されないことを確認
7. 検索ページで検索を実行
8. ✅ 検索結果に下書きが含まれないことを確認

#### 7. 権限ガード
1. 受講生ログイン状態で `/admin/contents` に直接アクセス
2. ✅ `/admin/login` にリダイレクトされることを確認
3. 管理者ログインページで受講生IDを入力：
   - 生徒ID: `STU001`
   - パスワード: `password123`
4. ✅ 「管理者権限がありません」というエラーが表示されることを確認
5. ✅ ログインできないことを確認

### Phase 5: 動画再生機能

#### 1. YouTube動画の再生テスト
1. 管理者でログイン（ADMIN001 / password123）
2. 新規コンテンツを作成：
   ```
   タイトル: YouTube動画テスト
   説明: YouTube埋め込みテスト
   タイプ: 動画
   動画URL: https://youtu.be/dQw4w9WgXcQ （またはwatch?v=形式）
   ステータス: 公開
   公開日: 今日の日付
   ```
3. 保存後、受講生でログイン（STU001 / password123）
4. ホーム画面で作成したコンテンツをクリック
5. ✅ YouTube動画が埋め込みプレーヤーで表示されることを確認
6. ✅ プレーヤーの再生・一時停止・音量調整が動作することを確認

#### 2. Vimeo動画の再生テスト
1. 管理者で新規コンテンツを作成：
   ```
   タイトル: Vimeo動画テスト
   動画URL: https://vimeo.com/148751763
   ステータス: 公開
   ```
2. 受講生側で確認
3. ✅ Vimeo動画が埋め込みプレーヤーで表示されることを確認

#### 3. 直リンク動画の再生テスト
1. 管理者で新規コンテンツを作成：
   ```
   タイトル: 直リンク動画テスト
   動画URL: https://example.com/sample.mp4 （実際のmp4 URLを使用）
   ステータス: 公開
   ```
2. 受講生側で確認
3. ✅ HTML5ビデオプレーヤーで表示されることを確認
4. ✅ 再生コントロールが表示され、動作することを確認

#### 4. 未対応URL形式のガイド表示テスト
1. 管理者で新規コンテンツを作成：
   ```
   タイトル: 未対応URLテスト
   動画URL: https://drive.google.com/file/d/XXXXX/view
   ステータス: 公開
   ```
2. 受講生側で確認
3. ✅ 黄色の警告ボックスが表示されることを確認
4. ✅ 「動画を再生できません」というメッセージが表示されることを確認
5. ✅ Google Drive用の解決方法（変換手順）が表示されることを確認
6. ✅ 現在のURLが表示されることを確認

#### 5. 管理画面のヘルプテキスト確認
1. 管理者でログイン
2. 「新規作成」または既存コンテンツの「編集」をクリック
3. 動画URLフィールドまでスクロール
4. ✅ 青い背景のヘルプボックスが表示されることを確認
5. ✅ 以下の情報が表示されることを確認：
   - YouTube URL形式（2種類）
   - Vimeo URL形式
   - 直リンク形式
   - Google Drive/Dropboxの警告

#### 6. URL形式の自動判定テスト

**テストケース:**

| URL形式 | 期待される動作 |
|---------|---------------|
| `https://youtu.be/VIDEO_ID` | YouTube埋め込み |
| `https://www.youtube.com/watch?v=VIDEO_ID` | YouTube埋め込み |
| `https://vimeo.com/123456` | Vimeo埋め込み |
| `https://example.com/video.mp4` | HTML5プレーヤー |
| `https://example.com/video.mov` | HTML5プレーヤー |
| `https://example.com/video.webm` | HTML5プレーヤー |
| `https://drive.google.com/file/d/XXX/view` | ガイド表示（Google Drive） |
| `https://www.dropbox.com/s/XXX/video.mp4?dl=0` | ガイド表示（Dropbox） |

### Phase 6: ユーザー管理機能

#### 1. ユーザー管理画面へのアクセス
1. 管理者でログイン（ADMIN001 / password123）
2. ヘッダーの「コンテンツ管理」ボタンの隣に「ユーザー管理」が表示されていることを確認（または直接 http://localhost:3000/admin/users にアクセス）
3. ✅ ユーザー一覧ページが表示されることを確認
4. ✅ 既存の生徒（STU001, STU002）が表示されることを確認
5. ✅ 各生徒に以下が表示されることを確認：
   - 生徒ID
   - 名前
   - 契約ステータス（ドロップダウン）
   - 登録日
   - ステータスバッジ（有効/期限切れ/キャンセル/停止中）

#### 2. 生徒検索機能
1. ユーザー管理画面の検索ボックスに「STU001」と入力
2. 「検索」ボタンをクリック
3. ✅ STU001のみが表示されることを確認
4. 検索ボックスに「山田」と入力して検索
5. ✅ 名前に「山田」を含む生徒が表示されることを確認
6. 「クリア」ボタンをクリック
7. ✅ すべての生徒が再表示されることを確認

#### 3. 生徒アカウント作成
1. 「生徒を追加」ボタンをクリック
2. ✅ `/admin/users/new` に遷移することを確認
3. 以下の情報を入力：
   ```
   生徒ID: STU003
   名前: 鈴木一郎
   契約ステータス: 有効
   ```
4. ✅ 青い背景のパスワード自動生成の説明が表示されることを確認
5. 「生徒を追加」ボタンをクリック
6. ✅ 作成完了画面に遷移することを確認
7. ✅ 以下が表示されることを確認：
   - 生徒ID: STU003
   - 名前: 鈴木一郎
   - 契約ステータス: 有効
   - 自動生成されたパスワード（12〜16文字、英数字混合）
   - 「コピー」ボタン
8. ✅ 黄色の背景でパスワードが強調表示されることを確認
9. ✅ 赤い警告文「パスワードはこの画面でのみ表示されます。」が表示されることを確認

#### 4. パスワードコピー機能
1. 「コピー」ボタンをクリック
2. ✅ ボタンのテキストが「コピー済み」に変わることを確認
3. テキストエディタなどに貼り付けてパスワードがコピーされていることを確認

#### 5. 名前省略時の動作確認
1. 作成完了画面で「続けて追加」ボタンをクリック
2. 以下の情報を入力（名前は空欄）：
   ```
   生徒ID: STU004
   名前: （空欄のまま）
   契約ステータス: 有効
   ```
3. 「生徒を追加」ボタンをクリック
4. ✅ 作成完了画面で名前が「STU004」（生徒IDと同じ）になっていることを確認

#### 6. 新規作成した生徒でのログイン確認
1. 「ユーザー管理に戻る」ボタンをクリック
2. ✅ ユーザー一覧に新しい生徒（STU003, STU004）が表示されることを確認
3. 管理画面からログアウト
4. 受講生ログイン画面（http://localhost:3000/login）にアクセス
5. 作成した認証情報でログイン：
   - 生徒ID: STU003
   - パスワード: （作成時にコピーしたパスワード）
6. ✅ ログインに成功し、`/home` に遷移することを確認
7. ✅ ホーム画面が正常に表示されることを確認

#### 7. 契約ステータス変更機能
1. 管理者でログイン（ADMIN001 / password123）
2. `/admin/users` に移動
3. STU003のステータスドロップダウンを「期限切れ」に変更
4. ✅ ステータスが即座に更新されることを確認
5. ✅ ステータスバッジが「期限切れ」（赤）に変わることを確認
6. 管理画面からログアウト
7. 受講生ログイン画面で STU003 でログインを試みる
8. ✅ エラーメッセージ「契約が終了しています。ログインできません。」が表示されることを確認
9. ✅ ログインできないことを確認

#### 8. 重複生徒ID制約の確認
1. 管理者でログイン
2. 「生徒を追加」ボタンをクリック
3. 既存の生徒IDを入力：
   ```
   生徒ID: STU001
   名前: テストユーザー
   ```
4. 「生徒を追加」ボタンをクリック
5. ✅ エラーメッセージ「この生徒IDは既に使用されています」が表示されることを確認
6. ✅ 作成完了画面に遷移しないことを確認

#### 9. 受講生からのアクセス制限確認
1. 受講生でログイン（STU001 / password123）
2. ブラウザのアドレスバーに http://localhost:3000/admin/users を直接入力
3. ✅ `/admin/login` にリダイレクトされることを確認
4. ✅ ユーザー管理画面にアクセスできないことを確認

## プロジェクト構造

```
ai-plus-portal/
├── app/
│   ├── login/              # 受講生ログインページ
│   ├── home/               # ホーム画面（コンテンツ一覧）
│   ├── content/[id]/       # コンテンツ詳細ページ
│   ├── search/             # 検索ページ (Phase 3)
│   ├── admin/              # 管理画面 (Phase 4)
│   │   ├── login/          # 管理者ログインページ
│   │   ├── contents/       # コンテンツ管理
│   │   │   ├── page.tsx    # 一覧
│   │   │   ├── new/        # 作成
│   │   │   └── [id]/edit/  # 編集
│   │   └── users/          # ユーザー管理 (Phase 6)
│   │       ├── page.tsx    # 一覧・検索
│   │       └── new/        # 生徒アカウント作成
│   ├── api/
│   │   ├── auth/           # 受講生認証API
│   │   ├── admin/          # 管理者用API (Phase 4)
│   │   │   ├── auth/       # 管理者認証API
│   │   │   ├── contents/   # コンテンツ管理API
│   │   │   └── users/      # ユーザー管理API (Phase 6)
│   │   └── search/         # 検索API (Phase 3)
│   └── layout.tsx          # ルートレイアウト
├── components/
│   ├── auth/               # 認証関連コンポーネント
│   ├── layout/             # レイアウトコンポーネント
│   └── video/              # 動画関連コンポーネント (Phase 5)
│       └── VideoPlayer.tsx # 動画プレーヤー
├── lib/
│   ├── auth/               # 認証ロジック（JWT, パスワード）
│   │   ├── jwt.ts          # JWT生成・検証
│   │   ├── password.ts     # bcryptパスワードハッシュ化
│   │   └── password-generator.ts  # 安全なパスワード自動生成 (Phase 6)
│   ├── cache/              # キャッシュ抽象化レイヤー (Phase 3)
│   ├── video/              # 動画URL解析 (Phase 5)
│   │   └── parser.ts       # URL形式判定・埋め込みURL生成
│   └── db/                 # データベースアクセス
│       ├── prisma.ts       # Prisma Clientシングルトン
│       ├── users.ts        # ユーザー関連（管理機能含む）
│       └── contents.ts     # コンテンツ関連（管理機能含む）
├── prisma/
│   ├── schema.prisma       # データベーススキーマ
│   ├── migrations/         # マイグレーションファイル
│   └── seed.ts             # シードデータ
├── types/                  # TypeScript型定義
└── middleware.ts           # 認証ミドルウェア（role対応）
```

## データベース設計

### スキーマ概要

#### User（ユーザー）
- id: UUID（主キー）
- student_id: 生徒ID（ユニーク）
- name: 名前
- password_hash: パスワードハッシュ
- role: ロール（student/admin）**[Phase 4で追加]**
- contract_status: 契約ステータス（active/expired/cancelled/suspended）
- created_at: 作成日時

**インデックス:**
- `contract_status` - アクティブユーザーのフィルタリング用
- `created_at` - 管理画面でのソート用
- `role` - ロールベースアクセス制御用 **[Phase 4で追加]**

#### Category（カテゴリ）
- id: UUID（主キー）
- name: カテゴリ名
- sort_order: 表示順序
- created_at: 作成日時

**インデックス:**
- `sort_order` - カテゴリソート用

#### Content（コンテンツ）
- id: UUID（主キー）
- title: タイトル
- description: 説明文
- body: 詳細内容（オプション）
- type: コンテンツタイプ（video/text/audio/pdf）
- video_url: 動画URL（オプション）
- status: ステータス（draft/published）
- published_at: 公開日
- category_id: カテゴリID（外部キー）
- created_at: 作成日時
- updated_at: 更新日時

**インデックス:**
- `(status, published_at DESC)` - 新着コンテンツ取得（最重要）
- `(status, title)` - タイトル検索用
- `(status, description)` - 説明文検索用
- `(category_id, status, published_at)` - カテゴリフィルタ用
- `(type, status)` - タイプ別フィルタ用

### PostgreSQL対応

本システムは開発環境ではSQLite、本番環境ではPostgreSQLをサポートしています。

#### 開発環境（SQLite）

`.env` に以下を設定:

```env
DATABASE_URL="file:./dev.db"
```

`prisma/schema.prisma` のproviderは `"sqlite"` のまま。

#### 本番環境（PostgreSQL）

1. `prisma/schema.prisma` のdatasourceを変更:

```prisma
datasource db {
  provider = "postgresql"  // "sqlite" から変更
  url      = env("DATABASE_URL")
}
```

2. `.env` に PostgreSQL 接続文字列を設定:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&connection_limit=20&pool_timeout=10"
```

3. マイグレーション実行:

```bash
npx prisma migrate deploy
```

### パフォーマンス最適化

#### インデックス戦略

合計8個のインデックスを実装:
- User: 3個
- Category: 1個
- Content: 5個（検索・フィルタリング最適化）

#### ページネーション

**検索機能（オフセット方式）:**
- ページサイズ: 20件/ページ（最大100件）
- クエリパラメータ: `?q=keyword&page=1&limit=20`

#### キャッシュ準備

`lib/cache/index.ts` にキャッシュ抽象化レイヤーを実装済み。Phase 4でRedis/Vercel KVを導入予定。

### パフォーマンス目標値

#### 想定データ規模（1000ユーザー）
- Users: 1,000件
- Contents: 500件
- DBサイズ: 約10-15MB（インデックス含む）

#### レスポンスタイム目標
- ホーム画面: < 200ms
- 検索（ページ1）: < 300ms
- ログイン: < 100ms

#### インデックスの効果（SQLite → PostgreSQL）
- Content新着取得: 約80%高速化
- 検索クエリ: 約70%高速化

## スケーラビリティ設計

### 動画配信戦略

#### ストレージオプション
1. **Vercel Blob Storage** (推奨・Phase 4)
   - Next.js最適化済み
   - CDN自動配信
   - 月額: $0.15/GB + $0.20/GB転送

2. **AWS S3 + CloudFront**
   - 大規模向け
   - 細かい制御可能
   - 月額: $0.023/GB + $0.085/GB転送

3. **YouTube Private/Vimeo Pro** (短期実装)
   - 最も簡単
   - 埋め込みプレーヤー
   - ストリーミング最適化済み

#### ストリーミング最適化
- HLS（HTTP Live Streaming）対応
- 適応ビットレート（360p/720p/1080p）
- プログレッシブダウンロード
- ウォーターマーク保護（オプション）

### 監視・運用設計

#### Application Performance Monitoring (APM)
- **Vercel Analytics** - ページパフォーマンス
- **Sentry** - エラートラッキング
- **Prisma Pulse** - データベース監視（PostgreSQL）

#### ログ戦略
- **開発**: Console logs
- **本番**: Vercel Logs + 構造化ログ（JSON）
- **重要イベント**: Slack通知（エラー）

#### バックアップ戦略
- **PostgreSQL**: 日次自動バックアップ（7日保持）
- **メディアファイル**: S3/Blob Storage（自動冗長化）
- **リカバリーポイント**: 24時間以内

### セキュリティ強化

#### 実装済み
- JWT認証（24時間有効期限）
- bcryptパスワードハッシュ（ソルト10ラウンド）
- ミドルウェア認証ガード
- 契約ステータス検証

#### Phase 4以降
- レート制限（API: 100req/min/IP）
- CORS設定（本番環境）
- CSP（Content Security Policy）
- 2段階認証（TOTP）
- セッション管理強化

### コスト見積もり（月額、1000ユーザー想定）

#### Vercel（ホスティング）
- Pro Plan: $20/月
- 帯域幅: 1TB（超過時$40/TB）
- ビルド時間: 400時間（超過時$10/100h）

#### データベース
- **Vercel Postgres**: $20/月（Starter: 60GB転送、0.5GB storage）
- **Neon**: $0-19/月（無料枠あり、Autoscaling）
- **Supabase**: $25/月（Pro: 8GB DB、100GB transfer）

#### ストレージ（動画）
- **Vercel Blob**: $15-50/月（100GB storage + 200GB転送）
- **AWS S3**: $10-30/月（100GB + CloudFront）

#### 監視
- **Sentry**: $0-26/月（Developer: 5K errors/月）
- **Vercel Analytics**: 含まれる

**合計目安: $50-120/月**

### スケーリング戦略

#### 0-100ユーザー（現状）
- SQLite開発環境
- Vercel Hobby（無料）
- YouTube埋め込み

#### 100-1,000ユーザー（Phase 3-4）
- PostgreSQL（Vercel/Neon）
- Vercel Pro
- Vercel Blob + CDN
- ページネーション実装済み

#### 1,000-10,000ユーザー（Phase 5以降）
- PostgreSQL Read Replica
- Redis/Vercel KV キャッシュ
- Full-text Search（PostgreSQL tsvector）
- 動画配信CDN最適化

#### 10,000+ユーザー
- データベースパーティショニング
- マイクロサービス化検討
- 専用動画配信インフラ
- Kubernetes（オプション）

### パフォーマンステスト

#### ローカルテスト

```bash
# シードデータを大量生成（1000ユーザー、500コンテンツ）
npm run seed:large

# 開発サーバー起動
npm run dev

# 手動テスト
# - ホーム画面の読み込み時間を測定
# - 検索ページネーション動作確認
```

#### 負荷テスト（k6/Artillery）

```bash
# k6をインストール
brew install k6

# 負荷テストスクリプト実行
k6 run tests/load/search.js
```

#### データベースクエリ分析

```bash
# Prisma Studio で実行計画を確認
npx prisma studio

# ログでクエリ時間を確認（lib/db/prisma.ts）
# log: ['query', 'info', 'warn', 'error'] に変更
```

## API一覧

### 受講生用API

#### 認証
- `POST /api/auth/login` - 受講生ログイン
- `POST /api/auth/logout` - ログアウト

#### コンテンツ
- `GET /api/search?q={keyword}&page={page}&limit={limit}` - コンテンツ検索（ページネーション対応）

### 管理者用API（Phase 4）

#### 認証
- `POST /api/admin/auth/login` - 管理者ログイン
  - リクエスト: `{ student_id: string, password: string }`
  - レスポンス: `{ success: boolean, user?: { id, student_id, name, role } }`
  - 認証: 不要
  - 権限: role='admin' のユーザーのみ

#### コンテンツ管理
- `GET /api/admin/contents?status={status}` - コンテンツ一覧取得（下書き含む）
  - パラメータ:
    - `status` (optional): 'draft' | 'published' | undefined（全て）
  - レスポンス: `{ success: boolean, contents: Content[], categories: Category[] }`
  - 認証: 必須（JWT）
  - 権限: role='admin'

- `POST /api/admin/contents` - コンテンツ作成
  - リクエスト:
    ```typescript
    {
      title: string
      description: string
      body?: string | null
      type: 'video' | 'text' | 'audio' | 'pdf'
      video_url?: string | null
      status: 'draft' | 'published'
      published_at?: string | null  // ISO 8601 format
      category_id: string
    }
    ```
  - レスポンス: `{ success: boolean, content: Content }`
  - 認証: 必須（JWT）
  - 権限: role='admin'

- `GET /api/admin/contents/[id]` - コンテンツ詳細取得（編集用）
  - レスポンス: `{ success: boolean, content: Content }`
  - 認証: 必須（JWT）
  - 権限: role='admin'

- `PUT /api/admin/contents/[id]` - コンテンツ更新
  - リクエスト: 同上（全フィールドoptional）
  - レスポンス: `{ success: boolean, content: Content }`
  - 認証: 必須（JWT）
  - 権限: role='admin'

#### ユーザー管理（Phase 6）
- `GET /api/admin/users?query={query}` - 生徒一覧取得・検索
  - パラメータ:
    - `query` (optional): 生徒IDまたは名前で部分一致検索
  - レスポンス:
    ```typescript
    {
      success: boolean
      users: Array<{
        id: string
        student_id: string
        name: string
        role: string
        contract_status: string
        created_at: Date
      }>
    }
    ```
  - 認証: 必須（JWT）
  - 権限: role='admin'

- `POST /api/admin/users` - 生徒アカウント作成
  - リクエスト:
    ```typescript
    {
      student_id: string       // 必須、ユニーク
      name?: string            // 任意（空の場合はstudent_idを使用）
      contract_status?: string // 任意（デフォルト: 'active'）
    }
    ```
  - レスポンス:
    ```typescript
    {
      success: boolean
      user: {
        id: string
        student_id: string
        name: string
        role: string
        contract_status: string
        created_at: Date
      }
      password: string  // 自動生成されたパスワード（この時のみ表示）
    }
    ```
  - 認証: 必須（JWT）
  - 権限: role='admin'
  - 注意: パスワードは12〜16文字の英数字混合で自動生成され、bcryptでハッシュ化されます。平文パスワードはレスポンスでのみ返され、二度と取得できません。

- `PATCH /api/admin/users/[id]` - 契約ステータス更新
  - リクエスト:
    ```typescript
    {
      contract_status: 'active' | 'expired' | 'cancelled' | 'suspended'
    }
    ```
  - レスポンス:
    ```typescript
    {
      success: boolean
      user: {
        id: string
        student_id: string
        name: string
        role: string
        contract_status: string
        created_at: Date
      }
    }
    ```
  - 認証: 必須（JWT）
  - 権限: role='admin'

### 認証方式

**JWT (JSON Web Token)**
- Cookie名: `auth_token`
- 有効期限: 24時間
- ペイロード:
  ```typescript
  {
    userId: string
    studentId: string
    name: string
    role: 'student' | 'admin'
    contractStatus: ContractStatus
  }
  ```

### エラーレスポンス

すべてのAPIは以下の形式でエラーを返します：
```typescript
{
  success: false
  message: string
  errors?: Array<{ message: string, path?: string[] }>
}
```

**HTTPステータスコード:**
- `400` - バリデーションエラー
- `401` - 認証エラー（未ログイン）
- `403` - 権限エラー（管理者権限なし、契約終了など）
- `404` - リソースが見つからない
- `500` - サーバーエラー

## 今後の実装予定（Phase 7以降）

### Phase 7: 残りのメディア再生機能
- ~~動画再生機能（埋め込みプレーヤー）~~ **✅ Phase 5で実装完了**
- PDF表示機能（インラインビューア）
- 音声再生機能（オーディオプレーヤー）

### Phase 8: 拡張機能
- カテゴリフィルタリング
- 視聴進捗管理
- お気に入り機能
- レコメンド機能

### Phase 9: 管理画面の拡張
- ~~コンテンツ管理（CMS）~~ **✅ Phase 4で実装完了**
- ~~ユーザー管理~~ **✅ Phase 6で実装完了**
- 分析ダッシュボード
- パスワードリセット機能

### Phase 10: セキュリティ強化
- 2段階認証（TOTP）
- ログイン試行制限
- セッション管理強化

## データベースコマンド

```bash
# Prisma Clientの生成（スキーマから型安全なクライアントを生成）
npx prisma generate

# マイグレーション実行（DBスキーマの更新 + 自動的にgenerateも実行）
npx prisma migrate dev

# シードデータ投入
npx prisma db seed

# Prisma Studioでデータベースを確認（GUIツール）
npx prisma studio
```

### スキーマを変更した場合の手順

`prisma/schema.prisma` を変更した場合は以下の手順を実行してください：

```bash
# 1. Prisma Clientを再生成
npx prisma generate

# 2. マイグレーションを作成して適用
npx prisma migrate dev --name <migration_name>

# 3. 必要に応じてシードデータを再投入
npx prisma db seed
```

## トラブルシューティング

### Prisma Clientのエラー（`Cannot read properties of undefined`）

スキーマを変更後にPrisma Clientが正しく生成されていない場合に発生します。

```bash
# Prisma Clientを再生成
npx prisma generate

# 開発サーバーを再起動
npm run dev
```

**根本原因**:
- `prisma/schema.prisma` を変更した後、`npx prisma generate` を実行していない
- Prisma Clientのキャッシュが古い

### データベースをリセットしたい場合

```bash
# データベースファイルを削除
rm prisma/dev.db

# Prisma Clientを再生成
npx prisma generate

# マイグレーションを再実行
npx prisma migrate dev

# シードデータを再投入
npx prisma db seed
```

### ポート3000が使用中の場合

Next.jsは自動的に別のポート（3001など）を使用します。
ターミナルに表示されるURLを確認してください。
