import { Router } from 'express';
import { register, login, me, verifyId, updateProfile } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema, verifyIdSchema, updateProfileSchema } from '@boulot/utils';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, validate(updateProfileSchema), updateProfile);

// ID Verification (FR 1)
router.post('/verify-id', authenticate, validate(verifyIdSchema), verifyId);

export default router;
