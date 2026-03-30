import mongoose, { Schema, Document } from 'mongoose';
import { IDispute, DisputeStatus } from '@boulot/types';

export interface IDisputeDocument extends Omit<IDispute, '_id'>, Document {}

const DisputeSchema = new Schema<IDisputeDocument>(
  {
    projectId: { type: String, required: true, ref: 'Project' },
    raisedBy: { type: String, required: true, ref: 'User' },
    reason: { type: String, required: true },
    resolution: { type: String },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
    },
    resolvedBy: { type: String, ref: 'User' },
  },
  { timestamps: true }
);

export const DisputeModel = mongoose.model<IDisputeDocument>('Dispute', DisputeSchema);
