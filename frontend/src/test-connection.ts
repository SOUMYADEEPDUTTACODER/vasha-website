// Test script to verify frontend-backend connection
// Run this in the browser console or as a separate test

import { asrService } from './services/asrService';

export async function testBackendConnection() {
  console.log('🧪 Testing Backend Connection...');
  
  try {
    // Test 1: Check if backend is available
    console.log('1. Checking backend health...');
    const isHealthy = await asrService.checkBackendHealth();
    console.log(`✅ Backend health: ${isHealthy ? 'Available' : 'Not available'}`);
    
    if (!isHealthy) {
      console.log('❌ Backend is not available. Please start the backend server.');
      return false;
    }
    
    // Test 2: Get supported languages
    console.log('2. Fetching supported languages...');
    const languagesResponse = await asrService.getLanguages();
    console.log(`✅ Languages loaded: ${Object.keys(languagesResponse.languages).length} languages`);
    console.log('Sample languages:', Object.entries(languagesResponse.languages).slice(0, 5));
    
    // Test 3: Get available models
    console.log('3. Fetching available models...');
    const modelsResponse = await asrService.getModels();
    console.log(`✅ Models loaded: ${modelsResponse.models.length} models`);
    modelsResponse.models.forEach(model => {
      console.log(`  - ${model.name} (${model.id}): ${model.description}`);
    });
    
    console.log('🎉 All tests passed! Frontend-backend connection is working.');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testBackendConnection();
}
