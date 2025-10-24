import { ragSearch } from '../src/rag.js';

async function testRagSearch() {
  console.log('🧪 Testing RAG Search...\n');

  try {
    // テストケース 1: 通常の検索
    console.log('Test 1: Normal search');
    console.log('='.repeat(50));
    const results1 = await ragSearch('ホーム画面に表示する機能について教えて', {
      topK: 3,
    });

    console.log(`\nResults: ${results1.length} documents found\n`);
    results1.forEach((result, index) => {
      console.log(`${index + 1}. ${result.metadata.title}`);
      console.log(`   Score: ${result.score.toFixed(4)}`);
      console.log(`   Category: ${result.metadata.category}`);
      console.log(
        `   Content preview: ${result.metadata.content.substring(0, 100)}...`
      );
      console.log('');
    });

    // テストケース 2: 最小スコアを設定
    console.log('\nTest 2: Search with minimum score');
    console.log('='.repeat(50));
    const results2 = await ragSearch('メンテナンス情報', {
      topK: 5,
      minScore: 0.5,
    });

    console.log(`\nResults: ${results2.length} documents found\n`);

    // テストケース 3: 検索結果が 0 件になる可能性があるクエリ
    console.log('\nTest 3: Search with unlikely query');
    console.log('='.repeat(50));
    const results3 = await ragSearch('quantum physics and black holes', {
      topK: 3,
    });

    console.log(`\nResults: ${results3.length} documents found\n`);

    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRagSearch();
