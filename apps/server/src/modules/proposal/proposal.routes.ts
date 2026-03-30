import { Router } from 'express';
import { submitProposal, getProjectProposals, getMyProposals, acceptProposal } from './proposal.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { submitProposalSchema } from '@boulot/utils';
import { UserRole } from '@boulot/types';

const router = Router();

// Student Only
router.post(
  '/',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  validate(submitProposalSchema),
  submitProposal
);

router.get(
  '/student/my-proposals',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  getMyProposals
);

// SME Only
router.get(
  '/project/:projectId',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  getProjectProposals
);

router.post(
  '/:id/accept',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  acceptProposal
);

export default router;
