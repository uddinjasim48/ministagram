const multer = require('multer');
const path = require('path');

// Set storage (in-memory for now)
const storage = multer.memoryStorage();

// File filter — only allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images & Videos only!');
  }
};

// Multer upload config
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Max 50MB (adjustable)
  fileFilter: fileFilter
});

module.exports = upload;