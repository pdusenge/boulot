import { Router } from 'express';
import { handleGitHubWebhook } from './webhook.controller';

const router = Router();

router.post('/github', handleGitHubWebhook);

export default router;
