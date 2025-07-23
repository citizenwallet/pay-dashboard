'use client';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Place } from '@/db/places';
import { PaginationState, Row } from '@tanstack/react-table';
import {
  Plus,
  Upload,
  Loader,
  Camera,
  ImagePlus,
  Edit,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  checkPlaceSlugAlreadyExistsAction,
  updatePlaceDescriptionAction,
  updatePlaceHiddenAction,
  updatePlaceImageAction,
  updatePlaceNameAction,
  updatePlaceSlugAction
} from './action';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { createSlug } from '@/lib/utils';
import {
  generateUniqueSlugAction,
  uploadImageAction,
  createPlaceAction,
  changeLastPlaceAction
} from '@/app/business/(business-details)/[businessId]/places/[placeId]/action';
import { useTranslations } from 'next-intl';

export default function PlacesPage({
  businessId,
  place,
  offset,
  limit,
  search,
  count,
  placeId
}: {
  businessId: number;
  place: Place[];
  offset: number;
  limit: number;
  search: string | null;
  count: number;
  placeId: string;
}) {
  const t = useTranslations('placelist');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [places, setPlaces] = useState<Place[]>(place);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<
    'image' | 'name' | 'description' | 'slug' | 'hidden' | null
  >(null);
  const [editingSlugError, setEditingSlugError] = useState<boolean>(false);

  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [editingSlug, setEditingSlug] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add dialog state and form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newPlaceName, setNewPlaceName] = useState<string>('');
  const [newPlacedescription, setNewPlacedescription] = useState<string>('');
  const [newPlaceSlug, setNewPlaceSlug] = useState<string>('');
  const [newPlaceImage, setNewPlaceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState<boolean>(false);
  const [debouncedPlaceName] = useDebounce(newPlaceName, 500);
  const [isAddLoading, setIsAddLoading] = useState<boolean>(false);

  useEffect(() => {
    setPlaces(place);
  }, [place]);

  // Auto-generate slug from name if not touched
  useEffect(() => {
    if (!slugTouched && debouncedPlaceName) {
      const baseSlug = createSlug(debouncedPlaceName);
      const updateSlug = async () => {
        try {
          const uniqueSlug = await generateUniqueSlugAction(baseSlug);
          setNewPlaceSlug(uniqueSlug);
          setSlugError(null);
        } catch (err) {
          setSlugError(
            'Unable to generate a unique slug. Please edit manually.'
          );
        }
      };
      updateSlug();
    }
  }, [debouncedPlaceName, slugTouched]);

  //for name editing
  const handleNameClick = (place: Place) => {
    setEditingItemId(place.id);
    setEditingField('name');
    setEditingName(place.name || '');
  };
  const handleNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place: Place
  ) => {
    if (e.key === 'Enter') {
      handleNameSave(place);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };
  const handleNameSave = async (place: Place) => {
    if (editingName === place.name) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      await updatePlaceNameAction(place.id, editingName);
      setEditingItemId(null);
      setEditingField(null);
      toast.success(t('placeNameupdatedsuccessfully'));

      const updatedPlaces = places.map((p) =>
        p.id === place.id ? { ...p, name: editingName } : p
      );
      setPlaces(updatedPlaces);
    } catch (error) {
      console.error(`Failed to update place name:`, error);
    }
    // Save logic would go here
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  //for description editing
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingDescription(e.target.value);
  };
  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place: Place
  ) => {
    if (e.key === 'Enter') {
      handleDescriptionSave(place);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };
  const handleDescriptionSave = async (place: Place) => {
    if (editingDescription === place.description) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      await updatePlaceDescriptionAction(place.id, editingDescription);
      setEditingItemId(null);
      setEditingField(null);
      toast.success(t('placeDescriptionUpdatedSuccessfully'));

      const updatedPlaces = places.map((p) =>
        p.id === place.id ? { ...p, description: editingDescription } : p
      );
      setPlaces(updatedPlaces);
    } catch (error) {
      console.error(`Failed to update place description:`, error);
    }
  };
  const handleDescriptionClick = (place: Place) => {
    setEditingItemId(place.id);
    setEditingField('description');
    setEditingDescription(place.description || '');
  };

  //for slug editing
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingSlug(e.target.value);
  };
  const handleSlugKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place: Place
  ) => {
    if (e.key === 'Enter') {
      handleSlugSave(place);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };
  const handleSlugSave = async (place: Place) => {
    if (editingSlug === place.slug) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      const res = await checkPlaceSlugAlreadyExistsAction(
        editingSlug,
        place.id
      );

      if (res) {
        setEditingSlugError(true);
        toast.custom((t) => (
          <div>
            <h3>This slug is already taken by another place </h3>
            <p>Please try another one</p>
            <div className="mt-4 flex justify-end gap-3">
              <Button
                onClick={() => {
                  toast.dismiss(t);
                  setEditingItemId(null);
                  setEditingField(null);
                }}
              >
                Cancel
              </Button>
              <Button className="ml-4 bg-red-600 text-white hover:bg-red-700">
                Pick another slug
              </Button>
            </div>
          </div>
        ));
      } else {
        try {
          setLoadingId(place.id);
          await updatePlaceSlugAction(place.id, editingSlug);
          toast.success('Place slug updated successfully');
          const updatedPlaces = places.map((p) =>
            p.id === place.id ? { ...p, slug: editingSlug } : p
          );
          setPlaces(updatedPlaces);
        } catch (error) {
          console.error(`Failed to update place slug:`, error);
        } finally {
          setLoadingId(null);
          setEditingItemId(null);
          setEditingField(null);
        }
      }
    } catch (error) {
      console.error(`Failed to check place slug:`, error);
    }
  };
  const handleSlugClick = (place: Place) => {
    setEditingItemId(place.id);
    setEditingField('slug');
    setEditingSlug(place.slug || '');
  };

  //for hidden toggle
  const handleHiddenToggle = async (place: Place, hidden: boolean) => {
    try {
      setLoadingId(place.id);

      try {
        await updatePlaceHiddenAction(place.id, hidden);
        toast.success(t('placeVisibilityUpdatedSuccessfully'));

        const updatedPlaces = places.map((p) =>
          p.id === place.id ? { ...p, hidden: hidden } : p
        );
        setPlaces(updatedPlaces);
      } catch (error) {
        console.error(`Failed to update place visibility:`, error);
      }
      // Save logic would go here
    } catch (error) {
      console.error(`Failed to update place visibility:`, error);
    } finally {
      setLoadingId(null);
    }
  };

  //for image editing
  const handleImageClick = (place: Place) => {
    setEditingItemId(place.id);
    setEditingField('image');
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    place: Place
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoadingId(place.id);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('placeId', place.id.toString());

      // Upload the image using FormData
      const { response, imageUrl } = await updatePlaceImageAction(formData);

      if (response.error) {
        toast.error(t('failImageUpload'));
      } else {
        toast.success(t('imageUploadedSuccessfully'));

        // Update the local state with the new image URL
        const updatedPlaces = places.map((p) =>
          p.id === place.id ? { ...p, image: imageUrl } : p
        );
        setPlaces(updatedPlaces);
      }
    } catch (error) {
      console.error('Failed to update item image:', error);
      toast.error(t('failImageUpload'));
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoadingId(null);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onPaginationChange = React.useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState)
    ) => {
      const newState =
        typeof updaterOrValue === 'function'
          ? updaterOrValue({
            pageIndex: offset / limit,
            pageSize: limit
          })
          : updaterOrValue;

      const params = new URLSearchParams(searchParams);
      params.set('offset', (newState.pageIndex * newState.pageSize).toString());
      params.set('limit', newState.pageSize.toString());

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams, offset, limit]
  );

  const handleAddPlace = async () => {
    // Validate form

    if (!newPlaceName.trim()) {
      toast.error(t('placeNameRequired'));
      return;
    }

    if (slugTouched && !newPlaceSlug.trim()) {
      setSlugError(t('slugRequired'));
      return;
    }
    setIsAddLoading(true);
    try {
      // Check if slug exists (if provided)
      if (newPlaceSlug.trim()) {
        const slugExists = await checkPlaceSlugAlreadyExistsAction(
          newPlaceSlug,
          Number(placeId)
        );
        if (slugExists) {
          return;
        }
      }

      const image = newPlaceImage ? await uploadImage(newPlaceImage) : '';
      const newPlace = await createPlaceAction(
        businessId,
        newPlaceName,
        newPlacedescription,
        newPlaceSlug,
        image
      );

      toast.success(t('placeAddedSuccessfully'));

      setNewPlaceName('');
      setNewPlacedescription('');
      setNewPlaceSlug('');
      setNewPlaceImage(null);
      setImagePreview(null);
      setSlugError(null);
      setSlugTouched(false);
      setIsAddDialogOpen(false);

      setPlaces([...places, newPlace]);
      router.push(`/business/${businessId}/places/${newPlace.id}/list`);
    } catch (error) {
      console.error('Failed to add place:', error);
      toast.error(t('failedToAddPlace'));
    } finally {
      setIsAddLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const imageUrl = await uploadImageAction(file);
    return imageUrl;
  };

  const handleChangePlace = async (placeId: number) => {
    await changeLastPlaceAction(placeId);
    router.push(`/business/${businessId}/places/${placeId}/profile`);
  };


  const columns = [
    {
      header: t('id'),
      accessorKey: 'id',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div
            onClick={() => handleChangePlace(row.original.id)}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {row.original.id}
          </div>
        );
      }
    },
    {
      header: t('image'),
      accessorKey: 'image',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="w-[50px] p-2">
            {loadingId === row.original.id ? (
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-gray-100">
                <Loader className="animate-spin text-gray-500" size={24} />
              </div>
            ) : row.original.image ? (
              <div
                className="relative flex w-[50px] cursor-pointer items-center justify-center overflow-hidden rounded-md"
                onClick={() => handleImageClick(row.original)}
              >
                <Image
                  src={row.original.image}
                  alt={row.original.name}
                  width={50}
                  height={50}
                  className="rounded-md object-cover transition-opacity hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30">
                  <Camera
                    className="text-white opacity-0 transition-opacity hover:opacity-100"
                    size={20}
                  />
                </div>
              </div>
            ) : (
              <div
                className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
                onClick={() => handleImageClick(row.original)}
              >
                <ImagePlus className="text-gray-500" size={24} />
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('name'),
      accessorKey: 'name',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="p-2">
            {editingItemId === row.original.id && editingField === 'name' ? (
              <input
                type="text"
                value={editingName}
                onChange={handleNameChange}
                onKeyDown={(e) => handleNameKeyDown(e, row.original)}
                onBlur={() => handleNameSave(row.original)}
                autoFocus
                data-item-id={row.original.id}
                className="w-full rounded border border-gray-300 p-1"
                placeholder="Enter name"
              />
            ) : (
              <div
                onClick={() => handleNameClick(row.original)}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
              >
                {row.original.name}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('description'),
      accessorKey: 'description',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="p-2">
            {editingItemId === row.original.id &&
              editingField === 'description' ? (
              <input
                type="text"
                value={editingDescription}
                onChange={handleDescriptionChange}
                onKeyDown={(e) => handleDescriptionKeyDown(e, row.original)}
                onBlur={() => handleDescriptionSave(row.original)}
                autoFocus
                data-item-id={row.original.id}
                className="w-full rounded border border-gray-300 p-1"
                placeholder="Enter description"
              />
            ) : (
              <div
                onClick={() => handleDescriptionClick(row.original)}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
              >
                {row.original.description}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('slug'),
      accessorKey: 'slug',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="p-2">
            {editingItemId === row.original.id && editingField === 'slug' ? (
              <input
                type="text"
                value={editingSlug}
                onChange={handleSlugChange}
                onKeyDown={(e) => handleSlugKeyDown(e, row.original)}
                onBlur={() => handleSlugSave(row.original)}
                autoFocus
                data-item-id={row.original.id}
                className={`w-40 rounded border ${editingSlugError ? 'border-red-500' : 'border-gray-300'
                  } p-1`}
                placeholder="Enter slug"
              />
            ) : (
              <div
                onClick={() => handleSlugClick(row.original)}
                className="cursor-pointer rounded p-1 hover:bg-gray-100"
              >
                {row.original.slug}
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: t('visibility'),
      accessorKey: 'hidden',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={!row.original.hidden}
              onCheckedChange={(checked) =>
                handleHiddenToggle(row.original, !checked)
              }
              disabled={loadingId === row.original.id}
              aria-label={`Toggle visibility for ${row.original.name}`}
            />
            <Label className="text-sm text-gray-600">
              {row.original.hidden ? t('private') : t('public')}
            </Label>
          </div>
        );
      }
    },
    {
      header: t('actions'),
      accessorKey: 'actions',
      cell: ({ row }: { row: Row<Place> }) => {
        if (placeId === row.original.id.toString()) {
          return null;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleChangePlace(row.original.id)}
            >
              {t('select')}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="w-full space-y-2">
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (editingItemId !== null) {
            const place = places.find((p) => p.id === editingItemId);
            if (place) {
              handleImageChange(e, place);
            }
          }
        }}
      />

      <div className="mb-8 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                {t('addPlace')}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewPlace')}</DialogTitle>
                <DialogDescription>
                  {t('addPlaceDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {t('placeName')}
                  </label>
                  <Input
                    className="text-base"
                    id="name"
                    value={newPlaceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPlaceName(e.target.value)
                    }
                    placeholder={t('namePlaceholder')}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    {t('description')}
                  </label>
                  <Input
                    className="text-base"
                    id="description"
                    value={newPlacedescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPlacedescription(e.target.value)
                    }
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    {t('slug')}
                  </label>
                  <Input
                    className="text-base"
                    id="slug"
                    value={newPlaceSlug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setNewPlaceSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                    placeholder={t('slugPlaceholder')}
                  />
                  {slugError && (
                    <p className="text-sm text-red-500">{slugError}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <label htmlFor="image" className="text-sm font-medium">
                    {t('image')}
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewPlaceImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {imagePreview && (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 h-20 w-20 rounded-md object-cover"
                      width={80}
                      height={80}
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="mb-2 md:mb-0"
                  onClick={handleAddPlace}
                  disabled={isAddLoading}
                >
                  {isAddLoading ? t('adding') : t('add')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            className="flex items-center gap-2"
            onClick={() =>
              router.push(
                `/business/${places[0].business_id}/places/${placeId}/list/upload`
              )
            }
          >
            <Upload size={16} />
            {t('updatePlace')}
          </Button>
        </div>

        <SearchInput className="w-80" />
      </div>

      <div className="w-[90vw] overflow-x-auto md:w-full">
        <DataTable
          columns={columns}
          data={places}
          pageCount={Math.ceil(count / limit)}
          pageSize={limit}
          pageIndex={offset / limit}
          onPaginationChange={onPaginationChange}
        />
      </div>
    </div>
  );
}
