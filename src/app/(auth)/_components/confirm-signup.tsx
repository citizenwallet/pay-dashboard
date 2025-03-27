'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfirmSignup() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get('token_hash') || '/';

  useEffect(() => {
    if (tokenHash) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    }
  }, [tokenHash]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Successfully signed up!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <a
            rel="noreferrer"
            className="text-center text-gray-600"
            href={`/confirm?token_hash=${tokenHash}&type=magiclink`}
          >
            You will be redirected in 3 seconds. Click here if you are not
            redirected.
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
