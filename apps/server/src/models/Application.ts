import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus, IApplication } from '@boulot/types';

export interface IApplicationDocument extends Omit<IApplication, '_id'>, Document {}

const ApplicationSchema = new Schema<IApplicationDocument>(
  {
    projectId: { type: String, required: true, ref: 'Project', index: true },
    studentId: { type: String, required: true, ref: 'User', index: true },
    timeline: { type: Number, required: true },
    proposalText: { type: String, required: true },
    githubLinks: [{ type: String }],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications (one per project per student)
ApplicationSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const ApplicationModel = mongoose.model<IApplicationDocument>('Application', ApplicationSchema);

