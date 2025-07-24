'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Place } from '@/db/places';
import { updatePlaceAction, checkSlugAvailableAction } from './action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  slug: z.string().min(1, 'Slug is required')
});

export default function ProfileEdit({ place }: { place: Place | null }) {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    place?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slugAvailability, setSlugAvailability] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string | null;
    isModified: boolean;
  }>({
    checking: false,
    available: null,
    error: null,
    isModified: false
  });
  const router = useRouter();
  const t = useTranslations('profile');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: place?.name || '',
      description: place?.description || '',
      slug: place?.slug || ''
    }
  });

  // Debounced slug availability check
  const debouncedCheckSlug = useCallback(
    (slug: string) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      const originalSlug = place?.slug || '';
      const isModified = slug !== originalSlug;

      if (!slug || slug.length < 2) {
        setSlugAvailability({
          checking: false,
          available: null,
          error: null,
          isModified: false
        });
        return;
      }

      // Only check availability if the slug has been modified
      if (!isModified) {
        setSlugAvailability({
          checking: false,
          available: null,
          error: null,
          isModified: false
        });
        return;
      }

      setSlugAvailability((prev) => ({
        ...prev,
        checking: true,
        error: null,
        isModified: true
      }));

      timeoutIdRef.current = setTimeout(async () => {
        try {
          const available = await checkSlugAvailableAction(
            slug,
            place?.id || 0
          );
          setSlugAvailability({
            checking: false,
            available,
            error: null,
            isModified: true
          });
        } catch (error) {
          setSlugAvailability({
            checking: false,
            available: null,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to check availability',
            isModified: true
          });
        }
      }, 500); // 500ms debounce delay
    },
    [place?.id, place?.slug]
  );

  // Watch slug changes and trigger availability check
  const slugValue = form.watch('slug');
  useEffect(() => {
    debouncedCheckSlug(slugValue);
  }, [slugValue, debouncedCheckSlug]);

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
      // Only pass the original place image if no new image is selected
      // and previewUrl is not a blob URL
      const oldImageUrl =
        previewUrl && !previewUrl.startsWith('blob:')
          ? previewUrl
          : place?.image || '';

      await updatePlaceAction({
        placeId: place?.id || 0,
        name: values.name,
        description: values.description || null,
        slug: values.slug,
        image: imageFile || null,
        oldimage: oldImageUrl
      });

      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t('namePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('slug')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={loading}
                      placeholder={t('slugPlaceholder')}
                      {...field}
                      className={
                        slugAvailability.isModified &&
                        slugAvailability.available === true
                          ? 'border-green-500 focus:border-green-500'
                          : slugAvailability.isModified &&
                            slugAvailability.available === false
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    {slugAvailability.isModified &&
                      slugAvailability.checking && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                        </div>
                      )}
                    {slugAvailability.isModified &&
                      !slugAvailability.checking &&
                      slugAvailability.available === true && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="h-4 w-4 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    {slugAvailability.isModified &&
                      !slugAvailability.checking &&
                      slugAvailability.available === false && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="h-4 w-4 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                  </div>
                </FormControl>
                <FormMessage />
                {slugAvailability.isModified && slugAvailability.error && (
                  <p className="mt-1 text-sm text-red-500">
                    {slugAvailability.error}
                  </p>
                )}
                {slugAvailability.isModified &&
                  !slugAvailability.checking &&
                  slugAvailability.available === false && (
                    <p className="mt-1 text-sm text-red-500">
                      This slug is already taken
                    </p>
                  )}
                {slugAvailability.isModified &&
                  !slugAvailability.checking &&
                  slugAvailability.available === true && (
                    <p className="mt-1 text-sm text-green-500">
                      This slug is available
                    </p>
                  )}
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{t('image')}</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={handleImageChange}
              />
            </FormControl>
            {previewUrl && (
              <div className="relative mt-2">
                <Image
                  src={previewUrl}
                  width={200}
                  height={200}
                  alt="Preview"
                  className="h-auto max-w-xs"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute left-0 top-0"
                  onClick={handleRemoveImage}
                >
                  X
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder={t('descriptionPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button disabled={loading} type="submit">
          {loading ? t('updating') : t('updateProfile')}
        </Button>
      </form>
    </Form>
  );
}
