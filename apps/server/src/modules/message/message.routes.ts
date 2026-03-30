import { Router } from 'express';
import { sendMessage, getProjectMessages, markAsRead, getUnreadCount, getProjectParticipants } from './message.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, requireVerifiedUser } from '../../middleware/auth.middleware';
import { sendMessageSchema } from '@boulot/utils';

const router = Router();

// All messaging routes require authentication
router.post('/', authenticate, requireVerifiedUser, validate(sendMessageSchema), sendMessage);
router.get('/unread', authenticate, requireVerifiedUser, getUnreadCount);
router.get('/project/:projectId', authenticate, requireVerifiedUser, getProjectMessages);
router.get('/project/:projectId/participants', authenticate, requireVerifiedUser, getProjectParticipants);
router.patch('/:id/read', authenticate, requireVerifiedUser, markAsRead);

export default router;
