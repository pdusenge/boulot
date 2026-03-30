import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/user.repo';
import { UserRole } from '@boulot/types';
import { AuditLogModel } from '../../models/AuditLog';

const userRepo = new UserRepository();

export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || '';
    const users = await userRepo.listUsers(query);
    const sanitized = users.map((u) => {
      const obj = u.toObject();
      delete (obj as any).passwordHash;
      return obj;
    });

    res.status(200).json({ success: true, data: sanitized });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const role = req.body?.role as UserRole;
    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await userRepo.updateRole(req.params.id, role);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const obj = user.toObject();
    delete (obj as any).passwordHash;
    res.status(200).json({ success: true, data: obj });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLogModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      AuditLogModel.countDocuments().exec(),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};

