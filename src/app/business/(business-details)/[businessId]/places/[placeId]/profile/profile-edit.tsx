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
import { Place } from '@/db/places';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { checkSlugAvailableAction, updatePlaceAction } from './action';

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
                    {t('name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder={t('namePlaceholder')}
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

          </div>
        </div>


        <div className="rounded-lg border bg-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t('mediaAndDescription')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('mediaAndDescriptionDescription')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Image Upload */}
            <div className="space-y-4">
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground">
                  {t('image')}
                </FormLabel>
                <FormControl>
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
                          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
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
                            {t('uploadImagePrompt')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-foreground">
                    {t('description')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder={t('descriptionPlaceholder')}
                      className="min-h-[12rem] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
              t('updateProfile')
            )}
          </Button>
        </div>


      </form>
    </Form>
  );
}
