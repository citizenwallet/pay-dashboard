import { z } from 'zod';

export const companySchema = z.object({
  id: z.any().optional(),
  token: z.string().min(8, "Token must be at least 8 characters"),
  vat_number: z.string().min(1, "VAT is required"),
  iban_number: z.string().min(1, "IBAN is required"),
  legal_name: z.string().min(1, "Legal name is required"),
  address_legal: z.string().min(1, "Address is required"),
  website: z.string().url("Must be a valid URL"),
});

export type CompanyInfo = z.infer<typeof companySchema>;

export type OnboardingState = {
  step: number;
  data: CompanyInfo;
};

export type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_DATA'; payload: CompanyInfo };

