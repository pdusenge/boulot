import { Router } from 'express';
import { 
  createDispute, 
  getProjectDisputes, 
  getOpenDisputes, 
  resolveDispute 
} from './dispute.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { createDisputeSchema, resolveDisputeSchema } from '@boulot/utils';
import { UserRole } from '@boulot/types';

const router = Router();

// Create dispute (SME or Student)
router.post(
  '/',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME, UserRole.STUDENT]),
  validate(createDisputeSchema),
  createDispute
);

// Get disputes for a specific project
router.get(
  '/project/:projectId',
  authenticate,
  requireVerifiedUser,
  getProjectDisputes
);

// Get all open disputes (Mentor / Admin)
router.get(
  '/open',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  getOpenDisputes
);

// Resolve dispute (Mentor / Admin)
router.post(
  '/:id/resolve',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  validate(resolveDisputeSchema),
  resolveDispute
);

export default router;
