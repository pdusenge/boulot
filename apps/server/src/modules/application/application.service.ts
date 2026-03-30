import { ApplicationRepository } from '../../repositories/application.repo';
import { ProjectRepository } from '../../repositories/project.repo';
import { PortfolioRepository } from '../../repositories/portfolio.repo';
import { UserRepository } from '../../repositories/user.repo';
import { ApplicationStatus, ProjectStatus } from '@boulot/types';
import type { IApplicationDocument } from '../../models/Application';
import {
  computeApplicationScore,
  computeAverageRating,
  computeProposalQualityScore,
  computeSkillMatchScore,
} from '../../utils/applicationScoring';

const MAX_APPLICATIONS_PER_STUDENT_PER_DAY = 5;
const MAX_APPLICATIONS_PER_PROJECT = 15;

export class ApplicationService {
  private applicationRepo: ApplicationRepository;
  private projectRepo: ProjectRepository;
  private portfolioRepo: PortfolioRepository;
  private userRepo: UserRepository;

  constructor(deps?: {
    applicationRepo?: ApplicationRepository;
    projectRepo?: ProjectRepository;
    portfolioRepo?: PortfolioRepository;
    userRepo?: UserRepository;
  }) {
    this.applicationRepo = deps?.applicationRepo || new ApplicationRepository();
    this.projectRepo = deps?.projectRepo || new ProjectRepository();
    this.portfolioRepo = deps?.portfolioRepo || new PortfolioRepository();
    this.userRepo = deps?.userRepo || new UserRepository();
  }

  async getStudentDailyStats(studentId: string): Promise<{ todayCount: number; remainingToday: number; dailyLimit: number }> {
    const start = startOfDay(new Date());
    const todayCount = await this.applicationRepo.countByStudentSince(studentId, start);
    return {
      todayCount,
      remainingToday: Math.max(0, MAX_APPLICATIONS_PER_STUDENT_PER_DAY - todayCount),
      dailyLimit: MAX_APPLICATIONS_PER_STUDENT_PER_DAY,
    };
  }

  async submitApplication(studentId: string, data: any): Promise<IApplicationDocument> {
    const project = await this.projectRepo.findById(data.projectId);
    if (!project) throw new Error('Project not found');

    if (project.status !== ProjectStatus.OPEN || project.assignedStudentId) {
      throw new Error('Project is not open for applications');
    }

    if ((project as any).applicationDeadline) {
      const deadline = new Date((project as any).applicationDeadline);
      if (Number.isFinite(deadline.getTime()) && Date.now() > deadline.getTime()) {
        throw new Error('Application deadline has passed');
      }
    }

    // Duplicate prevention (fast path)
    const existing = await this.applicationRepo.findByProjectAndStudent(String(project._id), studentId);
    if (existing) throw new Error('You have already applied to this project');

    // Constraints
    const user = await this.userRepo.findById(studentId);
    if (!user) throw new Error('Student not found');
    if (!user.githubUsername) {
      throw new Error('GitHub must be connected before applying');
    }

    const portfolio = await this.portfolioRepo.findByStudent(studentId);
    const totalCompleted = portfolio?.totalCompleted || 0;
    const isTemplateProject = !!(project as any).templateId;
    if (!isTemplateProject && totalCompleted < 1) {
      throw new Error(
        'You must complete at least 1 template project before applying to custom projects'
      );
    }

    const start = startOfDay(new Date());
    const todayCount = await this.applicationRepo.countByStudentSince(studentId, start);
    if (todayCount >= MAX_APPLICATIONS_PER_STUDENT_PER_DAY) {
      throw new Error(`Daily limit reached: max ${MAX_APPLICATIONS_PER_STUDENT_PER_DAY} applications per day`);
    }

    const projectCount = await this.applicationRepo.countByProject(String(project._id));
    if (projectCount >= MAX_APPLICATIONS_PER_PROJECT) {
      throw new Error(`This project has reached the maximum of ${MAX_APPLICATIONS_PER_PROJECT} applications`);
    }

    // Scoring
    const completionRate = portfolio?.completionRate || 0;
    const skillMatch = computeSkillMatchScore(project as any, portfolio as any);
    const avgRating = computeAverageRating(portfolio as any);
    const proposalQuality = computeProposalQualityScore(data.proposalText, data.githubLinks || []);

    const score = computeApplicationScore({
      completionRate,
      skillMatch,
      pastRatings: avgRating,
      proposalQuality,
    });

    try {
      return await this.applicationRepo.create({
        projectId: String(project._id),
        studentId,
        timeline: data.timeline,
        proposalText: data.proposalText,
        githubLinks: data.githubLinks || [],
        score,
        status: ApplicationStatus.PENDING,
      });
    } catch (error: any) {
      if (error?.code === 11000) throw new Error('You have already applied to this project');
      throw error;
    }
  }

