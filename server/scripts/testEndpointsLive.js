process.env.NODE_ENV = 'test';
import axios from 'axios';
import app from '../server.js';
import { connectDB, disconnectDB } from '../config/db.js';

const PORT = 5055;
let server;

async function runE2ETests() {
  console.log('====================================================');
  console.log('--- Running Live End-to-End API Suite Tests ---');
  console.log('====================================================\n');

  await connectDB();
  server = app.listen(PORT);
  const baseURL = `http://127.0.0.1:${PORT}`;

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const healthRes = await axios.get(`${baseURL}/api/health`);
    console.log(`   Response: status=${healthRes.status}, data=${JSON.stringify(healthRes.data)}`);

    // 2. Login as Citizen
    console.log('\n2. Testing POST /api/auth/login (Citizen)...');
    const citizenLogin = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'ravi.citizen@example.com',
      password: 'password123'
    });
    const citizenToken = citizenLogin.data.token;
    console.log(`   Citizen Login Success: role=${citizenLogin.data.user.role}, token received (length: ${citizenToken.length})`);
    if (citizenLogin.data.user.passwordHash) {
      throw new Error('passwordHash leaked in login response!');
    }

    // 3. GET /api/auth/me
    console.log('\n3. Testing GET /api/auth/me (Citizen)...');
    const meRes = await axios.get(`${baseURL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`   Profile Fetched: ${meRes.data.user.name} (${meRes.data.user.email})`);
    if (meRes.data.user.passwordHash) {
      throw new Error('passwordHash leaked in /me response!');
    }

    // 4. GET /api/complaints?submittedBy=me
    console.log('\n4. Testing GET /api/complaints?submittedBy=me...');
    const myComplaintsRes = await axios.get(`${baseURL}/api/complaints?submittedBy=me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`   Fetched ${myComplaintsRes.data.complaints.length} complaints for citizen`);

    // 5. Login as Admin
    console.log('\n5. Testing POST /api/auth/login (Admin)...');
    const adminLogin = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@platform.gov.in',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    console.log(`   Admin Login Success: role=${adminLogin.data.user.role}`);

    // 6. GET /api/complaints (Admin)
    console.log('\n6. Testing GET /api/complaints (Admin filter & pagination)...');
    const allComplaintsRes = await axios.get(`${baseURL}/api/complaints?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Total Complaints in System: ${allComplaintsRes.data.total}`);

    // 7. GET /api/universities
    console.log('\n7. Testing GET /api/universities...');
    const uniRes = await axios.get(`${baseURL}/api/universities`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Found ${uniRes.data.universities.length} universities: ${uniRes.data.universities.map(u => u.name).join(', ')}`);

    // 8. GET /api/projects
    console.log('\n8. Testing GET /api/projects...');
    const projectsRes = await axios.get(`${baseURL}/api/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Found ${projectsRes.data.count} projects`);

    // 9. GET /api/industry-partners
    console.log('\n9. Testing GET /api/industry-partners...');
    const industryRes = await axios.get(`${baseURL}/api/industry-partners`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Found ${industryRes.data.count} industry partners: ${industryRes.data.industryPartners.map(p => p.name).join(', ')}`);

    // 10. GET /api/notifications
    console.log('\n10. Testing GET /api/notifications (Citizen)...');
    const notifsRes = await axios.get(`${baseURL}/api/notifications`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log(`   Found ${notifsRes.data.notifications.length} notifications (unread: ${notifsRes.data.unreadCount})`);

    // 11. GET /api/analytics/summary (Admin)
    console.log('\n11. Testing GET /api/analytics/summary (Admin)...');
    const summaryRes = await axios.get(`${baseURL}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Analytics Summary:`, JSON.stringify(summaryRes.data, null, 2));

    // 12. GET /api/analytics/trends (Admin)
    console.log('\n12. Testing GET /api/analytics/trends (Admin)...');
    const trendsRes = await axios.get(`${baseURL}/api/analytics/trends`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   Trends entries count: ${trendsRes.data.trends.length}`);

    console.log('\n====================================================');
    console.log('🎉 ALL LIVE END-TO-END TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await disconnectDB();
    process.exit(process.exitCode || 0);
  }
}

runE2ETests();
