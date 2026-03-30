import { ApplicationModel, IApplicationDocument } from '../models/Application';
import { ApplicationStatus } from '@boulot/types';

export class ApplicationRepository {
  async findById(id: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findById(id).exec();
  }

  async findByProjectAndStudent(projectId: string, studentId: string): Promise<IApplicationDocument | null> {
    return ApplicationModel.findOne({ projectId, studentId }).exec();
  }

  async countByStudentSince(studentId: string, since: Date): Promise<number> {
    return ApplicationModel.countDocuments({ studentId, createdAt: { $gte: since } }).exec();
  }

  async countByProject(projectId: string): Promise<number> {
    return ApplicationModel.countDocuments({ projectId }).exec();
  }

  async create(data: Partial<IApplicationDocument>): Promise<IApplicationDocument> {
    const application = new ApplicationModel(data);
    return application.save();
  }

  async listByProject(
    projectId: string,
    skip: number,
    limit: number
  ): Promise<IApplicationDocument[]> {
    return ApplicationModel.find({ projectId })
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'firstName lastName skills bio githubUsername role isVerified')
      .exec();
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<IApplicationDocument | null> {
    return ApplicationModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async bulkRejectProjectApplicants(projectId: string, acceptedId: string): Promise<void> {
    await ApplicationModel.updateMany(
      {
        projectId,
        _id: { $ne: acceptedId },
        status: { $in: [ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED] },
      },
      { status: ApplicationStatus.REJECTED }
    ).exec();
  }
}

