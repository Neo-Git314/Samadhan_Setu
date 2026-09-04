// Centralized Role-Based Access Control (RBAC) System

export const ROLES = {
  CITIZEN: 'citizen',
  UNIVERSITY: 'university',
  INDUSTRY: 'industry',
  ADMIN: 'admin'
};

export const rolePermissions = {
  citizen: [
    'view_citizen_portal',
    'submit_complaint',
    'view_my_complaints',
    'view_complaint_detail',
    'view_notifications'
  ],
  university: [
    'view_university_portal',
    'view_challenges',
    'view_project_detail',
    'manage_uni_profile',
    'view_notifications'
  ],
  industry: [
    'view_industry_portal',
    'view_industry_invites',
    'manage_industry_profile',
    'view_notifications'
  ],
  admin: [
    'view_admin_portal',
    'view_admin_dashboard',
    'manage_complaints',
    'view_analytics',
    'view_complaint_detail',
    'view_notifications'
  ]
};

export const roleDefaultRoutes = {
  citizen: '/citizen/complaints',
  university: '/university/challenges',
  industry: '/industry/invites',
  admin: '/admin/dashboard'
};

export const roleRoutePermissions = {
  '/': ['citizen'],
  '/citizen/complaints': ['citizen'],
  '/citizen/submit': ['citizen'],
  '/complaints/:id': ['citizen', 'admin', 'university'],
  '/university/challenges': ['university'],
  '/university/projects/:id': ['university', 'industry'],
  '/university/profile': ['university'],
  '/industry/invites': ['industry'],
  '/industry/profile': ['industry'],
  '/notifications': ['citizen', 'university', 'industry', 'admin'],
  '/admin/complaints': ['admin'],
  '/admin/dashboard': ['admin']
};

export function hasPermission(role, permission) {
  if (!role || !rolePermissions[role]) return false;
  return rolePermissions[role].includes(permission);
}

export function canAccessRoute(role, path) {
  if (!role) return false;
  
  // Direct exact match
  if (roleRoutePermissions[path]) {
    return roleRoutePermissions[path].includes(role);
  }
  
  // Dynamic route matches
  if (path.startsWith('/complaints/')) {
    return ['citizen', 'admin', 'university'].includes(role);
  }
  if (path.startsWith('/university/projects/')) {
    return ['university', 'industry'].includes(role);
  }
  if (path.startsWith('/citizen/')) {
    return role === 'citizen';
  }
  if (path.startsWith('/university/')) {
    return role === 'university';
  }
  if (path.startsWith('/industry/')) {
    return role === 'industry';
  }
  if (path.startsWith('/admin/')) {
    return role === 'admin';
  }
  
  return false;
}

export function getRoleDefaultRoute(role) {
  return roleDefaultRoutes[role] || '/auth';
}

export function getRoleBadgeInfo(role) {
  switch (role) {
    case 'citizen':
      return {
        label: 'Citizen',
        shortLabel: 'Citizen',
        icon: 'person',
        badgeColor: 'bg-primary-container/20 text-primary border-primary-container/40'
      };
    case 'university':
      return {
        label: 'University Partner',
        shortLabel: 'University',
        icon: 'school',
        badgeColor: 'bg-tertiary-container/20 text-tertiary border-tertiary-container/40'
      };
    case 'industry':
      return {
        label: 'Industry Partner',
        shortLabel: 'Industry',
        icon: 'corporate_fare',
        badgeColor: 'bg-secondary-container text-on-surface border-secondary/40'
      };
    case 'admin':
      return {
        label: 'Nodal Officer / Admin',
        shortLabel: 'Admin',
        icon: 'admin_panel_settings',
        badgeColor: 'bg-primary-container text-white border-primary'
      };
    default:
      return {
        label: 'Guest',
        shortLabel: 'Guest',
        icon: 'account_circle',
        badgeColor: 'bg-surface-container text-secondary border-surface-container-highest'
      };
  }
}
