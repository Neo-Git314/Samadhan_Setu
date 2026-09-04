import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import Complaint from '../models/Complaint.js';
import IndustryPartner from '../models/IndustryPartner.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import University from '../models/University.js';
import User from '../models/User.js';
import { getEmbedding } from '../services/aiService.js';

dotenv.config();

async function seed() {
  console.log('--- Starting Database Seeding for Samadhan Setu ---');

  try {
    await connectDB();

    // 1. Clear existing collections safely
    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      University.deleteMany({}),
      Project.deleteMany({}),
      IndustryPartner.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('[Seeder] Collections cleared.');

    // 2. Create seeded users with hashed password123
    console.log('[Seeder] Creating seeded users with password "password123"...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const [citizenUser, universityUser, industryUser, adminUser] = await User.create([
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@gmail.com',
        passwordHash,
        role: 'citizen',
        phone: '+91 9876543210',
        organization: 'Angara Gram Panchayat, Ranchi'
      },
      {
        name: 'Dr. Anita Sharma (PI)',
        email: 'university@bitmesra.ac.in',
        passwordHash,
        role: 'university',
        phone: '+91 9123456780',
        organization: 'Birla Institute of Technology (BIT), Mesra, Ranchi'
      },
      {
        name: 'Suresh Patel (CSR Lead)',
        email: 'contact@ecosolve.in',
        passwordHash,
        role: 'industry',
        phone: '+91 9988776655',
        organization: 'EcoSolve Technologies Pvt Ltd'
      },
      {
        name: 'Nodal Officer Rajesh Varma',
        email: 'admin@samadhan.gov.in',
        passwordHash,
        role: 'admin',
        phone: '+91 9000000000',
        organization: 'Department of IT & e-Governance, Govt. of Jharkhand'
      },
      {
        name: 'Ravi Kumar (Citizen)',
        email: 'ravi.citizen@example.com',
        passwordHash,
        role: 'citizen',
        phone: '+91 9876543219',
        organization: 'Ranchi Municipal Corporation'
      },
      {
        name: 'Dr. Anita Sharma',
        email: 'anita@bitmesra.ac.in',
        passwordHash,
        role: 'university',
        phone: '+91 9876543211',
        organization: 'Birla Institute of Technology, Mesra'
      },
      {
        name: 'Suresh Patel',
        email: 'suresh@ecosolve.in',
        passwordHash,
        role: 'industry',
        phone: '+91 9876543212',
        organization: 'EcoSolve Technologies'
      },
      {
        name: 'State Civic Administrator',
        email: 'admin@platform.gov.in',
        passwordHash,
        role: 'admin',
        phone: '+91 9876543213',
        organization: 'Jharkhand State Urban Development Agency'
      }
    ]);
    console.log('[Seeder] Evaluation persona users created successfully.');

    // 3. Create sample University linked to universityUser
    console.log('[Seeder] Creating sample University profile (BIT Mesra)...');
    const uniKeywords = ['water treatment', 'groundwater', 'waste recycling', 'iot sensors', 'rural development'];
    const uniEmbedding = await getEmbedding(uniKeywords.join(' '));

    const university = await University.create({
      userId: universityUser._id,
      name: 'BIT Mesra, Ranchi',
      location: { lat: 23.4123, lng: 85.4399 },
      disciplines: ['water_resources', 'environment', 'urban_development', 'energy'],
      researchKeywords: uniKeywords,
      researchEmbedding: uniEmbedding,
      incubationFacility: true,
      contactEmail: 'anita@bitmesra.ac.in'
    });
    console.log('[Seeder] University profile created.');

    // 4. Create sample IndustryPartner linked to industryUser
    console.log('[Seeder] Creating sample Industry Partner (EcoSolve Technologies)...');
    const industryPartner = await IndustryPartner.create({
      userId: industryUser._id,
      name: 'EcoSolve Technologies',
      type: 'MSME',
      sectorFocus: ['water_resources', 'waste_management', 'clean_energy'],
      contactEmail: 'suresh@ecosolve.in'
    });
    console.log('[Seeder] Industry Partner profile created.');

    // 5. Create 3 sample Complaints
    console.log('[Seeder] Creating sample Complaints...');
    const complaint1Text = 'Broken Hand Pump in Angara Village. The primary community drinking water hand pump near primary school has broken down for 3 weeks.';
    const complaint1Embedding = await getEmbedding(complaint1Text);

    // Complaint #1: Active hand pump in Ranchi (water_resources, status: assigned)
    const complaint1 = await Complaint.create({
      submittedBy: citizenUser._id,
      title: 'Broken Hand Pump in Angara Village',
      description: 'The primary community drinking water hand pump near primary school has broken down for 3 weeks. Students and local residents have no access to clean water.',
      location: {
        lat: 23.3648,
        lng: 85.3346,
        address: 'Near Primary School, Angara Block, Ranchi, Jharkhand'
      },
      district: 'Ranchi',
      mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/samples/water-pump.jpg'],
      category: 'water_resources',
      categoryConfidence: 0.94,
      urgency: 'high',
      status: 'assigned',
      assignedUniversity: university._id,
      embedding: complaint1Embedding,
      suggestedUniversities: [{ universityId: university._id, score: 0.88 }]
    });

    // Complaint #2: Garbage dump complaint (environment, status: pending, needsReview: true)
    const complaint2Text = 'Illegal Garbage Dumping near Harmu River embankment causing hazardous stench and water pollution.';
    const complaint2Embedding = await getEmbedding(complaint2Text);

    const complaint2 = await Complaint.create({
      submittedBy: citizenUser._id,
      title: 'Illegal Garbage Dumping near Harmu River',
      description: 'Severe accumulation of unsegregated plastic and municipal waste near Harmu river embankment.',
      location: {
        lat: 23.3512,
        lng: 85.3124,
        address: 'Harmu Embankment Road, Ranchi, Jharkhand'
      },
      district: 'Ranchi',
      mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/samples/waste-dump.jpg'],
      category: 'environment',
      categoryConfidence: 0.54, // < 0.6 triggers needsReview
      urgency: 'medium',
      status: 'pending',
      needsReview: true,
      embedding: complaint2Embedding,
      suggestedUniversities: [{ universityId: university._id, score: 0.72 }]
    });

    // Complaint #3: Duplicate complaint linked via duplicateOf to Complaint #1
    const complaint3Text = 'Non-working drinking water hand pump in Angara village.';
    const complaint3Embedding = await getEmbedding(complaint3Text);

    const complaint3 = await Complaint.create({
      submittedBy: citizenUser._id,
      title: 'Non-working drinking water pump at Angara',
      description: 'Hand pump is broken in Angara, no water coming out for several days.',
      location: {
        lat: 23.3652,
        lng: 85.3351,
        address: 'Angara Ward 2, Ranchi, Jharkhand'
      },
      district: 'Ranchi',
      mediaUrls: ['https://res.cloudinary.com/demo/image/upload/v1/samples/water-pump.jpg'],
      category: 'water_resources',
      categoryConfidence: 0.91,
      urgency: 'high',
      status: 'duplicate',
      duplicateOf: complaint1._id,
      embedding: complaint3Embedding
    });
    console.log('[Seeder] 3 Complaints created.');

    // 6. Create sample Project linked to Complaint #1 and University
    console.log('[Seeder] Creating sample Project...');
    const project = await Project.create({
      complaintId: complaint1._id,
      universityId: university._id,
      industryPartnerId: industryPartner._id,
      status: 'in_progress',
      team: [
        { name: 'Dr. Anita Sharma', role: 'faculty_mentor' },
        { name: 'Rohan Gupta', role: 'student' },
        { name: 'Priya Verma', role: 'student' }
      ],
      milestones: [
        {
          title: 'Field Survey and Ground Water Table Assessment',
          dueDate: new Date(Date.now() - 5 * 86400000),
          status: 'done'
        },
        {
          title: 'Solar Submersible Pump & Filtration Retrofit Installation',
          dueDate: new Date(Date.now() + 15 * 86400000),
          status: 'pending'
        },
        {
          title: 'Community Water Quality Monitoring and Handover',
          dueDate: new Date(Date.now() + 30 * 86400000),
          status: 'pending'
        }
      ],
      proposalDoc: 'https://docs.samadhansetu.gov.in/proposals/bit-mesra-angara-handpump.pdf'
    });
    console.log('[Seeder] Sample Project created.');

    // 7. Create 3 sample Notifications
    console.log('[Seeder] Creating sample Notifications...');
    await Notification.create([
      {
        userId: citizenUser._id,
        message: 'Your complaint "Broken Hand Pump in Angara Village" has been assigned to BIT Mesra, Ranchi.',
        type: 'challenge_accepted',
        relatedId: complaint1._id,
        read: false
      },
      {
        userId: industryUser._id,
        message: 'You have been invited by BIT Mesra, Ranchi to collaborate on project solving "Broken Hand Pump in Angara Village".',
        type: 'industry_invitation',
        relatedId: project._id,
        read: false
      },
      {
        userId: citizenUser._id,
        message: 'Your complaint appears similar to an existing one',
        type: 'duplicate_detected',
        relatedId: complaint1._id,
        read: true
      }
    ]);
    console.log('[Seeder] 3 Notifications created.');

    console.log('\n====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('Evaluation Persona Seed Accounts:');
    console.log('  1. Citizen:    rahul.kumar@gmail.com      | password: password123');
    console.log('  2. University: university@bitmesra.ac.in  | password: password123');
    console.log('  3. Industry:   contact@ecosolve.in        | password: password123');
    console.log('  4. Admin:      admin@samadhan.gov.in      | password: password123');
    console.log('====================================================\n');
  } catch (error) {
    console.error('[Seeder] Error during database seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

seed();
