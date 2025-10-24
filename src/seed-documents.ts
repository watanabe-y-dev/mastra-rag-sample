import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { vectorStore, initializeIndex } from './vector-store.js';
import { generateEmbedding } from './embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SeedDocumentOptions {
  filePath: string;
  id?: string;
  metadata?: {
    title?: string;
    category?: string;
    [key: string]: unknown;
  };
}

/**
 * ドキュメントをベクトル化して PostgreSQL に保存する
 */
export async function seedDocument(
  options: SeedDocumentOptions
): Promise<void> {
  try {
    const { filePath, id, metadata = {} } = options;

    console.log(`🌱 Starting document seeding: ${filePath}`);

    // 1. ベクトルインデックスの初期化
    await initializeIndex();

    // 2. ドキュメントの読み込み
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    console.log(`📄 Loaded document: ${content.length} characters`);

    // 3. ベクトル化
    console.log('🔄 Generating embedding...');
    const embedding = await generateEmbedding(content);
    console.log(`✅ Embedding generated: ${embedding.length} dimensions`);

    // 4. ID とメタデータの準備
    const documentId =
      id || path.basename(filePath, path.extname(filePath));
    const fileName = path.basename(filePath);

    const fullMetadata = {
      title: metadata.title || fileName,
      category: metadata.category || 'general',
      source: resolvedPath,
      content: content,
      ...metadata,
    };

    // 5. PostgreSQL へのアップサート
    console.log('💾 Saving to PostgreSQL...');
    await vectorStore.upsert({
      indexName: 'documents',
      vectors: [embedding],
      ids: [documentId],
      metadata: [fullMetadata],
    });

    console.log(
      `✅ Document seeding completed: ${documentId}`
    );
  } catch (error) {
    console.error('❌ Document seeding failed:', error);
    throw error;
  }
}

/**
 * サンプルドキュメントをベクトル化して PostgreSQL に保存する
 */
export async function seedSampleDocument(): Promise<void> {
  const sampleFilePath = path.join(
    __dirname,
    'sample',
    '重要なお知らせをホームに表示.md'
  );

  await seedDocument({
    filePath: sampleFilePath,
    id: 'notice-home-display',
    metadata: {
      title: '重要なお知らせをホームに表示',
      category: 'product-spec',
    },
  });
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  // コマンドライン引数からファイルパスを取得
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 引数がない場合はサンプルドキュメントを使用
    console.log('No file path provided. Using sample document...');
    seedSampleDocument()
      .then(() => {
        console.log('🎉 All done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
      });
  } else {
    // 引数がある場合は指定されたファイルを使用
    const filePath = args[0];
    const id = args[1]; // オプション: ID を指定可能

    seedDocument({
      filePath,
      id,
    })
      .then(() => {
        console.log('🎉 All done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
      });
  }
}
