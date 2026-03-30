import mongoose, { Schema, Document } from 'mongoose';
import { IEscrowPayment, PaymentStatus } from '@boulot/types';

export interface IEscrowPaymentDocument extends Omit<IEscrowPayment, '_id'>, Document {}

const EscrowPaymentSchema = new Schema<IEscrowPaymentDocument>(
  {
    projectId: { type: String, required: true, ref: 'Project' },
    payerId: { type: String, required: true, ref: 'User' },
    payeeId: { type: String, required: true, ref: 'User' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    momoTransactionId: { type: String },
    releasedAt: { type: Date },
  },
  { timestamps: true }
);

export const EscrowPaymentModel = mongoose.model<IEscrowPaymentDocument>('EscrowPayment', EscrowPaymentSchema);
