'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react';
import { updateBusinessVatAction } from '../action';
import { Business } from '@/db/business';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VatPage({ business }: { business: Business }) {
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setVatNumber(business?.vat_number || '');
  }, [business]);

  const handleSubmit = async () => {
    setLoading(true);
    if (!vatNumber) {
      setError('VAT number is required');
      return;
    }
    try {
      await updateBusinessVatAction(vatNumber, business.id);
      router.push(`/onboarding/details?vat=${vatNumber}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="space-y-2">
        <p className="text-left text-sm text-gray-700">
          In order to complete your registration, please provide us with your
          VAT number:
        </p>
        <Input
          type="text"
          placeholder="EX: BE0790756234"
          className="h-10 rounded-md border border-black px-4 text-black"
          value={vatNumber}
          onChange={(e) => setVatNumber(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="flex justify-start">
        <Button
          className="h-10 w-24 rounded-md bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Next'}
        </Button>
      </div>
    </div>
  );
}
