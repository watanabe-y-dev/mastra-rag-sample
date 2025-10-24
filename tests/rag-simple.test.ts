import { ragSearch } from '../src/rag.js';

async function simpleTest() {
  const queries = [
    'ユーザーに通知を送る方法',
    'プッシュ通知について',
    '障害情報を伝達する',
    'システムメンテナンスの告知',
  ];

  for (const query of queries) {
    console.log(`\n🔍 Query: "${query}"`);
    console.log('='.repeat(60));

    const results = await ragSearch(query, { topK: 1 });

    if (results.length > 0) {
      console.log(`✅ Found: ${results[0].metadata.title}`);
      console.log(`   Score: ${results[0].score.toFixed(4)}`);
    } else {
      console.log('❌ No results');
    }
  }
}

simpleTest();
