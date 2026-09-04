import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  mockComplaints as initialMockComplaints,
  mockProjects as initialMockProjects,
  mockUniversities as initialMockUniversities,
  mockIndustryPartners as initialMockIndustryPartners,
  mockNotifications as initialMockNotifications
} from '../mocks/mockData';

const DataContext = createContext(null);

// Initial enriched complaints matching the Jharkhand Government civic data model
const DEFAULT_INITIAL_COMPLAINTS = [
  {
    _id: 'c2001',
    urn: 'SAM-2026-004582',
    submittedBy: 'u1001',
    citizen: 'Rajesh Kumar',
    title: 'Severe tap water discoloration and chemical odor in Ward 12, Ranchi',
    description: 'For the past 4 consecutive days, the municipal pipeline serving Ward 12 near Kanke Road has been discharging rust-colored contaminated water with strong sulfide odor. Multiple families have reported stomach infections. Prior local maintenance tickets have timed out without remediation.',
    category: 'Water Supply & Contamination',
    department: 'Drinking Water & Sanitation Department (DWSD), Govt. of Jharkhand',
    urgency: 'Critical Life Safety (SLA: 12 Hours)',
    urgencyLevel: 'critical',
    status: 'In Progress',
    active: true,
    slaLeft: '12h Left',
    slaHours: 12,
    location: {
      lat: 23.3629,
      lng: 85.3372,
      state: 'Jharkhand',
      district: 'Ranchi',
      ward: 'Ward 12, Pincode 834008',
      address: 'Kanke Road Pumping Station Junction, Ranchi, Jharkhand'
    },
    date: '2026-02-06',
    createdAt: '2026-02-06T08:15:00.000Z',
    mediaUrls: [
      { name: 'water_turbidity_sample_1.jpg', size: '2.1 MB', type: 'image' },
      { name: 'local_clinic_lab_report.pdf', size: '1.4 MB', type: 'pdf' }
    ],
    aiAnalysis: {
      category: 'Water Supply & Contamination',
      confidence: 0.96,
      severity: 'Critical (Biofilm Contamination)',
      tags: ['biofilm', 'rust_contamination', 'pipeline_fracture', 'pumping_station'],
      suggestedAction: 'Immediate pipeline isolation and deployment of UV flocculation filters.',
      relevanceScore: 0.96
    },
    assignedUniversity: 'Birla Institute of Technology (BIT), Mesra, Ranchi',
    assignedUniId: 'uni501',
    assignedIndustry: 'EcoSolve Technologies Pvt Ltd',
    assignedIndId: 'ind701',
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '06 Feb 2026, 08:15 AM', status: 'done', desc: 'Citizen registered via Jharkhand State SSO (JAP-IT) with GPS geotag & water sample imagery.' },
      { step: 2, title: 'AI NLP Triaged & Verified', date: '06 Feb 2026, 08:16 AM', status: 'done', desc: 'Computer vision verified turbidity >14 NTU. Auto-escalated to Jharkhand State Critical SLA (12h).' },
      { step: 3, title: 'Department Escalated', date: '06 Feb 2026, 09:00 AM', status: 'done', desc: 'Auto-dispatched to Drinking Water & Sanitation Department (DWSD), Govt. of Jharkhand (Executive Engineer Ranchi Zone).' },
      { step: 4, title: 'Academic Innovation Matched', date: '06 Feb 2026, 10:30 AM', status: 'done', desc: 'Assigned to BIT Mesra Capstone Hub for rapid inline filtration prototyping.' },
      { step: 5, title: 'Field Remediation Underway', date: '06 Feb 2026, 01:15 PM', status: 'current', desc: 'Field engineer crew on site with IoT water monitoring sensors.' },
      { step: 6, title: 'Resolution & Citizen Sign-off', date: 'Expected 06 Feb 2026, 08:00 PM', status: 'pending', desc: 'Post-repair water purity testing and OTP-based verification.' }
    ]
  },
  {
    _id: 'c2002',
    urn: 'SAM-2026-004521',
    submittedBy: 'u1001',
    citizen: 'Sunil Mehta',
    title: 'Hazardous deep trench left uncovered near Govt High School, Dhanbad',
    description: 'A 6-foot deep storm drain excavation has remained unfenced for 2 weeks with zero warning barriers or reflective lighting along Hirapur main road.',
    category: 'Roads & Public Infrastructure',
    department: 'Road Construction Department (RCD / PWD), Govt. of Jharkhand',
    urgency: 'High Urgency (SLA: 48 Hours)',
    urgencyLevel: 'high',
    status: 'In Progress',
    active: true,
    slaLeft: '24h Left',
    slaHours: 24,
    location: {
      lat: 23.7957,
      lng: 86.4304,
      state: 'Jharkhand',
      district: 'Dhanbad',
      ward: 'Ward 08, Pincode 826001',
      address: 'Near Govt High School, Hirapur, Dhanbad'
    },
    date: '2026-02-04',
    createdAt: '2026-02-04T11:20:00.000Z',
    mediaUrls: [
      { name: 'trench_site_photo.jpg', size: '3.2 MB', type: 'image' }
    ],
    aiAnalysis: {
      category: 'Roads & Public Infrastructure',
      confidence: 0.94,
      severity: 'High (Pedestrian Fall Risk)',
      tags: ['excavation', 'missing_barricade', 'school_zone'],
      suggestedAction: 'Immediate barricading and backfilling contractor notice.',
      relevanceScore: 0.94
    },
    assignedUniversity: 'IIT (ISM) Dhanbad',
    assignedUniId: 'uni503',
    assignedIndustry: null,
    assignedIndId: null,
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '04 Feb 2026', status: 'done', desc: 'Filed by citizen via Samadhan Setu Jharkhand.' },
      { step: 2, title: 'AI Triaged', date: '04 Feb 2026', status: 'done', desc: 'School safety hazard detected.' },
      { step: 3, title: 'RCD / PWD Dispatched', date: '05 Feb 2026', status: 'current', desc: 'Notice served to road contractor by Dhanbad Division.' }
    ]
  },
  {
    _id: 'c2003',
    urn: 'SAM-2026-003980',
    submittedBy: 'u1001',
    citizen: 'Priya Verma',
    title: 'Frequent 11kV transformer sparks and voltage spikes damaging home electronics',
    description: 'Distribution transformer sparks violently during load peaks. Voltage surges measured up to 310V, damaging appliances in 40+ households.',
    category: 'Electricity & Grid Faults',
    department: 'Jharkhand Bijli Vitran Nigam Limited (JBVNL)',
    urgency: 'Critical Life Safety (SLA: 12 Hours)',
    urgencyLevel: 'critical',
    status: 'Resolved',
    active: false,
    slaLeft: 'Resolved',
    slaHours: 0,
    location: {
      lat: 23.3629,
      lng: 85.3372,
      state: 'Jharkhand',
      district: 'Ranchi',
      ward: 'Ward 15, Pincode 834001',
      address: 'Lalpur Chowk, Ranchi, Jharkhand'
    },
    date: '2026-01-28',
    createdAt: '2026-01-28T09:40:00.000Z',
    mediaUrls: [],
    aiAnalysis: {
      category: 'Electricity & Grid Faults',
      confidence: 0.98,
      severity: 'Critical Electrical Fault',
      tags: ['transformer', 'voltage_surge', 'fire_hazard'],
      suggestedAction: 'Immediate transformer oil test and phase stabilizer install.',
      relevanceScore: 0.98
    },
    assignedUniversity: 'Birla Institute of Technology (BIT), Mesra, Ranchi',
    assignedUniId: 'uni501',
    assignedIndustry: 'EcoSolve Technologies Pvt Ltd',
    assignedIndId: 'ind701',
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '28 Jan 2026', status: 'done', desc: 'Filed by resident association on Samadhan Setu.' },
      { step: 2, title: 'Transformer Replaced', date: '29 Jan 2026', status: 'done', desc: 'JBVNL Ranchi Division replaced 250kVA transformer unit.' },
      { step: 3, title: 'Resolved', date: '30 Jan 2026', status: 'done', desc: 'Resolved and verified by citizen OTP.' }
    ]
  },
  {
    _id: 'c2004',
    urn: 'SAM-2026-003841',
    submittedBy: 'u1001',
    citizen: 'Anand Prakash',
    title: 'Solid waste burning and uncollected municipal garbage dump near Bistupur Market',
    description: 'Unregulated open garbage burning produces heavy toxic smoke near busy vegetable market in Jamshedpur.',
    category: 'Solid Waste & Sanitation',
    department: 'Ranchi Municipal Corporation (RMC) / UD&HD Jharkhand',
    urgency: 'Standard (SLA: 5 Days)',
    urgencyLevel: 'standard',
    status: 'Resolved',
    active: false,
    slaLeft: 'Resolved',
    slaHours: 0,
    location: {
      lat: 22.7925,
      lng: 86.1842,
      state: 'Jharkhand',
      district: 'East Singhbhum (Jamshedpur)',
      ward: 'Ward 04, Pincode 831001',
      address: 'Bistupur Market Complex, Jamshedpur, Jharkhand'
    },
    date: '2026-01-20',
    createdAt: '2026-01-20T14:10:00.000Z',
    mediaUrls: [],
    aiAnalysis: {
      category: 'Solid Waste & Sanitation',
      confidence: 0.92,
      severity: 'Environmental Hazard',
      tags: ['garbage_burning', 'air_pollution', 'waste_management'],
      suggestedAction: 'Deploy compactors and issue environmental violation notice.',
      relevanceScore: 0.92
    },
    assignedUniversity: 'NIT Jamshedpur',
    assignedUniId: 'uni502',
    assignedIndustry: null,
    assignedIndId: null,
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '20 Jan 2026', status: 'done', desc: 'Filed by market association.' },
      { step: 2, title: 'Sanitation Cleared', date: '22 Jan 2026', status: 'done', desc: 'Waste removed and dumper bins installed.' }
    ]
  },
  {
    _id: 'c2005',
    urn: 'SAM-2026-004610',
    submittedBy: 'u1001',
    citizen: 'Kavita Nair',
    title: 'Stagnant wastewater pooling causing severe mosquito breeding & dengue risk in Bokaro',
    description: 'Blocked drain culvert in Sector 4 has created a 200m stagnant swamp behind residential colony.',
    category: 'Public Health & Vector Control',
    department: 'Health, Medical Education & Family Welfare Dept., Govt. of Jharkhand',
    urgency: 'High Urgency (SLA: 48 Hours)',
    urgencyLevel: 'high',
    status: 'In Progress',
    active: true,
    slaLeft: '36h Left',
    slaHours: 36,
    location: {
      lat: 23.6693,
      lng: 86.1511,
      state: 'Jharkhand',
      district: 'Bokaro',
      ward: 'Sector 4, Pincode 827004',
      address: 'Block B Culvert Drainage, Bokaro Steel City, Jharkhand'
    },
    date: '2026-02-05',
    createdAt: '2026-02-05T16:00:00.000Z',
    mediaUrls: [],
    aiAnalysis: {
      category: 'Public Health & Vector Control',
      confidence: 0.95,
      severity: 'High Vector Hazard',
      tags: ['stagnant_water', 'mosquito_breeding', 'culvert_blockage'],
      suggestedAction: 'Bio-larvicide spraying and suction machine desilting.',
      relevanceScore: 0.95
    },
    assignedUniversity: 'Birsa Institute of Technology (BIT) Sindri',
    assignedUniId: 'uni504',
    assignedIndustry: null,
    assignedIndId: null,
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '05 Feb 2026', status: 'done', desc: 'Filed by RWA.' },
      { step: 2, title: 'Vector Control Team Notified', date: '06 Feb 2026', status: 'current', desc: 'Desilting pump deployed.' }
    ]
  },
  {
    _id: 'c2006',
    urn: 'SAM-2026-004419',
    submittedBy: 'u1001',
    citizen: 'Rameshwar Yadav',
    title: 'Village community borewell failed due to groundwater table depletion in Kanke',
    description: 'Only functional public water source in Kanke has run dry. 300+ families currently dependent on commercial water tankers.',
    category: 'Water Supply & Contamination',
    department: 'Rural Development & Panchayati Raj Dept., Govt. of Jharkhand',
    urgency: 'High Urgency (SLA: 48 Hours)',
    urgencyLevel: 'high',
    status: 'In Progress',
    active: true,
    slaLeft: '40h Left',
    slaHours: 40,
    location: {
      lat: 23.4241,
      lng: 85.4298,
      state: 'Jharkhand',
      district: 'Ranchi',
      ward: 'Kanke Block, Pincode 834006',
      address: 'Primary School Compound, Kanke Village, Ranchi, Jharkhand'
    },
    date: '2026-02-03',
    createdAt: '2026-02-03T10:00:00.000Z',
    mediaUrls: [],
    aiAnalysis: {
      category: 'Water Supply & Contamination',
      confidence: 0.93,
      severity: 'High Rural Water Depletion',
      tags: ['borewell_failure', 'groundwater_recharge', 'rural_supply'],
      suggestedAction: 'Artificial aquifer recharge and solar pump retrofitting.',
      relevanceScore: 0.93
    },
    assignedUniversity: 'Birla Institute of Technology (BIT), Mesra, Ranchi',
    assignedUniId: 'uni501',
    assignedIndustry: 'EcoSolve Technologies Pvt Ltd',
    assignedIndId: 'ind701',
    timeline: [
      { step: 1, title: 'Grievance Registered', date: '03 Feb 2026', status: 'done', desc: 'Registered by Panchayat on Samadhan Setu.' },
      { step: 2, title: 'Assigned to BIT Mesra', date: '04 Feb 2026', status: 'current', desc: 'Capstone team testing solar water extraction.' }
    ]
  }
];

