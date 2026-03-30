import { ApplicationStatus } from './enums';

export interface IApplication {
  _id: string;
  projectId: string; // Ref to Project
  studentId: string; // Ref to User
  timeline: number; // days
  proposalText: string;
  githubLinks: string[];
  score: number;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

