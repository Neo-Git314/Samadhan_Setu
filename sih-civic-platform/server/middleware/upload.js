import multer from 'multer';

// TODO: Configure cloud upload limits, storage engines, and file validation.
const storage = multer.memoryStorage();

export const upload = multer({ storage });
