import { Router } from 'express';
import {
  createProject,
  getActiveProjects,
  getProjectDetails,
  getMyProjects,
  getReviewQueue,
  getMyWorkProjects,
  getMentorProjects,
  getAllProjects,
  submitForReview,
  approveProject,
  rejectProject,
  assignMentor,
  getProjectsWithoutMentor,
  getProjectApplications
} from './project.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { createProjectSchema, reviewProjectSchema } from '@boulot/utils';
import { UserRole } from '@boulot/types';

const router = Router();

// Public 
router.get('/', getActiveProjects);

// SME Only
router.post(
  '/',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  validate(createProjectSchema),
  createProject
);

// Authenticated (role-based behavior in handler)
router.get(
  '/me',
  authenticate,
  requireVerifiedUser,
  getMyWorkProjects
);

router.get(
  '/sme/my-projects',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  getMyProjects
);

router.get(
  '/review-queue',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  getReviewQueue
);

router.get(
  '/mentor/my-projects',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR]),
  getMentorProjects
);

router.get(
  '/admin/all',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.ADMIN]),
  getAllProjects
);

router.get(
  '/unassigned',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.ADMIN]),
  getProjectsWithoutMentor
);

// SME: ranked applications for a project
router.get(
  '/:id/applications',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.SME]),
  getProjectApplications
);

// Must be after named routes like /me, /review-queue, etc.
router.get('/:id', getProjectDetails);

// Student Only
router.post(
  '/:id/submit-review',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  submitForReview
);

// Mentor Only
router.post(
  '/:id/approve',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  validate(reviewProjectSchema),
  approveProject
);

// Admin assigns mentor
router.patch(
  '/:id/assign-mentor',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.ADMIN]),
  assignMentor
);

router.post(
  '/:id/reject',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.MENTOR, UserRole.ADMIN]),
  validate(reviewProjectSchema),
  rejectProject
);

export default router;
