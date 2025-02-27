'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';


export default function OtpEntry() {
    const [otpCode, setOtpCode] = useState('');
    const [email, setEmail] = useState(''); // Email passed from previous step or session
    const [countdown, setCountdown] = useState(60); // 60-second countdown
    const [isCounting, setIsCounting] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    // http://localhost:3006/otp?email=user%40example.com

    useEffect(() => {
        const emailFromParams = searchParams.get('email') || '';
        setEmail(emailFromParams);

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
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithOtp({
            email,
        });

        if (error) {
            setErrorMessage('Error resending OTP: ' + error.message);
        } else {
            setSuccessMessage('New OTP sent to your email!');
            setCountdown(60);
            setIsCounting(true);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!email) {
            setErrorMessage('Email not found. Please try logging in again.');
            return;
        }
        const supabase = await createClient();
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otpCode,
            type: 'email',
        });

        if (error) {
            setErrorMessage('Invalid or expired OTP. Please try again.');
        } else {
            setSuccessMessage('OTP verified successfully!');
            setTimeout(() => router.push('/dashboard/places'), 1000);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        Enter OTP
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        We’ve sent a 6-digit OTP code to your email ({email}). Please enter it
                        below.
                    </p>

                    {/* OTP Input Form */}
                    <form onSubmit={handleVerifyOtp} className="w-full space-y-4">
                        <Input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // Allow only digits
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            className="text-center"
                            required
                        />
                        <Button type="submit" className="w-full">
                            Verify OTP
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