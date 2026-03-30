import { MessageRepository } from '../../repositories/message.repo';
import { ProjectRepository } from '../../repositories/project.repo';
import { IMessageDocument } from '../../models/Message';
import { UserRepository } from '../../repositories/user.repo';
import { UserRole } from '@boulot/types';
import { emitToUser, emitToProject } from '../../services/socket.service';

export class MessageService {
  private messageRepo: MessageRepository;
  private projectRepo: ProjectRepository;
  private userRepo: UserRepository;

  constructor() {
    this.messageRepo = new MessageRepository();
    this.projectRepo = new ProjectRepository();
    this.userRepo = new UserRepository();
  }

  private normalizeId(value: any): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return String(value._id);
    return null;
  }

  async sendMessage(senderId: string, data: { projectId: string; receiverId: string; content: string }): Promise<IMessageDocument> {
    // Verify project exists
    const project = await this.projectRepo.findById(data.projectId);
    if (!project) throw new Error('Project not found');

    const message = await this.messageRepo.create({
      projectId: data.projectId,
      senderId,
      receiverId: data.receiverId,
      content: data.content,
    });

    // Real-time notification to receiver
    emitToUser(data.receiverId, 'message:new', message);
    emitToProject(data.projectId, 'message:project', message);

    return message;
  }

  async getProjectMessages(projectId: string, userId: string): Promise<IMessageDocument[]> {
    // Verify project exists
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    return this.messageRepo.findByProject(projectId);
  }

  async markAsRead(messageId: string, userId: string): Promise<IMessageDocument | null> {
    return this.messageRepo.markAsRead(messageId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepo.getUnreadCount(userId);
  }

  async getProjectParticipants(projectId: string): Promise<Array<{ id: string; fullName: string; role: UserRole | string }>> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    const ids = new Set<string>();
    const smeId = this.normalizeId((project as any).smeId);
    const assignedStudentId = this.normalizeId((project as any).assignedStudentId);
    const mentorId = this.normalizeId((project as any).mentorId);

    if (smeId) ids.add(smeId);
    if (assignedStudentId) ids.add(assignedStudentId);
    if (mentorId) ids.add(mentorId);

    const users = await Promise.all(Array.from(ids).map((id) => this.userRepo.findById(id)));
    return users
      .filter(Boolean)
      .map((u: any) => ({
        id: String(u._id),
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        role: u.role,
      }));
  }
}
