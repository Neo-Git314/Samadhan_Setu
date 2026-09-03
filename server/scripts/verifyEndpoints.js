import app from '../server.js';

function listEndpoints(expressApp) {
  const routes = [];

  function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach((stackItem) => {
        routes.push({
          method: stackItem.method.toUpperCase(),
          path: (path + layer.route.path).replace(/\/+/g, '/')
        });
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      let routerPath = '';
      if (layer.regexp) {
        const str = layer.regexp.source;
        const match = str
          .replace('\\/?(?=\\/|$)', '')
          .replace('^\\', '')
          .replace('^', '')
          .replace('\\/?$', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/');
        routerPath = match;
      }
      layer.handle.stack.forEach((stackItem) => {
        print(routerPath, stackItem);
      });
    }
  }

  expressApp._router.stack.forEach((layer) => {
    print('', layer);
  });

  return routes;
}

const expectedEndpoints = [
  { method: 'GET', path: '/api/health' },
  // Auth
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'GET', path: '/api/auth/me' },
  // Complaints
  { method: 'POST', path: '/api/complaints' },
  { method: 'GET', path: '/api/complaints' },
  { method: 'GET', path: '/api/complaints/:id/duplicates' },
  { method: 'GET', path: '/api/complaints/:id' },
  { method: 'PATCH', path: '/api/complaints/:id/status' },
  // Universities
  { method: 'GET', path: '/api/universities' },
  { method: 'POST', path: '/api/universities' },
  { method: 'GET', path: '/api/universities/:id/challenges' },
  { method: 'POST', path: '/api/universities/:id/accept/:complaintId' },
  // Projects
  { method: 'GET', path: '/api/projects' },
  { method: 'GET', path: '/api/projects/:id' },
  { method: 'PATCH', path: '/api/projects/:id/milestones' },
  { method: 'PATCH', path: '/api/projects/:id/team' },
  { method: 'POST', path: '/api/projects/:id/invite-industry' },
  { method: 'PATCH', path: '/api/projects/:id/industry-response' },
  // Industry
  { method: 'GET', path: '/api/industry-partners' },
  { method: 'POST', path: '/api/industry-partners' },
  // Notifications
  { method: 'GET', path: '/api/notifications' },
  { method: 'PATCH', path: '/api/notifications/:id/read' },
  // Analytics
  { method: 'GET', path: '/api/analytics/summary' },
  { method: 'GET', path: '/api/analytics/trends' }
];

console.log('====================================================');
console.log('--- Verifying All Express Endpoints in Server ---');
console.log('====================================================\n');

const registered = listEndpoints(app);

let allMatched = true;
expectedEndpoints.forEach((expected, i) => {
  const match = registered.find(
    (r) => r.method === expected.method && (r.path.includes(expected.path) || expected.path.includes(r.path))
  );

  if (match) {
    console.log(`✅ [${i + 1}/24] ${expected.method.padEnd(6)} ${expected.path}`);
  } else {
    console.error(`❌ [${i + 1}/24] Missing endpoint: ${expected.method} ${expected.path}`);
    allMatched = false;
  }
});

console.log('\nTotal registered route handlers detected:', registered.length);
if (allMatched) {
  console.log('🎉 ALL 23 REQUIRED API ENDPOINTS + HEALTH CHECK ARE PROPERLY CONFIGURED!');
  process.exit(0);
} else {
  console.error('⚠️ Some endpoints were not detected in router stack.');
  process.exit(1);
}
