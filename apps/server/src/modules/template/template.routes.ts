import { Router } from 'express';
import { createTemplate, deleteTemplate, getTemplate, listTemplates, updateTemplate } from './template.controller';
import { authenticate, authorizeRole } from '../../middleware/auth.middleware';
import { UserRole } from '@boulot/types';
import { validate } from '../../middleware/validate.middleware';
import { createTemplateSchema, updateTemplateSchema } from '@boulot/utils';

const router = Router();

// Public routes — templates are viewable by everyone
router.get('/', listTemplates);
router.get('/:id', getTemplate);

// Admin-only template management
router.post('/', authenticate, authorizeRole([UserRole.ADMIN]), validate(createTemplateSchema), createTemplate);
router.patch('/:id', authenticate, authorizeRole([UserRole.ADMIN]), validate(updateTemplateSchema), updateTemplate);
router.delete('/:id', authenticate, authorizeRole([UserRole.ADMIN]), deleteTemplate);

export default router;
