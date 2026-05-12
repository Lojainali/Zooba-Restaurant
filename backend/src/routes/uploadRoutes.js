import express from 'express';
import { uploadSingle } from '../utils/upload.js';
import { protect, authorize } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Upload image
router.post('/image', protect, authorize('admin'), (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        message: err.message || 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please select an image file.' });
    }

    // Return the file path (relative to public/uploads)
    const filePath = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully',
      imageUrl: filePath,
      filename: req.file.filename
    });
  });
});

export default router;

