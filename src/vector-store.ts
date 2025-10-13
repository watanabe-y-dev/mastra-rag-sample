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
