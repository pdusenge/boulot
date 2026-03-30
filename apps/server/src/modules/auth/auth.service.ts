import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../repositories/user.repo';
import { IUserDocument } from '../../models/User';
import { UserRole } from '@boulot/types';
import { IremboService } from '../../services/irembo.mock';

export class AuthService {
  private userRepo: UserRepository;
  private iremboService: IremboService;

  constructor() {
    this.userRepo = new UserRepository();
    this.iremboService = new IremboService();
  }

  async verifyIdentity(userId: string, nationalId: string, fullName: string): Promise<IUserDocument> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('User is already verified');
    }

    const isValid = await this.iremboService.verifyNationalId(nationalId, fullName);
    if (!isValid) {
      throw new Error('National ID verification failed');
    }

    const updatedUser = await this.userRepo.updateById(userId, {
      isVerified: true,
      nationalId,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user verification status');
    }

    return updatedUser;
  }

  async register(data: any): Promise<{ user: IUserDocument; token: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already wrapped in an account');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.userRepo.create({
      email: data.email,
      passwordHash,
      role: data.role as UserRole,
      firstName: data.firstName,
      lastName: data.lastName,
      isVerified: false,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: IUserDocument; token: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: IUserDocument): string {
    const secret = process.env.JWT_SECRET || 'secret';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;
    return jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn });
  }
}
