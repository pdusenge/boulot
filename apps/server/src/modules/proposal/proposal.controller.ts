import { Request, Response } from 'express';
import { ProposalService } from './proposal.service';

const proposalService = new ProposalService();

export const submitProposal = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const proposal = await proposalService.submitProposal(studentId, req.body);
    res.status(201).json({ success: true, data: proposal });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectProposals = async (req: Request, res: Response) => {
  try {
    const proposals = await proposalService.getProjectProposals(req.params.projectId);
    res.status(200).json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const getMyProposals = async (req: Request, res: Response) => {
  try {
    const proposals = await proposalService.getMyProposals(req.user!.userId);
    res.status(200).json({ success: true, data: proposals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export const acceptProposal = async (req: Request, res: Response) => {
  try {
    const smeId = req.user!.userId;
    const proposal = await proposalService.acceptProposal(smeId, req.params.id);
    res.status(200).json({ success: true, data: proposal });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