  async getMyApplicationForProject(studentId: string, projectId: string): Promise<IApplicationDocument | null> {
    return this.applicationRepo.findByProjectAndStudent(projectId, studentId);
  }

  async listProjectApplications(args: {
    smeId: string;
    projectId: string;
    page: number;
    limit: number;
  }): Promise<{ items: any[]; page: number; limit: number }> {
    const project = await this.projectRepo.findById(args.projectId);
    if (!project) throw new Error('Project not found');
    if (String((project as any).smeId?._id || project.smeId) !== args.smeId) {
      throw new Error('Not authorized to view applications for this project');
    }

    const page = Math.max(1, Math.floor(args.page || 1));
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit || 20)));
    const skip = (page - 1) * limit;

    const apps = await this.applicationRepo.listByProject(args.projectId, skip, limit);

    // Fetch portfolio summaries in bulk (small payload)
    const studentIds = apps.map((a) => {
      const s: any = (a as any).studentId;
      return typeof s === 'string' ? s : String(s?._id || s);
    });
    const portfolios = await this.portfolioRepo.findManyByStudentIds(studentIds);
    const portfolioByStudent = new Map(portfolios.map((p: any) => [String(p.studentId), p]));

    const withLabels = apps.map((a, idx) => {
      const stu: any = (a as any).studentId;
      const studentId = typeof stu === 'string' ? stu : String(stu?._id || stu);
      const portfolio = portfolioByStudent.get(studentId);
      const totalCompleted = portfolio?.totalCompleted || 0;
      const avgRating = portfolio ? computeAverageRating(portfolio) : 0;
      const completionRate = portfolio?.completionRate ?? 0;

      const label =
        idx < 2 ? 'Top Match' :
        idx < 7 ? 'Recommended' :
        totalCompleted <= 1 ? 'New Talent' :
        undefined;

      return {
        ...a.toObject(),
        label,
        studentSummary: {
          completionRate,
          totalCompleted,
          avgRating: Math.round(avgRating * 100) / 100,
          skillBadges: portfolio?.skillBadges?.slice(0, 8) || [],
        },
      };
    });

    return { items: withLabels, page, limit };
  }

  async updateStatus(args: { smeId: string; applicationId: string; status: ApplicationStatus }): Promise<IApplicationDocument> {
    const app = await this.applicationRepo.findById(args.applicationId);
    if (!app) throw new Error('Application not found');

    const project = await this.projectRepo.findById(app.projectId);
    if (!project) throw new Error('Project not found');
    if (String((project as any).smeId?._id || project.smeId) !== args.smeId) {
      throw new Error('Not authorized to update this application');
    }

    if (args.status === ApplicationStatus.ACCEPTED) {
      if (project.status !== ProjectStatus.OPEN || project.assignedStudentId) {
        throw new Error('Project is not open for accepting applications');
      }
      const updated = await this.applicationRepo.updateStatus(args.applicationId, ApplicationStatus.ACCEPTED);
      if (!updated) throw new Error('Failed to update application');

      await this.applicationRepo.bulkRejectProjectApplicants(String(project._id), args.applicationId);

      project.assignedStudentId = app.studentId;
      await project.save();

      return updated;
    }

    const updated = await this.applicationRepo.updateStatus(args.applicationId, args.status);
    if (!updated) throw new Error('Failed to update application');
    return updated;
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

