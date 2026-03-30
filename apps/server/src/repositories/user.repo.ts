import { UserModel, IUserDocument } from '../models/User';
import { UserRole } from '@boulot/types';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new UserModel(userData);
    return user.save();
  }

  async findByRole(role: UserRole): Promise<IUserDocument[]> {
    return UserModel.find({ role }).exec();
  }

  async updateById(id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async listUsers(query?: string): Promise<IUserDocument[]> {
    const q = (query || '').trim();
    const filter =
      q.length === 0
        ? {}
        : {
            $or: [
              { email: { $regex: q, $options: 'i' } },
              { firstName: { $regex: q, $options: 'i' } },
              { lastName: { $regex: q, $options: 'i' } },
            ],
          };

    return UserModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async updateRole(userId: string, role: UserRole): Promise<IUserDocument | null> {
    return UserModel.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).exec();
  }
}
