import { a_profiles, a_transactions } from "@prisma/client";

export type Transaction = a_transactions & {
  id: string;
  from: a_profiles;
  to: a_profiles;
  amount: number;
  description: string;
  created_at: Date;
};
