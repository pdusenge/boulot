import mongoose, { Schema, Document } from 'mongoose';
import { IProposal, ProposalStatus } from '@boulot/types';

export interface IProposalDocument extends Omit<IProposal, '_id'>, Document {}

const ProposalSchema = new Schema<IProposalDocument>(
  {
    projectId: { type: String, required: true, ref: 'Project' },
    studentId: { type: String, required: true, ref: 'User' },
    coverLetter: { type: String, required: true },
    proposedPrice: { type: Number, required: true },
    estimatedDays: { type: Number, required: true },
    referenceLinks: [{ type: String }],
    status: {
      type: String,
      enum: Object.values(ProposalStatus),
      default: ProposalStatus.PENDING,
    },
  },
  { timestamps: true }
);

ProposalSchema.index({ projectId: 1, studentId: 1 }, { unique: true });

export const ProposalModel = mongoose.model<IProposalDocument>('Proposal', ProposalSchema);
