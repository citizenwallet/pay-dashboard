'use client';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createProfileAction } from './action';

// Define the form schema
const formSchema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(
      /^[a-zA-Z0-9-]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
});

export default function CreateProfileForm() {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const t = useTranslations('createProfile');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: '',
      username: '',
      name: '',
      description: ''
    }
  });

  // Handle image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await createProfileAction({
        address: values.address,
        username: values.username,
        name: values.name,
        description: values.description || '',
        image: imageFile || null
      });

      toast.success(t('profileCreatedSuccessfully'));
      router.push('/business/admin/profiles');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error(
        error instanceof Error ? error.message : t('failedToCreateProfile')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {t('addressInformation')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('addressDescription')}
              </p>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-foreground">
                    {t('ethereumAddress')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="0x..."
                      className="font-mono transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {t('profileInformation')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('profileDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground">
                      {t('username')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="username"
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
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-foreground">
                      {t('displayName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Display Name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-6 space-y-2">
                  <FormLabel className="text-sm font-medium text-foreground">
                    {t('description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Profile description..."
                      className="min-h-[6rem] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {t('profileImage')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('profileImageDescription')}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={handleImageChange}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
              {previewUrl && (
                <div className="relative inline-block">
                  <div className="overflow-hidden rounded-lg border">
                    <Image
                      src={previewUrl}
                      width={200}
                      height={200}
                      alt="Preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full p-0 shadow-lg"
                    onClick={handleRemoveImage}
                    type="button"
                  >
                    ×
                  </Button>
                </div>
              )}
              {!previewUrl && (
                <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <svg
                        className="h-6 w-6 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a profile image
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 rounded-lg p-4">
            <Button
              variant="outline"
              onClick={() => router.push('/business/admin/profiles')}
              type="button"
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={loading}
              type="submit"
              className="min-w-[120px] transition-all duration-200"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  <span>{t('creating')}</span>
                </div>
              ) : (
                t('createProfile')
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
