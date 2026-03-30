import { ProjectRepository } from '../../repositories/project.repo';
import { IProjectDocument } from '../../models/Project';
import { ProjectStatus } from '@boulot/types';
import { GitHubService } from '../../services/github.service';
import { EscrowService } from '../escrow/escrow.service';
import { PortfolioRepository } from '../../repositories/portfolio.repo';
import { UserRepository } from '../../repositories/user.repo';
import { UserRole } from '@boulot/types';
import { emitToUser } from '../../services/socket.service';

export class ProjectService {
  private projectRepo: ProjectRepository;
  private githubService: GitHubService;
  private escrowService: EscrowService;
  private portfolioRepo: PortfolioRepository;
  private userRepo: UserRepository;

  constructor() {
    this.projectRepo = new ProjectRepository();
    this.githubService = new GitHubService();
    this.escrowService = new EscrowService();
    this.portfolioRepo = new PortfolioRepository();
    this.userRepo = new UserRepository();
  }

  async createProject(smeId: string, data: any): Promise<IProjectDocument> {
    const mentorId = await this.autoAssignMentor();
    return this.projectRepo.create({
      ...data,
      smeId,
      mentorId,
      status: ProjectStatus.OPEN,
    });
  }

  private async autoAssignMentor(): Promise<string | undefined> {
    const mentors = await this.userRepo.findByRole(UserRole.MENTOR);
    if (mentors.length === 0) return undefined;

    const activeStatuses = [ProjectStatus.OPEN, ProjectStatus.IN_PROGRESS, ProjectStatus.IN_REVIEW];
    let bestMentor = mentors[0];
    let lowestCount = Infinity;

    for (const mentor of mentors) {
      const count = await this.projectRepo.countByMentor(String(mentor._id), activeStatuses);
      if (count < lowestCount) {
        lowestCount = count;
        bestMentor = mentor;
      }
    }

    return String(bestMentor._id);
  }

  async assignMentor(projectId: string, mentorId: string): Promise<IProjectDocument | null> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    const mentor = await this.userRepo.findById(mentorId);
    if (!mentor || mentor.role !== UserRole.MENTOR) throw new Error('Invalid mentor');

    project.mentorId = mentorId as any;
    return project.save();
  }

  async getActiveProjects(): Promise<IProjectDocument[]> {
    return this.projectRepo.findAllActive();
  }

  async getProjectById(id: string): Promise<IProjectDocument | null> {
    return this.projectRepo.findById(id);
  }

  async getProjectsBySme(smeId: string): Promise<IProjectDocument[]> {
    return this.projectRepo.findBySme(smeId);
  }

  async getProjectsForUser(userId: string, role: UserRole): Promise<IProjectDocument[]> {
    if (role === UserRole.SME) {
      return this.projectRepo.findBySme(userId);
    }
    if (role === UserRole.STUDENT) {
      return this.projectRepo.findByAssignedStudent(userId);
    }
    if (role === UserRole.MENTOR || role === UserRole.ADMIN) {
      return this.projectRepo.findByStatuses([ProjectStatus.IN_REVIEW, ProjectStatus.IN_PROGRESS]);
    }
    return [];
  }

  async getReviewQueue(): Promise<IProjectDocument[]> {
    return this.projectRepo.findByStatus(ProjectStatus.IN_REVIEW);
  }

  async getProjectsWithoutMentor(): Promise<IProjectDocument[]> {
    return this.projectRepo.findWithoutMentor();
  }

  async getProjectsByMentor(mentorId: string): Promise<IProjectDocument[]> {
    return this.projectRepo.findByMentor(mentorId);
  }

  async getAllProjects(): Promise<IProjectDocument[]> {
    return this.projectRepo.findAll();
  }

  async startProject(projectId: string, studentId: string, studentUsername: string): Promise<IProjectDocument | null> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    if (project.status !== ProjectStatus.OPEN) {
      throw new Error('Project is not open for proposals');
    }

    // Build collaborators list: student (push), SME (pull), mentor (pull)
    const collaborators: { username: string; permission: 'push' | 'pull' | 'admin' }[] = [
      { username: studentUsername, permission: 'push' },
    ];

    // Look up SME's GitHub username
    const smeId = typeof project.smeId === 'object' ? String((project.smeId as any)._id) : String(project.smeId);
    const sme = await this.userRepo.findById(smeId);
    if (sme?.githubUsername) {
      collaborators.push({ username: sme.githubUsername, permission: 'pull' });
    }

    // Look up Mentor's GitHub username
    if (project.mentorId) {
      const mentorIdStr = typeof project.mentorId === 'object' ? String((project.mentorId as any)._id) : String(project.mentorId);
      const mentor = await this.userRepo.findById(mentorIdStr);
      if (mentor?.githubUsername) {
        collaborators.push({ username: mentor.githubUsername, permission: 'pull' });
      }
    }

    // Provision GitHub Repo with all collaborators
    const repoUrl = await this.githubService.provisionRepository(project.title, collaborators);
    await this.githubService.setupWebhook(repoUrl);

    // Update project
    project.status = ProjectStatus.IN_PROGRESS;
    project.assignedStudentId = studentId;
    project.repositoryUrl = repoUrl;

    return project.save();
  }

  async submitForReview(projectId: string, studentId: string): Promise<IProjectDocument | null> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.assignedStudentId?.toString() !== studentId) throw new Error('Not authorized to submit this project');
    if (project.status !== ProjectStatus.IN_PROGRESS) throw new Error('Project must be in progress to submit for review');

    project.status = ProjectStatus.IN_REVIEW;
    return project.save();
  }

  async approveProject(projectId: string, mentorId: string, feedback: string): Promise<IProjectDocument | null> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.status !== ProjectStatus.IN_REVIEW) throw new Error('Project is not under review');

    // Release Escrow
    const student = await this.userRepo.findById(project.assignedStudentId!);
    try {
      await this.escrowService.releaseFunds(projectId, student?.phone || '+250788000000');
    } catch (error: any) {
      console.error('Escrow release failed during approval:', error.message);
      // We might choose to proceed or throw depending on exact requirements. Throwing for safety.
      throw new Error(`Failed to release escrow: ${error.message}`);
    }

    project.status = ProjectStatus.COMPLETED;

    // Notify both SME and student about payment release (FR 11.2)
    const smeId2 = typeof project.smeId === 'object' ? String((project.smeId as any)._id) : String(project.smeId);
    emitToUser(smeId2, 'payment:released', { projectId, amount: project.budget });
    emitToUser(String(project.assignedStudentId), 'payment:released', { projectId, amount: project.budget });

    // Update Student Portfolio
    await this.portfolioRepo.addCompletedProject(project.assignedStudentId!, {
      projectId: String(project._id),
      title: project.title,
      completedAt: new Date(),
    });

    return project.save();
  }

  async rejectProject(projectId: string, mentorId: string, feedback: string): Promise<IProjectDocument | null> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');
    if (project.status !== ProjectStatus.IN_REVIEW) throw new Error('Project is not under review');

    project.status = ProjectStatus.IN_PROGRESS;
    // Note: Feedback could be saved via MessageService to the project chat
    return project.save();
  }
}
