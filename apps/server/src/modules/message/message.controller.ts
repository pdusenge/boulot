import { Request, Response } from 'express';
import { MessageService } from './message.service';

const messageService = new MessageService();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user!.userId;
    const message = await messageService.sendMessage(senderId, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const messages = await messageService.getProjectMessages(req.params.projectId, userId);
    res.status(200).json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const message = await messageService.markAsRead(req.params.id, userId);
    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await messageService.getUnreadCount(req.user!.userId);
    res.status(200).json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getProjectParticipants = async (req: Request, res: Response) => {
  try {
    const participants = await messageService.getProjectParticipants(req.params.projectId);
    res.status(200).json({ success: true, data: participants });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Server Error' });
  }
};
