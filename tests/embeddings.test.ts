import { generateEmbedding } from '../src/embeddings';

// 埋め込み生成関数のテスト
(async () => {
  try {
    console.log('🔍 Testing generateEmbedding function...');

    const testTexts = [
      'TypeScript is a programming language.',
      'PostgreSQL is a relational database.',
      'Vector embeddings are useful for semantic search.',
    ];

    for (const text of testTexts) {
      const embedding = await generateEmbedding(text);
      console.log(`\n✅ Text: "${text}"`);
      console.log(`   Dimensions: ${embedding.length}`);
      console.log(`   First 3 values: [${embedding.slice(0, 3).join(', ')}...]`);
    }

    console.log('\n✅ generateEmbedding function test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ generateEmbedding function test failed:', error);
    process.exit(1);
  }
})();
