import { vectorStore } from './vector-store.js';
import { generateEmbedding } from './embeddings.js';

/**
 * 検索結果の型定義
 */
export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    title: string;
    category: string;
    source: string;
    content: string;
    [key: string]: unknown;
  };
}

/**
 * 検索オプションの型定義
 */
export interface SearchOptions {
  topK?: number;
  minScore?: number;
}

/**
 * RAG 検索を実行する
 *
 * @param query - 検索クエリ（自然言語）
 * @param options - 検索オプション
 * @returns 検索結果の配列
 */
export async function ragSearch(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { topK = 5, minScore = 0.0 } = options;

  try {
    // 1. クエリのバリデーション
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    console.log(`🔍 Searching for: "${query}"`);

    // 2. クエリのベクトル化
    console.log('🔄 Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('✅ Query embedding generated');

    // 3. ベクトル類似度検索の実行
    console.log(`📊 Searching vector store (topK=${topK})...`);
    const results = await vectorStore.query({
      indexName: 'documents',
      queryVector: queryEmbedding,
      topK,
      includeVector: false, // ベクトルは返さない（メタデータのみ）
      minScore,
    });

    // 4. 検索結果が 0 件の場合の処理
    if (!results || results.length === 0) {
      console.log('ℹ️  No results found');
      return [];
    }

    console.log(`✅ Found ${results.length} results`);

    // 5. 結果の構造化（メタデータ付き）
    const structuredResults: SearchResult[] = results.map((result) => ({
      id: result.id,
      score: result.score || 0,
      metadata: {
        title: result.metadata?.title || 'Untitled',
        category: result.metadata?.category || 'general',
        source: result.metadata?.source || '',
        content: result.metadata?.content || '',
        ...result.metadata,
      },
    }));

    return structuredResults;
  } catch (error) {
    // エラーハンドリング
    if (error instanceof Error) {
      // ベクトルストア接続エラー
      if (error.message.includes('connect')) {
        throw new Error(
          `Vector store connection error: ${error.message}. Please check if PostgreSQL is running.`
        );
      }

      // タイムアウト処理
      if (error.message.includes('timeout')) {
        throw new Error(
          `Search timeout: ${error.message}. Please try again.`
        );
      }

      // その他のエラー
      throw new Error(`RAG search failed: ${error.message}`);
    }

    throw new Error('RAG search failed: Unknown error');
  }
}
