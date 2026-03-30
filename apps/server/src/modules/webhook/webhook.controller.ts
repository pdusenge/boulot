import { Request, Response } from 'express';
import crypto from 'crypto';
import { ProjectRepository } from '../../repositories/project.repo';
import { emitToProject } from '../../services/socket.service';

const projectRepo = new ProjectRepository();

export const handleGitHubWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-hub-signature-256'] as string;
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).send('Webhook secret not configured');
    }

    if (!signature) {
      return res.status(401).send('Missing signature');
    }

    const rawBody: Buffer | undefined = (req as any).rawBody;
    if (!rawBody) {
      return res.status(400).send('Missing raw body');
    }

    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = Buffer.from('sha256=' + hmac.update(rawBody).digest('hex'));
    const provided = Buffer.from(signature);
    if (provided.length !== digest.length || !crypto.timingSafeEqual(provided, digest)) {
      return res.status(401).send('Signature mismatch');
    }

    const event = req.headers['x-github-event'];
    
    if (event === 'push') {
      const { repository } = req.body;
      const repoUrl = repository?.html_url;

      if (repoUrl) {
        // Find project by repoURL and update last activity
        const projects = await projectRepo.findAllActive(); // Just getting active projects to find our match
        const project = projects.find(p => p.repositoryUrl === repoUrl);
        
        if (project) {
          console.log(`[Webhook] Push received. Updating activity for project ${project._id}`);
          project.lastActivity = new Date();
          await project.save();

          // Real-time update to project participants
          emitToProject(String(project._id), 'activity:updated', {
            projectId: String(project._id),
            lastActivity: project.lastActivity,
            commitMessage: req.body?.head_commit?.message || '',
          });
        }
      }
    }

    // Always respond 200 to GitHub
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
};
