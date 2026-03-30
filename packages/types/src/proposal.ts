import { ProposalStatus } from './enums';

export interface IProposal {
  _id: string;
  projectId: string; // Ref to Project
  studentId: string; // Ref to User
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
  referenceLinks?: string[];
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}
