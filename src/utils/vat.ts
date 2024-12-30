export async function verifyVAT(vat: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return /^[A-Z]{2}[0-9]{8,12}$/.test(vat);
}
