import { Router } from 'express';
import { depositFunds, releaseFunds, getEscrowStatus } from './escrow.controller';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { UserRole } from '@boulot/types';

const router = Router();

// SME deposits funds into escrow
router.post(
  '/deposit',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  depositFunds
);

// Release funds (triggered by system after mentor approval, or by admin)
router.post(
  '/:projectId/release',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  releaseFunds
);

// Get escrow status for a project
router.get(
  '/:projectId',
  authenticate,
  requireVerifiedUser,
  getEscrowStatus
);

export default router;
