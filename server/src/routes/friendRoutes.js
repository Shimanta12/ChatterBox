// src/routes/friendRoutes.js
import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { sendRequest, listRequests, actOnRequest, listFriends } from '../controllers/friendController.js';

const router = Router();

router.post('/request', auth, sendRequest);
router.get('/requests', auth, listRequests);
router.post('/request/action', auth, actOnRequest);
router.get('/list', auth, listFriends);

export default router;
