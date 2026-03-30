import { Router } from 'express';
import { 
  getMyPortfolio, 
  getPublicProfile, 
  searchStudents 
} from './portfolio.controller';
import { authenticate, authorizeRole, requireVerifiedUser } from '../../middleware/auth.middleware';
import { UserRole } from '@boulot/types';

const router = Router();

// Publicly searchable profiles
router.get('/search', searchStudents);
router.get('/public/:studentId', getPublicProfile);

// Get own portfolio (Student Only)
router.get(
  '/me',
  authenticate,
  requireVerifiedUser,
  authorizeRole([UserRole.STUDENT]),
  getMyPortfolio
);

export default router;
