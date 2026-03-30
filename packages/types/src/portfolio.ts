import { StudentTier } from './enums';

export interface ISkillBadge {
  skill: string;
  projectCount: number;
  earnedAt: Date;
}

export interface ICompletedProject {
  projectId: string;
  title: string;
  completedAt: Date;
  rating?: number;
}

export interface IPortfolio {
  _id: string;
  studentId: string;
  completedProjects: ICompletedProject[];
  skillBadges: ISkillBadge[];
  completionRate: number; // percentage 0-100
  totalProjects: number;
  totalCompleted: number;
  tier: StudentTier;
  createdAt: Date;
  updatedAt: Date;
}
