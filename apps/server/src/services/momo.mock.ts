export class MoMoService {
  /**
   * Simulates locking funds in escrow
   */
  async lockFunds(payerPhone: string, amount: number): Promise<string> {
    console.log(`[MoMo Mock] Requesting payment of ${amount} RWF from ${payerPhone}...`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const transactionId = `momo_escrow_${Date.now()}`;
    console.log(`[MoMo Mock] Payment successful. Transaction ID: ${transactionId}`);
    
    return transactionId;
  }

  /**
   * Simulates releasing escrowed funds to a payee
   */
  async releaseFunds(transactionId: string, payeePhone: string, amount: number): Promise<boolean> {
    console.log(`[MoMo Mock] Releasing ${amount} RWF (Tx: ${transactionId}) to ${payeePhone}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`[MoMo Mock] Transfer complete.`);
    return true;
  }
}
