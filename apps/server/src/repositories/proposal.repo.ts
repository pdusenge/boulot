import { ProposalModel, IProposalDocument } from '../models/Proposal';
import { ProposalStatus } from '@boulot/types';

export class ProposalRepository {
  async findById(id: string): Promise<IProposalDocument | null> {
    return ProposalModel.findById(id).exec();
  }

  async findByProjectAndStudent(projectId: string, studentId: string): Promise<IProposalDocument | null> {
    return ProposalModel.findOne({ projectId, studentId }).exec();
  }

  async findByProject(projectId: string): Promise<IProposalDocument[]> {
    return ProposalModel.find({ projectId })
      .populate('studentId', 'firstName lastName skills bio githubUsername role isVerified')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStudent(studentId: string): Promise<IProposalDocument[]> {
    return ProposalModel.find({ studentId })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(data: Partial<IProposalDocument>): Promise<IProposalDocument> {
    const proposal = new ProposalModel(data);
    return proposal.save();
  }

  async updateStatus(id: string, status: ProposalStatus): Promise<IProposalDocument | null> {
    return ProposalModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
}
