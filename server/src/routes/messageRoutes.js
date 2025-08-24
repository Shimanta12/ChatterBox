import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getThread, sendMessageRest, markRead } from '../controllers/messageController.js';

const router = Router();

router.get('/thread/:withUserId', auth, getThread);
router.post('/send', auth, sendMessageRest);
router.post('/read', auth, markRead);

export default router;
