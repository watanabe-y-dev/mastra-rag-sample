import { PgVector } from '@mastra/pg';
import dotenv from 'dotenv';

dotenv.config();

// 環境変数の読み込み
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  throw new Error('POSTGRES_CONNECTION_STRING is not set in environment variables');
}

// PgVector インスタンスの作成
export const vectorStore = new PgVector({
  connectionString: POSTGRES_CONNECTION_STRING,
});

console.log('✅ PgVector instance created');

// ベクトルインデックスの作成
export async function initializeIndex(): Promise<void> {
  try {
    await vectorStore.createIndex({
      indexName: 'documents',
      dimension: 1536, // OpenAI text-embedding-3-small の次元数
      metric: 'cosine', // コサイン類似度
    });
    console.log('✅ Vector index "documents" created successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('ℹ️  Vector index "documents" already exists');
    } else {
      console.error('❌ Failed to create vector index:', error);
      throw error;
    }
  }
}
