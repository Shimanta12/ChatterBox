import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { me, updateProfile, searchUsers } from '../controllers/userController.js';

const router = Router();

router.get('/me', auth, me);
router.put('/me', auth, updateProfile);
router.get('/search', auth, searchUsers);

export default router;
