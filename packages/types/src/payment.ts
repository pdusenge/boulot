import { PaymentStatus } from './enums';

export interface IEscrowPayment {
  _id: string;
  projectId: string; // Ref to Project
  payerId: string; // Ref to User (SME)
  payeeId: string; // Ref to User (Student)
  amount: number;
  status: PaymentStatus;
  momoTransactionId?: string;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
