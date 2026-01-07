/**
 * API Integration Test Script
 * Tests all backend API endpoints with demo data
 * 
 * Requirements: Node.js 18+ (uses native fetch API)
 * Run with: node test-api.js
 * Requires: PostgreSQL with seed data loaded
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Helper to make API requests
async function testEndpoint(name, method, path, body = null) {
  totalTests++;
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${path}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();
    
    if (response.ok) {
      passedTests++;
      console.log(`   ✅ PASSED (${response.status})`);
      if (Array.isArray(data)) {
        console.log(`   📊 Returned ${data.length} items`);
      } else if (data.data) {
        console.log(`   📊 Data:`, Object.keys(data.data).join(', '));
      } else {
        console.log(`   📊 Response:`, Object.keys(data).slice(0, 5).join(', '));
      }
      return { success: true, data };
    } else {
      failedTests++;
      console.log(`   ❌ FAILED (${response.status}): ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    failedTests++;
    console.log(`   ❌ FAILED: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test suite
async function runTests() {
  console.log('================================================');
  console.log('BRRP.IO API Integration Tests');
  console.log('================================================');
  console.log(`API Base: ${API_BASE}`);
  console.log('');
  
  // Check if server is running
  try {
    await fetch(API_BASE);
  } catch (error) {
    console.error('❌ Server not running at', API_BASE);
    console.error('   Start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  
  console.log('\n\n--- COMPANIES API ---');
  await testEndpoint(
    'List all companies',
    'GET',
    '/api/companies'
  );
  
  console.log('\n\n--- WASTE STREAM TYPES API ---');
  await testEndpoint(
    'List all waste stream types',
    'GET',
    '/api/waste-stream-types'
  );
  
  // Test Trucks API
  console.log('\n\n--- TRUCKS API ---');
  await testEndpoint(
    'List all trucks',
    'GET',
    '/api/trucks'
  );
  
  await testEndpoint(
    'List trucks for specific company',
    'GET',
    '/api/trucks?company_id=a1b2c3d4-e5f6-7890-1234-567890abcdef'
  );
  
  // Test Drivers API
  console.log('\n\n--- DRIVERS API ---');
  await testEndpoint(
    'List all drivers',
    'GET',
    '/api/drivers'
  );
  
  await testEndpoint(
    'List drivers for specific company',
    'GET',
    '/api/drivers?company_id=a1b2c3d4-e5f6-7890-1234-567890abcdef'
  );
  
  // Test Weighbridge Jobs API
  console.log('\n\n--- WEIGHBRIDGE JOBS API ---');
  const jobsList = await testEndpoint(
    'List all weighbridge jobs',
    'GET',
    '/api/weighbridge-jobs'
  );
  
  await testEndpoint(
    'List jobs with status filter (WEIGHED)',
    'GET',
    '/api/weighbridge-jobs?status=WEIGHED'
  );
  
  await testEndpoint(
    'List jobs with status filter (APPROVED)',
    'GET',
    '/api/weighbridge-jobs?status=APPROVED'
  );
  
  if (jobsList.success && jobsList.data.length > 0) {
    const jobId = jobsList.data[0].id;
    await testEndpoint(
      'Get specific job by ID',
      'GET',
      `/api/weighbridge-jobs/${jobId}`
    );
  }
  
  // Test Emissions API
  console.log('\n\n--- EMISSIONS DATA API ---');
  await testEndpoint(
    'List emissions data',
    'GET',
    '/api/scada/emissions?limit=10'
  );
  
  if (jobsList.success && jobsList.data.length > 0) {
    const jobId = jobsList.data[0].id;
    await testEndpoint(
      'List emissions for specific job',
      'GET',
      `/api/scada/emissions?weighbridge_job_id=${jobId}`
    );
  }
  
  // Test Energy Production API
  console.log('\n\n--- ENERGY PRODUCTION API ---');
  await testEndpoint(
    'List energy production data',
    'GET',
    '/api/energy/production?limit=10'
  );
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await testEndpoint(
    'List energy production with date filter',
    'GET',
    `/api/energy/production?start_date=${thirtyDaysAgo.toISOString()}&limit=10`
  );
  
  // Summary
  console.log('\n\n================================================');
  console.log('TEST SUMMARY');
  console.log('================================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('================================================');
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
