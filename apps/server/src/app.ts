import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/project/project.routes';
import proposalRoutes from './modules/proposal/proposal.routes';
import escrowRoutes from './modules/escrow/escrow.routes';
import messageRoutes from './modules/message/message.routes';
import templateRoutes from './modules/template/template.routes';
import disputeRoutes from './modules/dispute/dispute.routes';
import portfolioRoutes from './modules/portfolio/portfolio.routes';
import webhookRoutes from './modules/webhook/webhook.routes';
import adminRoutes from './modules/admin/admin.routes';
import applicationRoutes from './modules/application/application.routes';

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    })
  );

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/proposals', proposalRoutes);
  app.use('/api/escrow', escrowRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/templates', templateRoutes);
  app.use('/api/disputes', disputeRoutes);
  app.use('/api/portfolios', portfolioRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/applications', applicationRoutes);

  app.use(errorHandler);

  return app;
}

