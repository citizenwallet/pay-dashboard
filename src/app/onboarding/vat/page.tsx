'use client';
import { Button } from '@/components/ui/button';
import { ButtonLoading } from '@/components/ui/button-loading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import React, { useState } from 'react';

export default function VatPage() {
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    // Basic validation
    if (!vatNumber) {
      setError('VAT number is required');
      return;
    }

    if (!/^[A-Z]{2}[0-9]{8,12}$/.test(vatNumber)) {
      setError('Please enter a valid VAT number');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate an async operation
    setTimeout(() => {
      console.log('VAT Number submitted:', vatNumber);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4338ca]">
            <Image
              src="/assets/img/logo.svg"
              alt="Logo"
              width={64}
              height={64}
            />
          </div>

          <h1 className="text-center text-2xl font-semibold text-gray-900">
            Welcome to Brussels.pay!
          </h1>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <p className="text-left text-sm text-gray-700">
              In order to complete your registration, please provide us with
              your VAT number:
            </p>
            <Input
              type="text"
              placeholder="EX: BE0790756234"
              className="h-10 rounded-md border border-black px-4 text-black"
            />
          </div>

          <div className="flex justify-start">
            <Button
              type="submit"
              className="h-10 w-24 rounded-md bg-gray-100 text-sm font-medium text-gray-900 hover:bg-gray-200"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
