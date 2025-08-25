import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { uploadAvatar, removeAvatar, getAvatar } from '../controllers/avatarController.js';

const router = Router();

router.get('/me', auth, getAvatar);
router.post('/upload', auth, upload.single('avatar'), uploadAvatar);
router.delete('/remove', auth, removeAvatar);

export default router;
