'use client';
import { DataTable as TransactionTable } from '@/components/ui/table/data-table';
import { columns } from './transaction-tables/columns';
import useSWR from 'swr';
import { Transaction } from '@/types/transaction';

type TransactionListingPage = {};

export default function TransactionListingPage({}: TransactionListingPage) {

  const {data: res} = useSWR('/api/transactions', async () => {
    return fetch('/api/transactions').then(res => res.json());
  });

  const totalTransactions = res?.data?.length || 0;
  const transactions: Transaction[] = res?.data || [];

  return (
    <>
      <TransactionTable
        columns={columns}
        data={transactions}
        totalItems={totalTransactions}
      />
    </>
  );
}
