import { Router } from 'express';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { submitApplicationSchema } from '@boulot/utils';
import { UserRole } from '@boulot/types';
import { getMyApplicationForProject, getStudentStats, submitApplication, updateApplicationStatus } from './application.controller';

const router = Router();

// Student: create application
router.post(
  '/',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  validate(submitApplicationSchema),
  submitApplication
);

// Student: stats (remaining today)
router.get(
  '/student/stats',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  getStudentStats
);

// Student: check if already applied to a project
router.get(
  '/student/project/:projectId',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  getMyApplicationForProject
);

// SME: update status
router.patch(
  '/:id/status',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  updateApplicationStatus
);

export default router;

