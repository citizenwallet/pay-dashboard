'use client';

import { useState } from 'react';
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
import { updatePlaceAction } from './action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  slug: z.string().min(1, 'Slug is required')
});

export default function ProfileEdit({ place }: { place: Place | null }) {
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
      slug: place?.slug || ''
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
        oldimage: previewUrl || ''
      });

      toast.success(t('updatesuccess'));
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Name')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t('nameplaceholder')}
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
                <FormLabel>{t('Slug')}</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder={t('slugplaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>{t('Image')}</FormLabel>
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
                <FormLabel>{t('Description')}</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder={t('descriptionplaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button disabled={loading} type="submit">
          {loading ? t('updating') : t('Updateprofile')}
        </Button>
      </form>
    </Form>
  );
}
