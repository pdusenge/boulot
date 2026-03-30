import { MessageModel, IMessageDocument } from '../models/Message';

export class MessageRepository {
  async create(data: Partial<IMessageDocument>): Promise<IMessageDocument> {
    return MessageModel.create(data);
  }

  async findByProject(projectId: string): Promise<IMessageDocument[]> {
    return MessageModel.find({ projectId }).sort({ createdAt: 1 });
  }

  async markAsRead(messageId: string): Promise<IMessageDocument | null> {
    return MessageModel.findByIdAndUpdate(messageId, { isRead: true }, { new: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return MessageModel.countDocuments({ receiverId: userId, isRead: false });
  }
}
