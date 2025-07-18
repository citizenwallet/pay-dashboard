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
import { Business } from '@/db/business';
import { Place } from '@/db/places';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { updatePlaceAction } from './action';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1, 'Slug is required'),
  IBANnumber: z.string().optional()
});

export default function ProfileEdit({
  place,
  business
}: {
  place: Place | null;
  business: Business | null;
}) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    place?.image || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();
  const t = useTranslations('profile');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: place?.name || '',
      description: place?.description || '',
      slug: place?.slug || '',
      IBANnumber: business?.iban_number || ''
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
      await updatePlaceAction({
        placeId: place?.id || 0,
        name: values.name,
        description: values.description,
        slug: values.slug,
        image: imageFile || new File([], ''),
        oldimage: previewUrl || '',
        IBANnumber: values.IBANnumber || null
      });

      toast.success(t('updateSuccess'));
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  <Input
                    disabled={loading}
                    placeholder={t('slugPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="IBANnumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('IBANnumber')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t('IBANnumberPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
