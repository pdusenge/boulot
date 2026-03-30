import { ProjectStatus } from './enums';

export interface IProject {
  _id: string;
  smeId: string; // Ref to User
  title: string;
  description: string;
  budget: number;
  skillsRequired: string[];
  status: ProjectStatus;
  templateId?: string; // Optional ref to a template
  repositoryUrl?: string; // GitHub integration
  assignedStudentId?: string; // Ref to User
  mentorId?: string; // Ref to User
  lastActivity?: Date; // GitHub webhook sync
  applicationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}