export function DataProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const saved = localStorage.getItem('samadhan_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If old data with Delhi is in localStorage, refresh to Jharkhand
        if (parsed.length > 0 && parsed[0]?.location?.state === 'NCT of Delhi') {
          return DEFAULT_INITIAL_COMPLAINTS;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load complaints from storage:', e);
    }
    return DEFAULT_INITIAL_COMPLAINTS;
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('samadhan_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3 && parsed[0].title) {
          return parsed;
        }
      }
    } catch (e) {}
    return initialMockProjects;
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('samadhan_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialMockNotifications;
  });

  const [universities] = useState(initialMockUniversities);
  const [industryPartners] = useState(initialMockIndustryPartners);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('samadhan_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('samadhan_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('samadhan_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Actions
  const addComplaint = (newComplaintData) => {
    const urn = `SAM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newComplaint = {
      _id: `c${Date.now()}`,
      urn,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'In Progress',
      active: true,
      slaLeft: newComplaintData.urgency?.includes('12 Hours') ? '12h Left' : '48h Left',
      slaHours: newComplaintData.urgency?.includes('12 Hours') ? 12 : 48,
      mediaUrls: newComplaintData.mediaUrls || [],
      timeline: [
        {
          step: 1,
          title: 'Grievance Registered',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: 'done',
          desc: 'Citizen registered via Jharkhand State SSO (JAP-IT) with GPS geotag.'
        },
        {
          step: 2,
          title: 'AI NLP Triaged & Verified',
          date: 'Just now',
          status: 'done',
          desc: 'Computer vision & NLP severity analysis completed with 96% confidence.'
        },
        {
          step: 3,
          title: 'Department Escalated',
          date: 'In progress',
          status: 'current',
          desc: `Automated dispatch to ${newComplaintData.department || 'Government of Jharkhand Nodal Authority'}.`
        },
        {
          step: 4,
          title: 'Academic Innovation Matched',
          date: 'Pending review',
          status: 'pending',
          desc: 'Assigned to Jharkhand University Innovation Hub for applied technical solution.'
        }
      ],
      aiAnalysis: {
        category: newComplaintData.category,
        confidence: 0.96,
        severity: newComplaintData.urgency?.includes('12 Hours') ? 'Critical Life Safety' : 'High Priority',
        tags: ['geo_verified', 'jharkhand_triaged', 'ai_analyzed'],
        suggestedAction: 'Immediate inspection by Jharkhand nodal authority.',
        relevanceScore: 0.96
      },
      ...newComplaintData
    };

    setComplaints((prev) => [newComplaint, ...prev]);

    // Add notification
    const newNotif = {
      _id: `n${Date.now()}`,
      userId: 'u1001',
      message: `Grievance ${urn} registered and assigned to ${newComplaint.department || 'Government of Jharkhand'}`,
      type: 'status_change',
      read: false,
      relatedId: newComplaint._id,
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newComplaint;
  };

  const updateComplaintStatus = (identifier, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c._id === identifier || c.urn === identifier) {
          return {
            ...c,
            status: newStatus,
            active: !isResolved,
            slaLeft: isResolved ? 'Resolved' : '24h Left'
          };
        }
        return c;
      })
    );
  };

  const toggleComplaintStatus = (identifier) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c._id === identifier || c.urn === identifier) {
          const isResolved = c.status === 'Resolved';
          const nextStatus = isResolved ? 'In Progress' : 'Resolved';
          return {
            ...c,
            status: nextStatus,
            active: isResolved,
            slaLeft: isResolved ? '24h Left' : 'Resolved'
          };
        }
        return c;
      })
    );
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateMilestone = (projectId, milestoneId, status) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p._id === projectId) {
          return {
            ...p,
            milestones: p.milestones.map((m) =>
              m._id === milestoneId ? { ...m, status } : m
            )
          };
        }
        return p;
      })
    );
  };

  const value = useMemo(
    () => ({
      complaints,
      projects,
      universities,
      industryPartners,
      notifications,
      addComplaint,
      updateComplaintStatus,
      toggleComplaintStatus,
      markNotificationRead,
      markAllNotificationsRead,
      updateMilestone
    }),
    [complaints, projects, universities, industryPartners, notifications]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
