import { EscrowRepository } from '../../repositories/escrow.repo';
import { ProjectRepository } from '../../repositories/project.repo';
import { UserRepository } from '../../repositories/user.repo';
import { IEscrowPaymentDocument } from '../../models/EscrowPayment';
import { PaymentStatus } from '@boulot/types';
import { MoMoService } from '../../services/momo.mock';
import { ProjectService } from '../project/project.service';
import { emitToUser } from '../../services/socket.service';
import { AuditLogModel } from '../../models/AuditLog';

export class EscrowService {
  private escrowRepo: EscrowRepository;
  private projectRepo: ProjectRepository;
  private userRepo: UserRepository;
  private momoService: MoMoService;

  constructor() {
    this.escrowRepo = new EscrowRepository();
    this.projectRepo = new ProjectRepository();
    this.userRepo = new UserRepository();
    this.momoService = new MoMoService();
  }

  async depositFunds(
    projectId: string,
    payerId: string,
    payeeId: string,
    amount: number,
    payerPhone: string
  ): Promise<IEscrowPaymentDocument> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error('Project not found');

    const smeId =
      typeof project.smeId === 'object' ? String((project.smeId as any)._id) : String(project.smeId);
    if (smeId !== payerId) {
      throw new Error('Not authorized to deposit for this project');
    }

    if (!project.assignedStudentId) {
      throw new Error('No student assigned to this project');
    }

    // Check if escrow already exists for this project
    const existing = await this.escrowRepo.findByProject(projectId);
    if (existing) {
      throw new Error('Escrow already exists for this project');
    }

    const derivedPayeeId = String(project.assignedStudentId);


    const transactionId = await this.momoService.lockFunds(payerPhone, amount);

    // Create escrow record
    const escrow = await this.escrowRepo.create({
      projectId,
      payerId,
      payeeId: derivedPayeeId,
      amount,
      status: PaymentStatus.ESCROWED,
      momoTransactionId: transactionId,
    });


    const student = await this.userRepo.findById(derivedPayeeId);
    if (!student) {
      throw new Error('Assigned student not found');
    }

    const projectService = new ProjectService();
    try {
      await projectService.startProject(projectId, derivedPayeeId, student.githubUsername || student.firstName);
    } catch (error: any) {
      console.error(`Failed to start project ${projectId} after escrow deposit: ${error.message}`);
    }

    // Notify student that escrow has been deposited (FR 11.2)
    emitToUser(derivedPayeeId, 'payment:escrowed', { projectId, amount });

    // NFR 8: Immutable audit log
    await AuditLogModel.create({
      action: 'ESCROW_CREATED',
      projectId,
      userId: payerId,
      amount,
      momoTransactionId: transactionId,
    });

    return escrow;
  }

  async releaseFunds(projectId: string, payeePhone: string): Promise<IEscrowPaymentDocument> {
    const escrow = await this.escrowRepo.findByProject(projectId);
    if (!escrow) throw new Error('No escrow found for this project');

    if (escrow.status !== PaymentStatus.ESCROWED) {
      throw new Error('Funds are not in escrow');
    }

    // Call MoMo to release
    await this.momoService.releaseFunds(escrow.momoTransactionId!, payeePhone, escrow.amount);

    // NFR 8: Immutable audit log
    await AuditLogModel.create({
      action: 'ESCROW_RELEASED',
      projectId,
      userId: String(escrow.payeeId),
      amount: escrow.amount,
      momoTransactionId: escrow.momoTransactionId,
    });

    return (await this.escrowRepo.updateStatus(String(escrow._id), PaymentStatus.RELEASED))!;
  }

  async refundFunds(projectId: string, payerPhone: string): Promise<IEscrowPaymentDocument> {
    const escrow = await this.escrowRepo.findByProject(projectId);
    if (!escrow) throw new Error('No escrow found for this project');

    if (escrow.status !== PaymentStatus.ESCROWED) {
      throw new Error('Funds are not in escrow');
    }

    // Refund via MoMo
    await this.momoService.releaseFunds(escrow.momoTransactionId!, payerPhone, escrow.amount);

    // NFR 8: Immutable audit log
    await AuditLogModel.create({
      action: 'ESCROW_REFUNDED',
      projectId,
      userId: String(escrow.payerId),
      amount: escrow.amount,
      momoTransactionId: escrow.momoTransactionId,
    });

    return (await this.escrowRepo.updateStatus(String(escrow._id), PaymentStatus.REFUNDED))!;
  }

  async getEscrowByProject(projectId: string): Promise<IEscrowPaymentDocument | null> {
    return this.escrowRepo.findByProject(projectId);
  }
}
