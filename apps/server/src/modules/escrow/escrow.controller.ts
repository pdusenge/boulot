import { Request, Response } from 'express';
import { EscrowService } from './escrow.service';

const escrowService = new EscrowService();

export const depositFunds = async (req: Request, res: Response) => {
  try {
    const payerId = req.user!.userId;
    const { projectId, amount, payerPhone } = req.body;
    const escrow = await escrowService.depositFunds(projectId, payerId, '', amount, payerPhone);
    res.status(201).json({ success: true, data: escrow });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const releaseFunds = async (req: Request, res: Response) => {
  try {
    const { payeePhone } = req.body;
    const escrow = await escrowService.releaseFunds(req.params.projectId, payeePhone);
    res.status(200).json({ success: true, data: escrow });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEscrowStatus = async (req: Request, res: Response) => {
  try {
    const escrow = await escrowService.getEscrowByProject(req.params.projectId);
    if (!escrow) {
      return res.status(404).json({ success: false, error: 'No escrow found' });
    }
    res.status(200).json({ success: true, data: escrow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
