import dotenv from 'dotenv';
import { classifyComplaint, analyzeImage, getEmbedding } from '../services/aiService.js';

dotenv.config();

async function runAiServiceTests() {
  console.log('====================================================');
  console.log('--- Testing Samadhan Setu AI Service Capabilities ---');
  console.log('====================================================\n');

  // Test 1: Classification
  console.log('1. Testing classifyComplaint()...');
  const sampleComplaint =
    'The main drinking water hand pump near the government primary school in Angara, Ranchi has broken down for 3 weeks. Students have no clean water.';
  
  const classResult = await classifyComplaint(sampleComplaint);
  console.log('Classification Result:');
  console.log(JSON.stringify(classResult, null, 2));

  // Test 2: Image Analysis
  console.log('\n2. Testing analyzeImage()...');
  const sampleImageUrl = 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800';
  const imageResult = await analyzeImage(sampleImageUrl, sampleComplaint);
  console.log('Image Analysis Result:');
  console.log(JSON.stringify(imageResult, null, 2));

  // Test 3: Embedding Generation
  console.log('\n3. Testing getEmbedding()...');
  const embedding = await getEmbedding(sampleComplaint);
  console.log(`Embedding Generated: length = ${embedding.length} dimensions`);
  if (embedding.length > 0) {
    console.log(`Vector preview: [${embedding.slice(0, 5).join(', ')}, ...]`);
  }

  console.log('\n--- AI Service Verification Completed Successfully ---');
}

runAiServiceTests().catch((err) => {
  console.error('Test AI Service failed:', err);
  process.exit(1);
});
