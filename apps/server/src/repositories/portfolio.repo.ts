import { PortfolioModel, IPortfolioDocument } from '../models/Portfolio';
import { StudentTier } from '@boulot/types';

export class PortfolioRepository {
  async findByStudent(studentId: string): Promise<IPortfolioDocument | null> {
    return PortfolioModel.findOne({ studentId });
  }

  async findManyByStudentIds(studentIds: string[]): Promise<IPortfolioDocument[]> {
    const ids = (studentIds || []).filter(Boolean);
    if (ids.length === 0) return [];
    return PortfolioModel.find({ studentId: { $in: ids } }).exec();
  }

  async createOrUpdate(studentId: string, data: Partial<IPortfolioDocument>): Promise<IPortfolioDocument> {
    return PortfolioModel.findOneAndUpdate(
      { studentId },
      { $set: data, $setOnInsert: { studentId } },
      { new: true, upsert: true }
    );
  }

  async addCompletedProject(
    studentId: string,
    project: { projectId: string; title: string; completedAt: Date }
  ): Promise<IPortfolioDocument | null> {
    const portfolio = await this.findByStudent(studentId);
    
    if (!portfolio) {
      // Create new portfolio with the first completed project
      return PortfolioModel.create({
        studentId,
        completedProjects: [project],
        totalProjects: 1,
        totalCompleted: 1,
        completionRate: 100,
        tier: StudentTier.APPRENTICE,
      });
    }

    portfolio.completedProjects.push(project as any);
    portfolio.totalCompleted += 1;
    portfolio.completionRate = Math.round((portfolio.totalCompleted / portfolio.totalProjects) * 100);

    // Update tier based on completed projects
    if (portfolio.totalCompleted >= 10) {
      portfolio.tier = StudentTier.PRO;
    } else if (portfolio.totalCompleted >= 5) {
      portfolio.tier = StudentTier.INTERMEDIATE;
    }

    return portfolio.save();
  }

  async incrementTotalProjects(studentId: string): Promise<void> {
    await PortfolioModel.findOneAndUpdate(
      { studentId },
      { $inc: { totalProjects: 1 } },
      { upsert: true }
    );
  }

  async searchStudents(filters: {
    skill?: string;
    tier?: StudentTier;
    minCompletionRate?: number;
  }): Promise<IPortfolioDocument[]> {
    const query: any = {};
    if (filters.skill) {
      query['skillBadges.skill'] = { $regex: filters.skill, $options: 'i' };
    }
    if (filters.tier) {
      query.tier = filters.tier;
    }
    if (filters.minCompletionRate) {
      query.completionRate = { $gte: filters.minCompletionRate };
    }
    return PortfolioModel.find(query).sort({ completionRate: -1, totalCompleted: -1 });
  }
}
