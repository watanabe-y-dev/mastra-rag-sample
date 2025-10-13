# Satupota - RAG + MCP サンプルプロジェクト

## プロジェクトの目的

Mastra を使って **シンプルな RAG (Retrieval-Augmented Generation) サンプル**を構築し、MCP (Model Context Protocol) として外部に公開する。これにより、Claude Desktop などのクライアントから知識ベースを検索・活用できるようにする。

**特徴:**
- 学習・サンプル目的のシンプルな実装
- 最小限のコードで RAG + MCP の基本を理解できる
- 1 ファイルで完結する設計

---

## プロジェクト全体のアーキテクチャ（サンプル版）

サンプルとして、**シンプルで理解しやすい 1 ファイル構成**を採用:

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
| **レイヤー数** | 3 層（Core/App/Interface） | 1 ファイルで完結 |
| **ストレージ** | ベクトル DB + メタデータ DB 分離 | PostgreSQL のみ（統合型） |
| **永続化** | PostgreSQL + pgvector | ✅ PostgreSQL + pgvector |
| **Agent** | RAG Agent で高度な制御 | シンプルな関数 |
| **ツール数** | 複数（search/answer/add/list） | 1 つ（search のみ） |
| **コード量** | 数百〜数千行 | 150 行程度 |
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
└── rag-mcp.ts    # 全てここに！（100行程度）
```

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

`src/rag-mcp.ts` に全てを実装:

1. ベクトルストアの初期化
2. サンプルデータの追加
3. 検索関数の実装
4. MCP Server の実装
5. ツールの定義

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

### レベル 2: 永続化
- `@mastra/pg` で PostgreSQL + pgvector に移行
- ドキュメントを永続化

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

## 参考資料

### RAG の実装パターン

詳細な実装パターンについては `docs/RAG実装パターン.md` を参照。

### MCP 公式ドキュメント

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/anthropics/mcp-sdk)

### Mastra 公式ドキュメント

- [RAG with Mastra](https://mastra.ai/en/docs/rag/vector-databases)
- [PgVector Reference](https://mastra.ai/en/reference/vectors/pg)
