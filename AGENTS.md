# Satupota - RAG + MCP サンプルプロジェクト

## プロジェクトの目的

Mastra を使って **シンプルな RAG (Retrieval-Augmented Generation) サンプル**を構築し、MCP (Model Context Protocol) として外部に公開する。これにより、Claude Desktop などのクライアントから知識ベースを検索・活用できるようにする。

**特徴:**
- 学習・サンプル目的のシンプルな実装
- 最小限のコードで RAG + MCP の基本を理解できる
- シンプルなファイル構成（必要に応じてファイル分割）

---

## プロジェクト全体のアーキテクチャ（サンプル版）

サンプルとして、**シンプルで理解しやすいファイル構成**を採用:

```
┌─────────────────────────────────────────┐
│  HTTP Server + Bearer Token 認証         │
│  - Express.js                           │
│  - API Key による認証                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  MCP Server (SSE transport)             │
│  - 1 つの検索ツール (rag_search)          │
│  - リモートアクセス可能                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  RAG ロジック (シンプルな関数)              │
│  - OpenAI Embeddings API                │
│  - PostgreSQL + pgvector (永続化)        │
│  - 基本的な検索処理                        │
└─────────────────────────────────────────┘
```

### 複雑な実装との違い

| 項目 | 本番向け実装 | サンプル実装 (このプロジェクト) |
|-----|------------|---------------------------|
| **レイヤー数** | 3 層（Core/App/Interface） | シンプルな構成（必要に応じて分割） |
| **ストレージ** | ベクトル DB + メタデータ DB 分離 | PostgreSQL のみ（統合型） |
| **永続化** | PostgreSQL + pgvector | ✅ PostgreSQL + pgvector |
| **Agent** | RAG Agent で高度な制御 | シンプルな関数 |
| **ツール数** | 複数（search/answer/add/list） | 1 つ（search のみ） |
| **コード量** | 数百〜数千行 | 200〜300 行程度 |
| **学習難易度** | 高い | 中 |

---

## 実装方針

### サンプル実装の流れ

1. **ベクトルストアの初期化**
   - `@mastra/pg` で PostgreSQL + pgvector に接続
   - インデックスを作成
   - サンプルドキュメントを数件追加（永続化される）

2. **RAG 検索機能の実装**
   - クエリをベクトル化
   - 類似ドキュメントを検索
   - 結果を返す

3. **MCP Server の実装**
   - `rag_search` ツールを定義（Agent なし、シンプルな検索のみ）
   - HTTP Server + SSE transport でリモート公開
   - Bearer Token 認証でセキュリティ確保

**注意:** このサンプルでは RAG 側に Agent は実装しない。シンプルな検索機能のみを提供し、回答生成はクライアント側（Claude Desktop）が行う。

### 技術スタック

```json
{
  "@modelcontextprotocol/sdk": "MCP SDK",
  "@mastra/pg": "PostgreSQL + pgvector（永続化）",
  "@ai-sdk/openai": "埋め込み生成",
  "express": "HTTP Server",
  "cors": "CORS 対応",
  "dotenv": "環境変数管理",
  "zod": "スキーマバリデーション"
}
```

### ディレクトリ構成

```
src/
├── index.ts              # エントリーポイント（サーバー起動）
├── vector-store.ts       # ベクトルストア初期化とサンプルデータ
├── rag.ts                # RAG 検索ロジック
├── mcp-server.ts         # MCP Server とツール定義
└── http-server.ts        # Express.js サーバーと認証
```

**ファイル分割の方針:**
- 各ファイルは 50〜100 行程度に収める
- 機能ごとにファイルを分割して可読性を向上
- シンプルさを保ちながら、適度な構造化を行う

---

## 実装ステップ

### Step 0: PostgreSQL のセットアップ（永続化用）

```bash
# Docker Compose で PostgreSQL + pgvector を起動
docker-compose up -d
```

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ragdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

`.env`:
```bash
POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@localhost:5432/ragdb
OPENAI_API_KEY=your-api-key-here
MCP_API_KEY=your-secret-api-key-here
PORT=3000
```

### Step 1: セットアップ

```bash
# 依存関係のインストール
npm install @modelcontextprotocol/sdk @mastra/pg @ai-sdk/openai ai express cors dotenv zod
```

### Step 2: コード実装

機能ごとにファイルを分割して実装:

1. **vector-store.ts**: ベクトルストア初期化とサンプルデータ追加
2. **rag.ts**: RAG 検索関数の実装
3. **mcp-server.ts**: MCP Server とツール定義
4. **http-server.ts**: Express.js サーバーと認証ミドルウェア
5. **index.ts**: エントリーポイントとサーバー起動

### Step 3: MCP 設定

`.cursor/mcp.json` に追加:

```json
{
  "mcpServers": {
    "rag-sample": {
      "command": "node",
      "args": ["dist/rag-mcp.js"]
    }
  }
}
```

### Step 4: 動作確認

Claude Desktop から `rag_search` ツールを呼び出して検索

---

## 拡張のヒント

このサンプルを理解したら、以下のように拡張できるわ:

### レベル 1: 機能追加
- ドキュメント追加ツール (`rag_add_document`)
- ドキュメント一覧ツール (`rag_list_documents`)

### レベル 2: ファイル構造の改善
- 型定義を別ファイルに分離（types.ts）
- 設定を別ファイルに分離（config.ts）
- エラーハンドリングを強化

### レベル 3: 高度化
- Agent の実装（クエリ最適化、品質管理）
- 再ランキング (Reranking)
- ハイブリッド検索

### レベル 4: 本番化
- 認証・認可
- エラーハンドリング
- ロギング・モニタリング
- スケーラビリティ対応

---

## タスクの進め方

このプロジェクトでは `TASKS.md` にタスクの一覧が定義されているわ。以下のルールに従って進めること:

### 基本ルール

1. **タスクは 1 つずつ対応する**
   - `@TASKS.md` から未実行のタスクを 1 つだけ選んで実行する
   - 一度に複数のタスクを対応しないこと
   - 1 つのタスクが完了してから次に進む

2. **完了したらチェックマークをつける**
   - タスク完了後、`TASKS.md` の該当行を `- [ ]` から `- [x]` に変更する
   - 進捗管理セクションも更新すること

3. **進捗を記録する**
   - 各フェーズの完了タスク数を更新
   - 全体進捗も更新

### 実行例

```
ユーザー: @TASKS.md の最初の 1 つだけ実行して
```

↓

1. `TASKS.md` を読んで未実行タスクを確認
2. 最初の未実行タスク（例: `docker-compose.yml の作成`）を実行
3. 完了したら `TASKS.md` を更新:
   ```markdown
   - [x] docker-compose.yml の作成
   ```
4. 進捗セクションも更新:
   ```markdown
   - 完了: 1 / 60 タスク
   - フェーズ 0: 1 / 10
   ```

### 注意事項

- タスクは定義された順序で進めることを推奨
- フェーズをまたぐ場合は前のフェーズが完了していることを確認
- エラーや問題が発生した場合は記録して報告

---

## 参考資料

### MCP 公式ドキュメント

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/anthropics/mcp-sdk)

### Mastra 公式ドキュメント

- [RAG with Mastra](https://mastra.ai/en/docs/rag/vector-databases)
- [PgVector Reference](https://mastra.ai/en/reference/vectors/pg)
