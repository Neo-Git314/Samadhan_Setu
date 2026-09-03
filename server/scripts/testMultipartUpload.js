import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function testMultipartUpload() {
  console.log('Testing Multipart / Form-Data Upload with image...');

  // 1. Citizen login
  const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'ravi.citizen@example.com',
    password: 'password123'
  });
  const token = loginRes.data.token;

  // 2. Create sample 1x1 JPEG image buffer
  const sampleImageBuffer = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64'
  );

  const form = new FormData();
  form.append('title', 'Water leakage from main pipeline in Morabadi');
  form.append('description', 'Severe pipeline fracture spilling thousands of liters of drinking water onto Morabadi road.');
  form.append('district', 'Ranchi');
  form.append('location', JSON.stringify({ lat: 23.385, lng: 85.325, address: 'Morabadi Ground Road' }));
  form.append('images', sampleImageBuffer, {
    filename: 'pipeline-leak.jpg',
    contentType: 'image/jpeg'
  });

  const res = await axios.post(`${BASE_URL}/api/complaints`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders()
    }
  });

  console.log(`Status: ${res.status}`);
  console.log('Uploaded Complaint ID:', res.data.complaint?._id);
  console.log('Media URLs:', res.data.complaint?.mediaUrls);

  if (res.status === 201 && res.data.complaint?.mediaUrls?.length > 0) {
    console.log('✅ Multipart file upload and Cloudinary handler passed successfully!');
    process.exit(0);
  } else {
    console.error('❌ Multipart upload failed');
    process.exit(1);
  }
}

testMultipartUpload().catch((err) => {
  console.error('Error during upload test:', err.response?.data || err.message);
  process.exit(1);
});
