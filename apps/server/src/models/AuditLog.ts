import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  action: 'ESCROW_CREATED' | 'ESCROW_RELEASED' | 'ESCROW_REFUNDED';
  projectId: string;
  userId: string;
  amount: number;
  momoTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    action: {
      type: String,
      enum: ['ESCROW_CREATED', 'ESCROW_RELEASED', 'ESCROW_REFUNDED'],
      required: true,
    },
    projectId: { type: String, required: true, ref: 'Project' },
    userId: { type: String, required: true, ref: 'User' },
    amount: { type: Number, required: true },
    momoTransactionId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Make documents immutable after creation (NFR 8: read-only for auditing)
AuditLogSchema.pre('findOneAndUpdate', function () {
  throw new Error('Audit logs are immutable and cannot be modified');
});
AuditLogSchema.pre('updateOne', function () {
  throw new Error('Audit logs are immutable and cannot be modified');
});
AuditLogSchema.pre('findOneAndDelete', function () {
  throw new Error('Audit logs are immutable and cannot be deleted');
});
AuditLogSchema.pre('deleteOne', function () {
  throw new Error('Audit logs are immutable and cannot be deleted');
});

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
