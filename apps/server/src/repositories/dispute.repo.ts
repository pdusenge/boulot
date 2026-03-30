import { DisputeModel, IDisputeDocument } from '../models/Dispute';
import { DisputeStatus } from '@boulot/types';

export class DisputeRepository {
  async create(data: Partial<IDisputeDocument>): Promise<IDisputeDocument> {
    return DisputeModel.create(data);
  }

  async findByProject(projectId: string): Promise<IDisputeDocument[]> {
    return DisputeModel.find({ projectId }).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IDisputeDocument | null> {
    return DisputeModel.findById(id);
  }

  async findOpen(): Promise<IDisputeDocument[]> {
    return DisputeModel.find({ status: DisputeStatus.OPEN }).sort({ createdAt: -1 });
  }

  async resolve(id: string, resolvedBy: string, resolution: string): Promise<IDisputeDocument | null> {
    return DisputeModel.findByIdAndUpdate(
      id,
      { status: DisputeStatus.RESOLVED, resolvedBy, resolution },
      { new: true }
    );
  }
}
