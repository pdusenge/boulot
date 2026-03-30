import { Router } from 'express';
import { authenticate, authorizeRole } from '../../middleware/auth.middleware';
import { UserRole } from '@boulot/types';
import { listUsers, updateUserRole, getAuditLogs } from './admin.controller';

const router = Router();

router.get('/users', authenticate, authorizeRole([UserRole.ADMIN]), listUsers);
router.patch('/users/:id/role', authenticate, authorizeRole([UserRole.ADMIN]), updateUserRole);
router.get('/audit-logs', authenticate, authorizeRole([UserRole.ADMIN]), getAuditLogs);

export default router;

