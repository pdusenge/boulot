import { EscrowPaymentModel, IEscrowPaymentDocument } from '../models/EscrowPayment';
import { PaymentStatus } from '@boulot/types';

export class EscrowRepository {
  async create(data: Partial<IEscrowPaymentDocument>): Promise<IEscrowPaymentDocument> {
    return EscrowPaymentModel.create(data);
  }

  async findByProject(projectId: string): Promise<IEscrowPaymentDocument | null> {
    return EscrowPaymentModel.findOne({ projectId });
  }

  async findById(id: string): Promise<IEscrowPaymentDocument | null> {
    return EscrowPaymentModel.findById(id);
  }

  async findByPayee(payeeId: string): Promise<IEscrowPaymentDocument[]> {
    return EscrowPaymentModel.find({ payeeId });
  }

  async updateStatus(id: string, status: PaymentStatus, momoTransactionId?: string): Promise<IEscrowPaymentDocument | null> {
    const update: any = { status };
    if (momoTransactionId) update.momoTransactionId = momoTransactionId;
    if (status === PaymentStatus.RELEASED) update.releasedAt = new Date();
    return EscrowPaymentModel.findByIdAndUpdate(id, update, { new: true });
  }
}
