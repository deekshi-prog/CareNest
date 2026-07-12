const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Ensure upload directory exists for local fallback
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local Disk Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload an image file (jpg, jpeg, png, webp).'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Configure Cloudinary if credentials are provided
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a local file (from Multer disk storage) to Cloudinary if configured.
 * Otherwise, returns the local static URL.
 * 
 * @param {Object} req - The Express request object.
 * @param {Object} file - The Multer file object.
 * @returns {Promise<string>} The file URL (Cloudinary or local static path).
 */
const uploadToCloudinaryOrLocal = async (req, file) => {
  if (!file) return '';

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'flora_assist',
      });
      // Delete local temporary file
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting temp file: ${err}`);
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage URL:', error);
      // Fallback to local url if upload fails
    }
  }

  // Local storage fallback URL
  const port = process.env.PORT || 5000;
  const protocol = req.protocol;
  const host = req.get('host'); // includes port if applicable
  return `${protocol}://${host}/uploads/${file.filename}`;
};

module.exports = {
  upload,
  uploadToCloudinaryOrLocal,
};
