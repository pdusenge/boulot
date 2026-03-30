import { Request, Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { StudentTier } from '@boulot/types';

const portfolioService = new PortfolioService();

export const getMyPortfolio = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const portfolio = await portfolioService.getStudentPortfolio(studentId);
    res.status(200).json({ success: true, data: portfolio });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const profile = await portfolioService.getPublicProfile(req.params.studentId);
    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const searchStudents = async (req: Request, res: Response) => {
  try {
    const { skill, tier, minCompletionRate } = req.query;
    const filters = {
      skill: skill as string,
      tier: tier as StudentTier,
      minCompletionRate: minCompletionRate ? Number(minCompletionRate) : undefined,
    };
    const students = await portfolioService.searchStudents(filters);
    res.status(200).json({ success: true, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
