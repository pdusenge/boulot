import mongoose, { Schema, Document } from 'mongoose';
import { IProject, ProjectStatus } from '@boulot/types';

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    smeId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    skillsRequired: [{ type: String }],
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.OPEN,
    },
    templateId: { type: String },
    repositoryUrl: { type: String },
    assignedStudentId: { type: String, ref: 'User' },
    mentorId: { type: String, ref: 'User' },
    lastActivity: { type: Date },
    applicationDeadline: { type: Date },
  },
  { timestamps: true }
);

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
