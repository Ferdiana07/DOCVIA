const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists at startup
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration: where and how files are saved on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp + random number + original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// Allowed MIME types — we check the actual MIME type, not just the extension
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

const matchesFileSignature = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isPdf = buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  return isJpeg || isPng || isPdf;
};

const removeUploadedFile = async (file) => {
  if (!file?.path) return;
  try {
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const validateUploadedFile = async (req, res, next) => {
  if (!req.file) return next();
  try {
    const handle = await fs.promises.open(req.file.path, 'r');
    const buffer = Buffer.alloc(8);
    await handle.read(buffer, 0, buffer.length, 0);
    await handle.close();

    if (!matchesFileSignature(buffer)) {
      await removeUploadedFile(req.file);
      req.file = undefined;
      return res.status(400).json({
        success: false,
        message: 'The uploaded file content does not match an allowed JPG, PNG, or PDF format.',
      });
    }
    return next();
  } catch (error) {
    await removeUploadedFile(req.file);
    return next(error);
  }
};

const cleanupRejectedUpload = (req, res, next) => {
  res.on('finish', () => {
    if (req.file && res.statusCode >= 400) {
      removeUploadedFile(req.file).catch(() => {});
    }
  });
  next();
};

module.exports = { upload, validateUploadedFile, cleanupRejectedUpload, matchesFileSignature };
