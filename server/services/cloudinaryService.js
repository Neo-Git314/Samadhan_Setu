import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

/**
 * Upload an in-memory buffer to Cloudinary using upload_stream.
 * If credentials are mock or missing, returns a deterministic placeholder URL so local tests don't crash.
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<string>} secure_url
 */
export async function uploadBuffer(buffer, folder = 'samadhan_setu') {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'demo_cloud' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'demo_key' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'demo_secret';

  if (!isCloudinaryConfigured) {
    const randomId = Math.random().toString(36).substring(2, 10);
    return `https://res.cloudinary.com/demo/image/upload/${folder}/mock_upload_${randomId}.jpg`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

export default {
  uploadBuffer
};
