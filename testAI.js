const Database = require('./src/utils/database');
const HybridAiService = require('./src/services/hybridAiService');

async function test() {
  console.log('🧪 Testing Klaro AI System...\n');

  // Test Database
  const db = new Database('./database.sqlite');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Insert test client
  try {
    await db.run(
      'INSERT INTO clients (email, domain, name, api_key, plan, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['demo@klaro.ai', 'demo.klaro.ai', 'Demo User', 'klaro_demo123test', 'tier2', 'active']
    );
    console.log('✅ Test client created: klaro_demo123test\n');
  } catch (e) {
    console.log('ℹ️  Test client may already exist\n');
  }

  // Test AI Service
  const aiService = new HybridAiService();

  console.log('📊 Testing AI Health Check...');
  const health = await aiService.healthCheck();
  console.log('Health Status:');
  console.log(`  - FireCrawl: ${health.firecrawl ? '✅' : '❌'}`);
  console.log(`  - GLM API: ${health.glm ? '✅' : '❌'}`);
  console.log(`  - OpenAI API: ${health.openai ? '✅' : '❌'}`);
  console.log(`  - Fallback System: ${health.fallback ? '✅' : '❌'}\n`);

  // Test AI Query
  console.log('🤖 Testing AI Query Processing...');
  const result = await aiService.processQuery(
    'Where is the logout button?',
    'https://github.com'
  );

  console.log(`\n📝 Query Result:`);
  console.log(`  Response: ${result.message.substring(0, 150)}...`);
  console.log(`  Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`  Processing Time: ${result.processingTime}ms`);
  console.log(`  AI Source: ${result.metadata.aiSource}`);
  console.log(`  Scraping Method: ${result.metadata.scrapingMethod}`);
  console.log(`  Highlighted Elements: ${result.highlight.split(',').length} selectors`);
  console.log(`  Steps: ${result.steps.length} steps`);

  console.log('\n✅ All tests completed!\n');
  console.log('🔑 Use API Key: klaro_demo123test');
  console.log('🌐 Server: http://localhost:3001');
  console.log('📡 Test query: curl -X POST http://localhost:3001/api/query -H "Content-Type: application/json" -H "X-API-Key: klaro_demo123test" -d \'{"query":"How do I logout?","url":"https://github.com"}\'\n');

  process.exit(0);
}

test().catch(console.error);
