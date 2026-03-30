import { DisputeRepository } from '../../repositories/dispute.repo';
import { ProjectRepository } from '../../repositories/project.repo';
import { IDisputeDocument } from '../../models/Dispute';
import { DisputeStatus, ProjectStatus } from '@boulot/types';
import { EscrowService } from '../escrow/escrow.service';
import { UserRepository } from '../../repositories/user.repo';

export class DisputeService {
  private disputeRepo: DisputeRepository;
  private projectRepo: ProjectRepository;
  private escrowService: EscrowService;
  private userRepo: UserRepository;

  constructor() {
    this.disputeRepo = new DisputeRepository();
    this.projectRepo = new ProjectRepository();
    this.escrowService = new EscrowService();
    this.userRepo = new UserRepository();
  }

  async raiseDispute(projectId: string, raisedBy: string, reason: string): Promise<IDisputeDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');
    
    // Only SME or Student can raise a dispute
    if (project.smeId.toString() !== raisedBy && project.assignedStudentId?.toString() !== raisedBy) {
      throw new Error('Not authorized to raise dispute for this project');
    }

    // Usually raised during IN_PROGRESS or IN_REVIEW
    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
      throw new Error('Cannot raise dispute for a completed or cancelled project');
    }

    // Check if open dispute already exists
    const existing = await this.disputeRepo.findByProject(projectId);
    if (existing.some(d => d.status === DisputeStatus.OPEN)) {
      throw new Error('An open dispute already exists for this project');
    }

    return this.disputeRepo.create({
      projectId,
      raisedBy,
      reason,
      status: DisputeStatus.OPEN,
    });
  }

  async resolveDispute(
    disputeId: string, 
    mentorId: string, 
    resolution: string,
    action: 'refund' | 'release' | 'continue'
  ): Promise<IDisputeDocument> {
    const dispute = await this.disputeRepo.findById(disputeId);
    if (!dispute) throw new Error('Dispute not found');
    if (dispute.status !== DisputeStatus.OPEN) throw new Error('Dispute is already resolved');

    const project = await this.projectRepo.findById(dispute.projectId);
    if (!project) throw new Error('Project not found');

    if (action === 'refund') {
      const sme = await this.userRepo.findById(project.smeId);
      await this.escrowService.refundFunds(dispute.projectId, sme?.phone || '+250788000000');
      project.status = ProjectStatus.CANCELLED;
      await project.save();
    } else if (action === 'release') {
      const student = await this.userRepo.findById(project.assignedStudentId!);
      await this.escrowService.releaseFunds(dispute.projectId, student?.phone || '+250788000000');
      project.status = ProjectStatus.COMPLETED;
      await project.save();
    }

    const resolved = await this.disputeRepo.resolve(disputeId, mentorId, resolution);
    return resolved!;
  }

  async getProjectDisputes(projectId: string): Promise<IDisputeDocument[]> {
    return this.disputeRepo.findByProject(projectId);
  }

  async getOpenDisputes(): Promise<IDisputeDocument[]> {
    return this.disputeRepo.findOpen();
  }
}
