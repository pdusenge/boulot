import { PortfolioRepository } from '../../repositories/portfolio.repo';
import { UserRepository } from '../../repositories/user.repo';
import { IPortfolioDocument } from '../../models/Portfolio';
import { StudentTier } from '@boulot/types';

export class PortfolioService {
  private portfolioRepo: PortfolioRepository;
  private userRepo: UserRepository;

  constructor() {
    this.portfolioRepo = new PortfolioRepository();
    this.userRepo = new UserRepository();
  }

  async getStudentPortfolio(studentId: string): Promise<IPortfolioDocument | null> {
    const portfolio = await this.portfolioRepo.findByStudent(studentId);
    if (!portfolio) {
      // Return a default empty portfolio if none exists yet
      return this.portfolioRepo.createOrUpdate(studentId, {
        totalProjects: 0,
        totalCompleted: 0,
        completionRate: 0,
        tier: StudentTier.APPRENTICE,
        completedProjects: [],
        skillBadges: [],
      });
    }
    return portfolio;
  }

  async getPublicProfile(studentId: string): Promise<any> {
    const user = await this.userRepo.findById(studentId);
    if (!user || user.role !== 'STUDENT') {
      throw new Error('Student not found');
    }

    const portfolio = await this.getStudentPortfolio(studentId);

    // Filter out sensitive data
    return {
      studentInfo: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        skills: user.skills,
        githubUsername: user.githubUsername,
        isVerified: user.isVerified,
      },
      portfolio,
    };
  }

  async searchStudents(filters: { skill?: string; tier?: StudentTier; minCompletionRate?: number }) {
    return this.portfolioRepo.searchStudents(filters);
  }
}
