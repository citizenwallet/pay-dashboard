import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Fallback() {
    return (
        <div className="space-y-8">
            {/* Basic Information Section Skeleton */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4">
                    <Skeleton className="h-6 w-40 mb-2" /> {/* Title */}
                    <Skeleton className="h-4 w-64" /> {/* Description */}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Business Name Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>
                </div>
            </div>

            {/* Legal Information Section Skeleton */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4">
                    <Skeleton className="h-6 w-32 mb-2" /> {/* Title */}
                    <Skeleton className="h-4 w-96" /> {/* Description */}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* VAT Number Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>

                    {/* Legal Name Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>

                    {/* IBAN Number Field */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" /> {/* Label */}
                        <Skeleton className="h-10 w-full" /> {/* Input */}
                    </div>

                    {/* Legal Address Field - spans 2 columns */}
                    <div className="space-y-2 md:col-span-2">
                        <Skeleton className="h-4 w-24" /> {/* Label */}
                        <Skeleton className="h-24 w-full" /> {/* Textarea */}
                    </div>
                </div>
            </div>

            {/* Business Status Section Skeleton */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4">
                    <Skeleton className="h-6 w-28 mb-2" /> {/* Title */}
                    <Skeleton className="h-4 w-80" /> {/* Description */}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Verification Status */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" /> {/* Label */}
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge */}
                        </div>
                    </div>

                    {/* Membership Agreement */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-36" /> {/* Label */}
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon */}
                            <Skeleton className="h-4 w-32" /> {/* Text */}
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" /> {/* Label */}
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-5 rounded-full" /> {/* Icon */}
                            <Skeleton className="h-4 w-32" /> {/* Text */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex items-center justify-end rounded-lg p-6">
                <Skeleton className="h-10 w-32" /> {/* Button */}
            </div>
        </div>
    );
}
