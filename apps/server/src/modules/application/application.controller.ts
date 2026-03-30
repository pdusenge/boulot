import { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { ApplicationStatus } from '@boulot/types';

const applicationService = new ApplicationService();

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const app = await applicationService.submitApplication(studentId, req.body);
    res.status(201).json({ success: true, data: app });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStudentStats = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const stats = await applicationService.getStudentDailyStats(studentId);
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getMyApplicationForProject = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const projectId = req.params.projectId;
    const app = await applicationService.getMyApplicationForProject(studentId, projectId);
    res.status(200).json({ success: true, data: app });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const smeId = req.user!.userId;
    const status = String(req.body?.status || '').toUpperCase() as ApplicationStatus;
    if (!Object.values(ApplicationStatus).includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const updated = await applicationService.updateStatus({ smeId, applicationId: req.params.id, status });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

