import { DisputeStatus } from './enums';

export interface IDispute {
  _id: string;
  projectId: string;
  raisedBy: string; // User ID (SME or Student)
  reason: string;
  resolution?: string;
  status: DisputeStatus;
  resolvedBy?: string; // Mentor User ID
  createdAt: Date;
  updatedAt: Date;
}
