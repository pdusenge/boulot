import { Request, Response } from 'express';
import { DisputeService } from './dispute.service';

const disputeService = new DisputeService();

export const createDispute = async (req: Request, res: Response) => {
  try {
    const raisedBy = req.user!.userId;
    const { projectId, reason } = req.body;
    const dispute = await disputeService.raiseDispute(projectId, raisedBy, reason);
    res.status(201).json({ success: true, data: dispute });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('authorized') || error.message.includes('exists')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getProjectDisputes = async (req: Request, res: Response) => {
  try {
    const disputes = await disputeService.getProjectDisputes(req.params.projectId);
    res.status(200).json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getOpenDisputes = async (req: Request, res: Response) => {
  try {
    const disputes = await disputeService.getOpenDisputes();
    res.status(200).json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user!.userId;
    const { resolution, action } = req.body; // action: refund | release | continue
    const disputeId = req.params.id;
    
    const resolved = await disputeService.resolveDispute(disputeId, mentorId, resolution, action);
    res.status(200).json({ success: true, data: resolved });
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('already resolved')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Server Error', message: error.message });
  }
};
