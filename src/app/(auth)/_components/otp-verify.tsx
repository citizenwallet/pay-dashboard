'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  getBusinessByIdAction,
  getUserByEmailAction,
  sendOtpAction,
  signAction
} from '../action';
import { generateRandomString } from '@/lib/utils';
import { joinAction } from '@/actions/joinAction';

export default function OtpEntry() {
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState(''); // Email passed from previous step or session
  const [countdown, setCountdown] = useState(60); // 60-second countdown
  const [isCounting, setIsCounting] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    //get the local storage value
    setEmail(localStorage.getItem('otpEmail') || '');

    if (isCounting && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
  }, [isCounting, countdown]);

  const handleResendOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setOtpCode('');

    try {
      await sendOtpAction(email);
      setSuccessMessage('New OTP sent to your email!');
      setCountdown(60);
      setIsCounting(true);
    } catch (error) {
      setErrorMessage('Error resending OTP: ' + error);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let redirectLocation = '';

    if (!email) {
      setErrorMessage('Email not found. Please try logging in again.');
      return;
    }

    //first check the that email have account or not
    const user = await getUserByEmailAction(email);
    if (!user.data) {
      const invitationCode = generateRandomString(16);
      const credentials = {
        email: email,
        name: localStorage.getItem('regName') || '',
        phone: localStorage.getItem('regPhone') || ''
      };

      const res = await joinAction(invitationCode, {
        ...credentials,
        description: ''
      });

      redirectLocation =
        process.env.NEXT_PUBLIC_URL +
        '/onboarding/vat?invite_code=' +
        invitationCode;
    } else {
      //check the user registation complete or not
      const business = await getBusinessByIdAction(
        user.data?.linked_business_id
      );

      if (business.data?.status == 'Registered') {
        redirectLocation = process.env.NEXT_PUBLIC_URL + '/';
      } else {
        redirectLocation =
          process.env.NEXT_PUBLIC_URL +
          '/onboarding/vat?invite_code=' +
          business.data?.invite_code;
      }
    }
    try {
      const success = await signAction(email, otpCode);
      router.push(redirectLocation);
    } catch (error) {
      setErrorMessage('Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Enter Login Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-center text-gray-600">
            We’ve sent a 6-digit login code to your email ({email}). Please
            enter it below.
          </p>

          {/* OTP Input Form */}
          <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
            <Input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Allow only digits
              maxLength={6}
              placeholder="Enter 6-digit login code"
              className="text-center"
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Countdown Timer */}
          {isCounting ? (
            <p className="text-sm text-gray-500">
              Resend available in {countdown} seconds
            </p>
          ) : (
            <Button
              variant="outline"
              onClick={handleResendOtp}
              className="w-full"
            >
              Resend OTP
            </Button>
          )}

          {/* Messages */}
          {errorMessage && (
            <p className="text-center text-sm text-red-600">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-center text-sm text-green-600">
              {successMessage}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
