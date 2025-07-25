'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Business } from '@/db/business';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import * as z from 'zod';
import { fetchBusinessDetailsAction, updateBusinessDetailsAction } from './action';
import { useTranslations } from 'next-intl';

// Define the form schema
const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    vat_number: z.string().min(1, 'VAT number is required'),
    address_legal: z.string().min(1, 'Legal address is required'),
    legal_name: z.string().min(1, 'Legal name is required'),
    iban_number: z.string().min(1, 'IBAN number is required')
});



export default function BusinessEdit({
    business,
    userId,
    placeId,
    isOwner
}: {
    business: Business;
    userId: number;
    placeId: number;
    isOwner: boolean;
}) {
    const [loading, setLoading] = useState(false);
    const [companyStatus, setCompanyStatus] = useState<'verified' | 'verifying' | 'created' | null>
        (business.business_status as 'verified' | 'verifying' | 'created' | null);
    const router = useRouter();
    const t = useTranslations('business');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: business.name || '',
            email: business.email || '',
            phone: business.phone || '',
            vat_number: business.vat_number || '',
            address_legal: business.address_legal || '',
            legal_name: business.legal_name || '',
            iban_number: business.iban_number || ''
        }
    });

    // Get business status badge variant
    const getStatusVariant = (status: string | null) => {
        switch (status) {
            case 'verified':
                return 'default'; // Green
            case 'verifying':
            case 'created':
                return 'secondary'; // Orange
            default:
                return 'secondary';
        }
    };

    // Get business status display text
    const getStatusText = (status: string | null) => {
        switch (status) {
            case 'verified':
                return 'Verified';
            case 'verifying':
                return 'Verifying';
            case 'created':
                return 'Created';
            default:
                return 'Unknown';
        }
    };

    // Format date for display
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not accepted';
        return new Date(dateString).toLocaleDateString();
    };

    const [debouncedVatNumber] = useDebounce(form.watch('vat_number'), 1000);

    useEffect(() => {
        if (debouncedVatNumber && debouncedVatNumber !== business.vat_number) {
            const fetchCompany = async () => {
                const company = await fetchBusinessDetailsAction(debouncedVatNumber);
                if (company?.isValid) {
                    form.setValue('legal_name', company.name);
                    form.setValue('address_legal', company.address);
                    setCompanyStatus('verifying');
                }
            }
            fetchCompany();
        }
    }, [debouncedVatNumber, form, business.vat_number]);

    // Handle form submission
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        let businessStatusValue = companyStatus as 'verified' | 'verifying' | 'created' | null;
        if (
            values.vat_number != business.vat_number ||
            values.legal_name != business.legal_name ||
            values.address_legal != business.address_legal
        ) {
            businessStatusValue = 'verifying';
            setCompanyStatus('verifying');
        }


        try {

            await updateBusinessDetailsAction(Number(business.id), userId, placeId, {
                name: values.name,
                email: values.email,
                phone: values.phone,
                vat_number: values.vat_number,
                address_legal: values.address_legal,
                legal_name: values.legal_name,
                iban_number: values.iban_number,
                business_status: businessStatusValue
            });

            toast.success(t('businessUpdatedSuccessfully'));
        } catch (error) {
            console.error('Error updating business:', error);
            toast.error(t('failedToUpdateBusiness'));
        } finally {
            setLoading(false);
            router.refresh();
        }
    };


    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('basicInformation')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('basicInformationDescription')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('businessName')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            placeholder="Enter business name"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('emailAddress')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            type="email"
                                            placeholder="Enter email address"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('phoneNumber')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            placeholder="Enter phone number"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Legal Information Section */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('legalInformation')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('legalInformationDescription')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="vat_number"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('vatNumber')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            placeholder="Enter VAT number"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="legal_name"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('legalName')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            placeholder="Enter legal business name"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="iban_number"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('ibanNumber')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={loading || !isOwner}
                                            placeholder="Enter IBAN number"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address_legal"
                            render={({ field }) => (
                                <FormItem className="space-y-2 md:col-span-2">
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        {t('legaladdress')}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            disabled={loading || !isOwner}
                                            placeholder="Enter complete legal address"
                                            className="min-h-[6rem] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Status Information Section */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-foreground">
                            {t('businessStatus')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {t('businessStatusDescription')}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Business Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('verificationStatus')}
                            </label>
                            <div className="flex items-center space-x-2">
                                <Badge
                                    variant={getStatusVariant(companyStatus)}
                                    className={`${companyStatus === 'verified'
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                                        }`}
                                >
                                    {getStatusText(companyStatus)}
                                </Badge>
                            </div>
                        </div>

                        {/* Membership Agreement */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('membershipAgreement')}
                            </label>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-muted-foreground">
                                    {t('acceptedOn')} {formatDate(business?.accepted_membership_agreement || null)}
                                </span>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t('termsAndConditions')}
                            </label>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-muted-foreground">
                                    {t('acceptedOn')} {formatDate(business?.accepted_terms_and_conditions || null)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                {isOwner && (
                    <div className="flex items-center justify-end rounded-lg p-6">
                        <Button
                            disabled={loading}
                            type="submit"
                            className="min-w-[120px] transition-all duration-200"
                            size="lg"
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    <span>{t('updating')}</span>
                                </div>
                            ) : (
                                t('update')
                            )}
                        </Button>
                    </div>
                )}
            </form>
        </Form>


    );
}
