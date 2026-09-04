import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, fn) {
  try {
    const result = await fn();
    console.log(`✅ [PASS] ${name}:`, result);
    return true;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.response?.data || err.message);
    return false;
  }
}

async function run() {
  console.log('\n--- SAMADHAN SETU FULL-STACK INTEGRATION TEST ---\n');

  let allPassed = true;

  // 1. Citizen Login
  let citizenToken = '';
  const citizenLoginPass = await testEndpoint('Citizen Login (rahul.kumar@gmail.com)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'rahul.kumar@gmail.com',
      password: 'password123'
    });
    citizenToken = res.data.token;
    return `Token generated, user role: ${res.data.user.role}`;
  });
  allPassed = allPassed && citizenLoginPass;

  // 2. Citizen /auth/me
  const citizenMePass = await testEndpoint('Citizen /auth/me Session Hydration', async () => {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    return `Hydrated name: "${res.data.user.name}", email: ${res.data.user.email}`;
  });
  allPassed = allPassed && citizenMePass;

  // 3. Admin Login
  let adminToken = '';
  const adminLoginPass = await testEndpoint('Admin Login (admin@samadhan.gov.in)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@samadhan.gov.in',
      password: 'password123'
    });
    adminToken = res.data.token;
    return `Token generated, user role: ${res.data.user.role}`;
  });
  allPassed = allPassed && adminLoginPass;

  // 4. University Login
  let uniToken = '';
  const uniLoginPass = await testEndpoint('University PI Login (university@bitmesra.ac.in)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'university@bitmesra.ac.in',
      password: 'password123'
    });
    uniToken = res.data.token;
    return `Token generated, user role: ${res.data.user.role}`;
  });
  allPassed = allPassed && uniLoginPass;

  // 5. Industry Login
  let indToken = '';
  const indLoginPass = await testEndpoint('Industry CSR Login (contact@ecosolve.in)', async () => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'contact@ecosolve.in',
      password: 'password123'
    });
    indToken = res.data.token;
    return `Token generated, user role: ${res.data.user.role}`;
  });
  allPassed = allPassed && indLoginPass;

  // 6. Citizen Create Complaint
  let createdComplaintId = '';
  const createCompPass = await testEndpoint('Citizen Create Complaint (POST /api/complaints)', async () => {
    const res = await axios.post(
      `${BASE_URL}/complaints`,
      {
        title: 'Broken Hand Pump in Angara Village Sector 4',
        description: 'Water pump is completely defective for two weeks. Residents need immediate water access.',
        district: 'Ranchi',
        location: { lat: 23.3648, lng: 85.3346, address: 'Angara Block, Ranchi' },
        category: 'water_resources',
        urgency: 'high'
      },
      {
        headers: { Authorization: `Bearer ${citizenToken}` }
      }
    );
    createdComplaintId = res.data.complaint._id;
    return `Complaint created: ${createdComplaintId}, status: ${res.data.complaint.status}`;
  });
  allPassed = allPassed && createCompPass;

  // 7. Citizen Get Complaints
  const citizenComplaintsPass = await testEndpoint('Citizen Get Complaints (GET /api/complaints?submittedBy=me)', async () => {
    const res = await axios.get(`${BASE_URL}/complaints?submittedBy=me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    return `Found ${res.data.complaints.length} complaints for citizen`;
  });
  allPassed = allPassed && citizenComplaintsPass;

  // 8. University Challenges
  const uniChallengesPass = await testEndpoint('University Matched Challenges (GET /api/universities/me/challenges)', async () => {
    const res = await axios.get(`${BASE_URL}/universities/me/challenges`, {
      headers: { Authorization: `Bearer ${uniToken}` }
    });
    return `Found ${res.data.challenges?.length || 0} matched challenges`;
  });
  allPassed = allPassed && uniChallengesPass;

  // 9. Industry Projects
  const indProjectsPass = await testEndpoint('Industry Projects (GET /api/projects?industryPartnerId=me)', async () => {
    const res = await axios.get(`${BASE_URL}/projects?industryPartnerId=me`, {
      headers: { Authorization: `Bearer ${indToken}` }
    });
    return `Found ${res.data.projects?.length || 0} projects`;
  });
  allPassed = allPassed && indProjectsPass;

  // 10. Admin Analytics Summary & Trends
  const adminAnalyticsPass = await testEndpoint('Admin Analytics Summary & Trends', async () => {
    const [sumRes, trendRes] = await Promise.all([
      axios.get(`${BASE_URL}/analytics/summary`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      axios.get(`${BASE_URL}/analytics/trends`, { headers: { Authorization: `Bearer ${adminToken}` } })
    ]);
    return `Total complaints: ${sumRes.data.totalComplaints}, Trend days: ${trendRes.data.trends.length}`;
  });
  allPassed = allPassed && adminAnalyticsPass;

  // 11. Notifications
  const notifPass = await testEndpoint('Notifications (GET /api/notifications)', async () => {
    const res = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    return `Citizen has ${res.data.notifications?.length || 0} notifications, unread: ${res.data.unreadCount}`;
  });
  allPassed = allPassed && notifPass;

  console.log('\n=============================================');
  if (allPassed) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  } else {
    console.log('⚠️ SOME TESTS FAILED. PLEASE CHECK LOGS ABOVE.');
  }
  console.log('=============================================\n');

  process.exit(allPassed ? 0 : 1);
}

run().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
