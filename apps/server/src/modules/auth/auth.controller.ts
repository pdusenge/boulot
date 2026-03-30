import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserRepository } from '../../repositories/user.repo';

const authService = new AuthService();
const userRepo = new UserRepository();

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    const userWithoutPassword = result.user.toObject();
    delete (userWithoutPassword as any).passwordHash;

    res.status(201).json({
      success: true,
      data: { user: userWithoutPassword, token: result.token },
    });
  } catch (error: any) {
    if (error.message === 'Email already wrapped in an account') {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    const userWithoutPassword = result.user.toObject();
    delete (userWithoutPassword as any).passwordHash;

    res.status(200).json({
      success: true,
      data: { user: userWithoutPassword, token: result.token },
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).passwordHash;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { bio, skills, githubUsername, phone } = req.body as {
      bio?: string;
      skills?: string[];
      githubUsername?: string;
      phone?: string;
    };

    const patch: Record<string, unknown> = {};
    if (bio !== undefined) patch.bio = bio;
    if (skills !== undefined) patch.skills = skills;
    if (githubUsername !== undefined) patch.githubUsername = githubUsername === '' ? undefined : githubUsername;
    if (phone !== undefined) patch.phone = phone === '' ? undefined : phone;

    if (Object.keys(patch).length === 0) {
      res.status(400).json({ success: false, error: 'No profile fields to update' });
      return;
    }

    const user = await userRepo.updateById(userId, patch as any);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).passwordHash;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};

export const verifyId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { nationalId, fullName } = req.body;
    const user = await authService.verifyIdentity(userId, nationalId, fullName);
    
    // Omit sensitive data
    const userWithoutPassword = user.toObject();
    delete (userWithoutPassword as any).passwordHash;

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'ID verified successfully',
    });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('failed') || error.message.includes('already verified')) {
      res.status(400).json({ success: false, error: error.message });
      return;
    }
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
};
