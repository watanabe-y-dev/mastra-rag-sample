import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

// 環境変数の読み込み
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// OpenAI Embeddings モデルの設定
export const embeddingModel = openai.embedding('text-embedding-3-small');

console.log('✅ OpenAI Embeddings API configured');

// テキストを埋め込みベクトルに変換する関数
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}
