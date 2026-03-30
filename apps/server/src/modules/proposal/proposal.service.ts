import { ProposalRepository } from '../../repositories/proposal.repo';
import { ProjectRepository } from '../../repositories/project.repo';
import { PortfolioRepository } from '../../repositories/portfolio.repo';
import { IProposalDocument } from '../../models/Proposal';
import { ProposalStatus, ProjectStatus } from '@boulot/types';

export class ProposalService {
  private proposalRepo: ProposalRepository;
  private projectRepo: ProjectRepository;
  private portfolioRepo: PortfolioRepository;

  constructor() {
    this.proposalRepo = new ProposalRepository();
    this.projectRepo = new ProjectRepository();
    this.portfolioRepo = new PortfolioRepository();
  }

  async submitProposal(studentId: string, data: any): Promise<IProposalDocument> {
    const project = await this.projectRepo.findById(data.projectId);
    if (!project) throw new Error('Project not found');
    if (project.status !== ProjectStatus.OPEN) {
      throw new Error('Project is not open for proposals');
    }

    // NFR 2: No-experience students restricted to template-based projects only
    if (!project.templateId) {
      const portfolio = await this.portfolioRepo.findByStudent(studentId);
      if (!portfolio || portfolio.totalCompleted === 0) {
        throw new Error('Students with no completed projects can only apply to template-based projects. Complete a template project first to unlock custom projects.');
      }
    }

    // Check if student already submitted a proposal (do not rely on populated fields)
    const existing = await this.proposalRepo.findByProjectAndStudent(data.projectId, studentId);
    if (existing) {
      throw new Error('You have already submitted a proposal for this project');
    }

    try {
      return this.proposalRepo.create({
        ...data,
        studentId,
        status: ProposalStatus.PENDING,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new Error('You have already submitted a proposal for this project');
      }
      throw error;
    }
  }

  async getProjectProposals(projectId: string): Promise<IProposalDocument[]> {
    return this.proposalRepo.findByProject(projectId);
  }

  async getMyProposals(studentId: string): Promise<IProposalDocument[]> {
    return this.proposalRepo.findByStudent(studentId);
  }

  async acceptProposal(smeId: string, proposalId: string): Promise<IProposalDocument> {
    const proposal = await this.proposalRepo.findById(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    const project = await this.projectRepo.findById(proposal.projectId);
    if (!project) throw new Error('Project not found');

    if (project.smeId.toString() !== smeId) {
      throw new Error('Not authorized to accept this proposal');
    }
    if (project.status !== ProjectStatus.OPEN) {
      throw new Error('Project is no longer open for proposals');
    }

    const updatedProposal = await this.proposalRepo.updateStatus(proposalId, ProposalStatus.ACCEPTED);
    
    if (updatedProposal) {
      // Reject all other proposals for this project
      const allProposals = await this.proposalRepo.findByProject(proposal.projectId);
      for (const p of allProposals) {
        if (p._id.toString() !== proposalId && p.status === ProposalStatus.PENDING) {
          await this.proposalRepo.updateStatus(p._id.toString(), ProposalStatus.REJECTED);
        }
      }

      // We assign the student to the project, but we DO NOT start the project yet.
      // The project is marked as IN_PROGRESS and GitHub repo is provisioned 
      // ONLY AFTER the SME deposits funds into the escrow.
      project.assignedStudentId = proposal.studentId;
      await project.save();
    }

    return updatedProposal as IProposalDocument;
  }
}
