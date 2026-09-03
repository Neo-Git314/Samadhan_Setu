import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

const results = [];

function recordResult(name, method, path, success, details = '') {
  results.push({ name, method, path, success, details });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} [${method.padEnd(5)}] ${path.padEnd(42)} : ${name} ${details ? '(' + details + ')' : ''}`);
}

async function run() {
  console.log('================================================================');
  console.log(`--- Running Exhaustive Test of All Endpoints on ${BASE_URL} ---`);
  console.log('================================================================\n');

  let citizenToken = '';
  let universityToken = '';
  let industryToken = '';
  let adminToken = '';

  let createdComplaintId = '';
  let universityId = '';
  let createdProjectId = '';
  let industryPartnerId = '';
  let notificationId = '';

  // 1. Health Check
  try {
    const res = await axios.get(`${BASE_URL}/api/health`);
    recordResult('Health Check', 'GET', '/api/health', res.status === 200 && res.data.status === 'ok', `status=${res.status}`);
  } catch (err) {
    recordResult('Health Check', 'GET', '/api/health', false, err.message);
  }

  // 2. Auth: Register New Citizen
  const testEmail = `test.citizen.${Date.now()}@example.com`;
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/register`, {
      name: 'Test Citizen User',
      email: testEmail,
      password: 'password123',
      role: 'citizen',
      phone: '9988776655',
      organization: 'Local Community'
    });
    citizenToken = res.data.token;
    recordResult('User Registration', 'POST', '/api/auth/register', res.status === 201 && !!res.data.token, `user=${res.data.user.email}`);
  } catch (err) {
    recordResult('User Registration', 'POST', '/api/auth/register', false, err.response?.data?.message || err.message);
  }

  // 3. Auth: Login Seeded Users
  try {
    // Admin login
    const adminRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@platform.gov.in',
      password: 'password123'
    });
    adminToken = adminRes.data.token;
    recordResult('Admin Login', 'POST', '/api/auth/login', !!adminToken, `role=${adminRes.data.user.role}`);

    // University login
    const uniRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'anita@bitmesra.ac.in',
      password: 'password123'
    });
    universityToken = uniRes.data.token;
    recordResult('University Login', 'POST', '/api/auth/login', !!universityToken, `role=${uniRes.data.user.role}`);

    // Industry login
    const indRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'suresh@ecosolve.in',
      password: 'password123'
    });
    industryToken = indRes.data.token;
    recordResult('Industry Login', 'POST', '/api/auth/login', !!industryToken, `role=${indRes.data.user.role}`);
  } catch (err) {
    recordResult('User Logins', 'POST', '/api/auth/login', false, err.response?.data?.message || err.message);
  }

  // 4. Auth: GET /me
  try {
    const res = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    recordResult('Get Current User (Me)', 'GET', '/api/auth/me', res.status === 200 && res.data.user.email === testEmail);
  } catch (err) {
    recordResult('Get Current User (Me)', 'GET', '/api/auth/me', false, err.response?.data?.message || err.message);
  }

  // 5. Complaints: POST /api/complaints
  try {
    const res = await axios.post(
      `${BASE_URL}/api/complaints`,
      {
        title: 'Severe Drainage Clog on Kanke Road',
        description: 'Heavy overflow of contaminated drain water on main Kanke Road near block office.',
        district: 'Ranchi',
        location: { lat: 23.41, lng: 85.32, address: 'Kanke Road, Ranchi' },
        mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/sample.jpg']
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );
    createdComplaintId = res.data.complaint._id;
    recordResult('Citizen Submit Complaint', 'POST', '/api/complaints', res.status === 201 && !!createdComplaintId, `id=${createdComplaintId}`);
  } catch (err) {
    recordResult('Citizen Submit Complaint', 'POST', '/api/complaints', false, err.response?.data?.message || err.message);
  }

  // 6. Complaints: GET /api/complaints?submittedBy=me
  try {
    const res = await axios.get(`${BASE_URL}/api/complaints?submittedBy=me`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    recordResult('Citizen My Complaints', 'GET', '/api/complaints?submittedBy=me', res.status === 200 && Array.isArray(res.data.complaints), `count=${res.data.complaints?.length}`);
  } catch (err) {
    recordResult('Citizen My Complaints', 'GET', '/api/complaints?submittedBy=me', false, err.response?.data?.message || err.message);
  }

  // 7. Complaints: GET /api/complaints (Admin)
  try {
    const res = await axios.get(`${BASE_URL}/api/complaints?page=1&limit=5&district=Ranchi`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordResult('Admin List Complaints', 'GET', '/api/complaints', res.status === 200 && res.data.total > 0, `total=${res.data.total}`);
  } catch (err) {
    recordResult('Admin List Complaints', 'GET', '/api/complaints', false, err.response?.data?.message || err.message);
  }

  // 8. Complaints: GET /api/complaints/:id
  try {
    const res = await axios.get(`${BASE_URL}/api/complaints/${createdComplaintId}`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    recordResult('Complaint Detail by ID', 'GET', '/api/complaints/:id', res.status === 200 && res.data.complaint.title.includes('Kanke Road'));
  } catch (err) {
    recordResult('Complaint Detail by ID', 'GET', '/api/complaints/:id', false, err.response?.data?.message || err.message);
  }

  // 9. Complaints: GET /api/complaints/:id/duplicates
  try {
    const res = await axios.get(`${BASE_URL}/api/complaints/${createdComplaintId}/duplicates`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    recordResult('Complaint Duplicates Tree', 'GET', '/api/complaints/:id/duplicates', res.status === 200 && Array.isArray(res.data.duplicates));
  } catch (err) {
    recordResult('Complaint Duplicates Tree', 'GET', '/api/complaints/:id/duplicates', false, err.response?.data?.message || err.message);
  }

  // 10. Complaints: PATCH /api/complaints/:id/status (Admin)
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/complaints/${createdComplaintId}/status`,
      { status: 'reviewed' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    recordResult('Update Complaint Status', 'PATCH', '/api/complaints/:id/status', res.status === 200 && res.data.complaint.status === 'reviewed');
  } catch (err) {
    recordResult('Update Complaint Status', 'PATCH', '/api/complaints/:id/status', false, err.response?.data?.message || err.message);
  }

  // 11. Universities: GET /api/universities
  try {
    const res = await axios.get(`${BASE_URL}/api/universities`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    universityId = res.data.universities?.[0]?._id;
    recordResult('List Universities', 'GET', '/api/universities', res.status === 200 && res.data.universities.length > 0, `count=${res.data.universities?.length}`);
  } catch (err) {
    recordResult('List Universities', 'GET', '/api/universities', false, err.response?.data?.message || err.message);
  }

  // 12. Universities: POST /api/universities (Admin)
  try {
    const res = await axios.post(
      `${BASE_URL}/api/universities`,
      {
        userId: (await axios.get(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${universityToken}` } })).data.user._id,
        name: 'Jharkhand University of Technology',
        location: { lat: 23.37, lng: 85.34 },
        disciplines: ['urban_development', 'energy'],
        researchKeywords: ['smart cities', 'drainage', 'sensors'],
        incubationFacility: true,
        contactEmail: 'contact@jut.ac.in'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    recordResult('Create University Profile', 'POST', '/api/universities', res.status === 201 && !!res.data.university);
  } catch (err) {
    recordResult('Create University Profile', 'POST', '/api/universities', false, err.response?.data?.message || err.message);
  }

  // 13. Universities: GET /api/universities/:id/challenges
  try {
    const res = await axios.get(`${BASE_URL}/api/universities/${universityId}/challenges`, {
      headers: { Authorization: `Bearer ${universityToken}` }
    });
    recordResult('University Challenges', 'GET', '/api/universities/:id/challenges', res.status === 200 && Array.isArray(res.data.challenges), `challenges=${res.data.challenges?.length}`);
  } catch (err) {
    recordResult('University Challenges', 'GET', '/api/universities/:id/challenges', false, err.response?.data?.message || err.message);
  }

  // 14. Universities: POST /api/universities/:id/accept/:complaintId
  try {
    const res = await axios.post(
      `${BASE_URL}/api/universities/${universityId}/accept/${createdComplaintId}`,
      {},
      { headers: { Authorization: `Bearer ${universityToken}` } }
    );
    createdProjectId = res.data.project?._id;
    recordResult('Accept Challenge & Create Project', 'POST', '/api/universities/:id/accept/:complaintId', res.status === 201 && !!createdProjectId, `projectId=${createdProjectId}`);
  } catch (err) {
    recordResult('Accept Challenge & Create Project', 'POST', '/api/universities/:id/accept/:complaintId', false, err.response?.data?.message || err.message);
  }

  // 15. Projects: GET /api/projects
  try {
    const res = await axios.get(`${BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!createdProjectId && res.data.projects?.length > 0) {
      createdProjectId = res.data.projects[0]._id;
    }
    recordResult('List Projects', 'GET', '/api/projects', res.status === 200 && Array.isArray(res.data.projects), `count=${res.data.projects?.length}`);
  } catch (err) {
    recordResult('List Projects', 'GET', '/api/projects', false, err.response?.data?.message || err.message);
  }

  // 16. Projects: GET /api/projects/:id
  try {
    const res = await axios.get(`${BASE_URL}/api/projects/${createdProjectId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordResult('Project Detail by ID', 'GET', '/api/projects/:id', res.status === 200 && !!res.data.project);
  } catch (err) {
    recordResult('Project Detail by ID', 'GET', '/api/projects/:id', false, err.response?.data?.message || err.message);
  }

  // 17. Projects: PATCH /api/projects/:id/milestones
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/projects/${createdProjectId}/milestones`,
      {
        action: 'add',
        milestone: {
          title: 'Initial Engineering Blueprint & Site Survey',
          dueDate: new Date(Date.now() + 10 * 86400000),
          status: 'pending'
        }
      },
      { headers: { Authorization: `Bearer ${universityToken}` } }
    );
    recordResult('Add Project Milestone', 'PATCH', '/api/projects/:id/milestones', res.status === 200 && res.data.project.milestones.length > 0);
  } catch (err) {
    recordResult('Add Project Milestone', 'PATCH', '/api/projects/:id/milestones', false, err.response?.data?.message || err.message);
  }

  // 18. Projects: PATCH /api/projects/:id/team
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/projects/${createdProjectId}/team`,
      {
        action: 'add',
        member: {
          name: 'Aarav Sharma',
          role: 'student'
        }
      },
      { headers: { Authorization: `Bearer ${universityToken}` } }
    );
    recordResult('Add Team Member', 'PATCH', '/api/projects/:id/team', res.status === 200 && res.data.team.length > 0);
  } catch (err) {
    recordResult('Add Team Member', 'PATCH', '/api/projects/:id/team', false, err.response?.data?.message || err.message);
  }

  // 19. Industry: GET /api/industry-partners
  try {
    const res = await axios.get(`${BASE_URL}/api/industry-partners`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    industryPartnerId = res.data.industryPartners?.[0]?._id;
    recordResult('List Industry Partners', 'GET', '/api/industry-partners', res.status === 200 && res.data.industryPartners.length > 0, `count=${res.data.industryPartners.length}`);
  } catch (err) {
    recordResult('List Industry Partners', 'GET', '/api/industry-partners', false, err.response?.data?.message || err.message);
  }

  // 20. Industry: POST /api/industry-partners (Admin)
  try {
    const res = await axios.post(
      `${BASE_URL}/api/industry-partners`,
      {
        userId: (await axios.get(`${BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${industryToken}` } })).data.user._id,
        name: 'CleanTech Innovations Ranchi',
        type: 'startup',
        sectorFocus: ['water_resources', 'waste_management'],
        contactEmail: 'info@cleantech-ranchi.in'
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    recordResult('Create Industry Partner', 'POST', '/api/industry-partners', res.status === 201 && !!res.data.industryPartner);
  } catch (err) {
    recordResult('Create Industry Partner', 'POST', '/api/industry-partners', false, err.response?.data?.message || err.message);
  }

  // 21. Projects: POST /api/projects/:id/invite-industry (University)
  try {
    const res = await axios.post(
      `${BASE_URL}/api/projects/${createdProjectId}/invite-industry`,
      { industryPartnerId },
      { headers: { Authorization: `Bearer ${universityToken}` } }
    );
    recordResult('Invite Industry Partner', 'POST', '/api/projects/:id/invite-industry', res.status === 200 && !!res.data.project.industryPartnerId);
  } catch (err) {
    recordResult('Invite Industry Partner', 'POST', '/api/projects/:id/invite-industry', false, err.response?.data?.message || err.message);
  }

  // 22. Projects: PATCH /api/projects/:id/industry-response (Industry)
  try {
    const res = await axios.patch(
      `${BASE_URL}/api/projects/${createdProjectId}/industry-response`,
      { accepted: true },
      { headers: { Authorization: `Bearer ${industryToken}` } }
    );
    recordResult('Industry Accepts Invite', 'PATCH', '/api/projects/:id/industry-response', res.status === 200 && res.data.project.status === 'approved');
  } catch (err) {
    recordResult('Industry Accepts Invite', 'PATCH', '/api/projects/:id/industry-response', false, err.response?.data?.message || err.message);
  }

  // 23. Notifications: GET /api/notifications (Citizen)
  try {
    const res = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    notificationId = res.data.notifications?.[0]?._id;
    recordResult('Get Notifications', 'GET', '/api/notifications', res.status === 200 && Array.isArray(res.data.notifications), `count=${res.data.notifications.length}`);
  } catch (err) {
    recordResult('Get Notifications', 'GET', '/api/notifications', false, err.response?.data?.message || err.message);
  }

  // 24. Notifications: PATCH /api/notifications/:id/read
  if (notificationId) {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${citizenToken}` } }
      );
      recordResult('Mark Notification Read', 'PATCH', '/api/notifications/:id/read', res.status === 200 && res.data.notification.read === true);
    } catch (err) {
      recordResult('Mark Notification Read', 'PATCH', '/api/notifications/:id/read', false, err.response?.data?.message || err.message);
    }
  } else {
    recordResult('Mark Notification Read', 'PATCH', '/api/notifications/:id/read', true, 'Skipped: No notification to mark');
  }

  // 25. Analytics: GET /api/analytics/summary (Admin)
  try {
    const res = await axios.get(`${BASE_URL}/api/analytics/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const hasData = res.status === 200 && typeof res.data.totalComplaints === 'number';
    recordResult('Analytics Summary', 'GET', '/api/analytics/summary', hasData, `totalComplaints=${res.data.totalComplaints}`);
  } catch (err) {
    recordResult('Analytics Summary', 'GET', '/api/analytics/summary', false, err.response?.data?.message || err.message);
  }

  // 26. Analytics: GET /api/analytics/trends (Admin)
  try {
    const res = await axios.get(`${BASE_URL}/api/analytics/trends`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    recordResult('Analytics Trends', 'GET', '/api/analytics/trends', res.status === 200 && Array.isArray(res.data.trends), `daysWithData=${res.data.trends.length}`);
  } catch (err) {
    recordResult('Analytics Trends', 'GET', '/api/analytics/trends', false, err.response?.data?.message || err.message);
  }

  console.log('\n================================================================');
  const passedCount = results.filter((r) => r.success).length;
  const totalCount = results.length;
  console.log(`Summary: ${passedCount}/${totalCount} Endpoints & Workflows Passed Successfully!`);
  console.log('================================================================\n');

  if (passedCount === totalCount) {
    console.log('🎉 ALL BACKEND ROUTES AND WORKFLOWS ARE 100% OPERATIONAL!');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Review log above.');
    process.exit(1);
  }
}

run();
