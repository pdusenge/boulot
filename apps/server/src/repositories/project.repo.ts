import { ProjectModel, IProjectDocument } from '../models/Project';
import { ProjectStatus } from '@boulot/types';

export class ProjectRepository {
  async findById(id: string): Promise<IProjectDocument | null> {
    return ProjectModel.findById(id)
      .populate('smeId', 'firstName lastName email githubUsername')
      .populate('mentorId', 'firstName lastName email githubUsername')
      .populate('assignedStudentId', 'firstName lastName email githubUsername')
      .exec();
  }

  async findAllActive(): Promise<IProjectDocument[]> {
    return ProjectModel.find({ status: ProjectStatus.OPEN })
      .populate('smeId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findBySme(smeId: string): Promise<IProjectDocument[]> {
    return ProjectModel.find({ smeId }).sort({ createdAt: -1 }).exec();
  }

  async findByAssignedStudent(studentId: string): Promise<IProjectDocument[]> {
    return ProjectModel.find({ assignedStudentId: studentId }).sort({ updatedAt: -1 }).exec();
  }

  async create(data: Partial<IProjectDocument>): Promise<IProjectDocument> {
    const project = new ProjectModel(data);
    return project.save();
  }

  async updateStatus(id: string, status: ProjectStatus): Promise<IProjectDocument | null> {
    return ProjectModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async findByStatus(status: ProjectStatus): Promise<IProjectDocument[]> {
    return ProjectModel.find({ status }).sort({ updatedAt: -1 }).exec();
  }

  async findByStatuses(statuses: ProjectStatus[]): Promise<IProjectDocument[]> {
    return ProjectModel.find({ status: { $in: statuses } }).sort({ updatedAt: -1 }).exec();
  }

  async countByMentor(mentorId: string, statuses: ProjectStatus[]): Promise<number> {
    return ProjectModel.countDocuments({ mentorId, status: { $in: statuses } }).exec();
  }

  async findWithoutMentor(): Promise<IProjectDocument[]> {
    return ProjectModel.find({ mentorId: { $exists: false } })
      .sort({ createdAt: -1 })
      .populate('smeId', 'firstName lastName')
      .exec();
  }

  async findAll(): Promise<IProjectDocument[]> {
    return ProjectModel.find()
      .sort({ updatedAt: -1 })
      .populate('smeId', 'firstName lastName email')
      .populate('assignedStudentId', 'firstName lastName email githubUsername')
      .populate('mentorId', 'firstName lastName email')
      .exec();
  }

  async findByMentor(mentorId: string): Promise<IProjectDocument[]> {
    return ProjectModel.find({ mentorId })
      .sort({ updatedAt: -1 })
      .populate('smeId', 'firstName lastName email githubUsername')
      .populate('assignedStudentId', 'firstName lastName email githubUsername')
      .populate('mentorId', 'firstName lastName')
      .exec();
  }
}
