import mongoose, { Schema, Document } from 'mongoose';
import { IPortfolio, StudentTier } from '@boulot/types';

export interface IPortfolioDocument extends Omit<IPortfolio, '_id'>, Document {}

const SkillBadgeSchema = new Schema(
  {
    skill: { type: String, required: true },
    projectCount: { type: Number, default: 1 },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CompletedProjectSchema = new Schema(
  {
    projectId: { type: String, required: true, ref: 'Project' },
    title: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    rating: { type: Number },
  },
  { _id: false }
);

const PortfolioSchema = new Schema<IPortfolioDocument>(
  {
    studentId: { type: String, required: true, unique: true, ref: 'User' },
    completedProjects: [CompletedProjectSchema],
    skillBadges: [SkillBadgeSchema],
    completionRate: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: Object.values(StudentTier),
      default: StudentTier.APPRENTICE,
    },
  },
  { timestamps: true }
);

export const PortfolioModel = mongoose.model<IPortfolioDocument>('Portfolio', PortfolioSchema);
