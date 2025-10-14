import { initializeIndex } from '../src/vector-store';

// ベクトルインデックス作成のテスト
(async () => {
  try {
    console.log('🔍 Testing vector index creation...');
    await initializeIndex();
    console.log('✅ Index initialization test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Index initialization test failed:', error);
    process.exit(1);
  }
})();
