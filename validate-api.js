#!/usr/bin/env node

/**
 * API Validation Script for Fresher Pass
 * 
 * This script tests all backend endpoints and validates responses.
 * Run after starting the backend: node validate-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, method, path, body = null, expectedStatus = 200) {
  try {
    log('cyan', `\n→ Testing: ${name}`);
    const response = await request(method, path, body);
    const success = response.statusCode === expectedStatus;

    if (success) {
      log('green', `✓ PASS (${response.statusCode})`);
      if (Object.keys(response.data).length > 0) {
        log('blue', `  Response: ${JSON.stringify(response.data).substring(0, 80)}...`);
      }
    } else {
      log('red', `✗ FAIL (expected ${expectedStatus}, got ${response.statusCode})`);
      log('red', `  Response: ${JSON.stringify(response.data)}`);
    }
    return success;
  } catch (error) {
    log('red', `✗ ERROR: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('yellow', '\n========================================');
  log('yellow', '  Fresher Pass API Validation Suite');
  log('yellow', '========================================');
  
  let passed = 0;
  let total = 0;

  // 1. Health Check
  total++;
  if (await test('Health Check', 'GET', '/health')) {
    passed++;
  }

  // 2. Register Student
  const studentPayload = {
    enrollmentNo: 'TEST001',
    fullName: 'Test User',
    fatherName: 'Test Father',
    dob: '2000-01-01',
    email: 'test@college.edu',
    year: '1',
    course: 'B.Tech',
    branch: 'CSE',
    photoUrl: '',
    participationInterests: ['Music', 'Dance'],
    feeAmount: '500',
  };

  let serialId = '';
  total++;
  if (await test('Register Student', 'POST', '/register', studentPayload, 201)) {
    passed++;
    // Extract serial ID from response for later tests
    try {
      const response = await request('POST', '/register', studentPayload);
      serialId = response.data.serialId;
      log('blue', `  Serial ID: ${serialId}`);
    } catch (e) {
      log('red', '  Failed to extract serial ID');
    }
  }

  // 3. Get All Students
  total++;
  if (await test('Get All Students', 'GET', '/students')) {
    passed++;
  }

  // 4. Get Student by Serial (if we registered one)
  if (serialId) {
    total++;
    if (await test(`Get Student by Serial (${serialId})`, 'GET', `/student/${serialId}`)) {
      passed++;
    }
  }

  // 5. Update Student
  if (serialId) {
    const updatePayload = {
      verificationStatus: 'Verified',
    };
    total++;
    if (await test(`Update Student (${serialId})`, 'PUT', `/student/${serialId}`, updatePayload)) {
      passed++;
    }
  }

  // 6. Check-in Student
  if (serialId) {
    const checkinPayload = { checkedIn: true };
    total++;
    if (await test(`Check-in Student (${serialId})`, 'POST', `/checkin/${serialId}`, checkinPayload)) {
      passed++;
    }
  }

  // 7. Admin Login
  const adminPayload = {
    email: 'admin@college.edu',
    password: 'admin123',
  };
  total++;
  if (await test('Admin Login (Valid)', 'POST', '/admin/login', adminPayload)) {
    passed++;
  }

  // 8. Admin Login (Invalid)
  const invalidAdminPayload = {
    email: 'admin@college.edu',
    password: 'wrong-password',
  };
  total++;
  if (await test('Admin Login (Invalid)', 'POST', '/admin/login', invalidAdminPayload, 401)) {
    passed++;
  }

  // 9. Search Students
  total++;
  if (await test('Search Students (term=Test)', 'GET', `/search?term=Test`)) {
    passed++;
  }

  // 10. Export Students (CSV)
  total++;
  if (await test('Export Students (CSV)', 'GET', `/export`)) {
    passed++;
  }

  // 11. Get Stats
  total++;
  if (await test('Get Statistics', 'GET', `/stats`)) {
    passed++;
  }

  // 12. Delete Student (if we registered one)
  if (serialId) {
    total++;
    if (await test(`Delete Student (${serialId})`, 'DELETE', `/student/${serialId}`)) {
      passed++;
    }
  }

  // Summary
  log('yellow', '\n========================================');
  log('yellow', `  Test Results: ${passed}/${total} passed`);
  log('yellow', '========================================\n');

  if (passed === total) {
    log('green', '✓ All tests passed! API is working correctly.');
    process.exit(0);
  } else {
    log('red', `✗ ${total - passed} test(s) failed. Check the backend.`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log('red', `Fatal error: ${error.message}`);
  log('red', '\nMake sure the backend is running: cd server && npm start');
  process.exit(1);
});
