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
  try {
    // 入力テキストのバリデーション
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // 埋め込み生成
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });

    // 埋め込みベクトルの検証
    if (!embedding || embedding.length !== 1536) {
      throw new Error(
        `Invalid embedding dimension: expected 1536, got ${embedding?.length || 0}`
      );
    }

    return embedding;
  } catch (error) {
    // エラーの種類に応じて詳細なメッセージを提供
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error(
          `OpenAI API key error: ${error.message}. Please check your OPENAI_API_KEY environment variable.`
        );
      }
      if (error.message.includes('rate limit')) {
        throw new Error(
          `OpenAI rate limit exceeded: ${error.message}. Please try again later.`
        );
      }
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    throw new Error('Failed to generate embedding: Unknown error');
  }
}
