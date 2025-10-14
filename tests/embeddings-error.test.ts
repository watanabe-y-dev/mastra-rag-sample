import { generateEmbedding } from '../src/embeddings';

// エラーハンドリングのテスト
(async () => {
  console.log('🔍 Testing error handling in generateEmbedding...\n');

  // Test 1: 空文字列
  try {
    console.log('Test 1: Empty string');
    await generateEmbedding('');
    console.log('❌ Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      console.log(`✅ Caught error: ${error.message}\n`);
    }
  }

  // Test 2: 空白のみの文字列
  try {
    console.log('Test 2: Whitespace only string');
    await generateEmbedding('   ');
    console.log('❌ Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      console.log(`✅ Caught error: ${error.message}\n`);
    }
  }

  // Test 3: 正常なケース
  try {
    console.log('Test 3: Valid text');
    const embedding = await generateEmbedding('Hello, world!');
    console.log(`✅ Success: Generated ${embedding.length}-dimensional vector\n`);
  } catch (error) {
    if (error instanceof Error) {
      console.log(`❌ Unexpected error: ${error.message}\n`);
    }
  }

  console.log('✅ Error handling tests completed');
  process.exit(0);
})();
