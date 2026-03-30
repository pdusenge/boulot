export class IremboService {
  /**
   * Simulates National ID verification
   */
  async verifyNationalId(nid: string, expectedName: string): Promise<boolean> {
    console.log(`[Irembo Mock] Verifying NID: ${nid} against name: ${expectedName}...`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Simple mock logic: accept if exactly 16 digits
    if (!/^\d{16}$/.test(nid)) {
      console.log(`[Irembo Mock] Verification failed: Invalid format`);
      return false;
    }
    
    console.log(`[Irembo Mock] Verification successful`);
    return true;
  }
}
