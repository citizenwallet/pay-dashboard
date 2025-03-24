'use client';
import SearchInput from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Place } from '@/db/places';
import { PaginationState, Row } from '@tanstack/react-table';
import { icons } from 'lucide-react';
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

export default function PlacesPage({
  place,
  offset,
  limit,
  search,
  count
}: {
  place: Place[];
  offset: number;
  limit: number;
  search: string | null;
  count: number;
}) {
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

  useEffect(() => {
    setPlaces(place);
  }, [place]);

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
      toast.success('Place name updated successfully');

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
      toast.success('Place description updated successfully');

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
        toast.success('Place visibility updated successfully');

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
        toast.error('Failed to update item image');
      } else {
        toast.success('Item image updated successfully');

        // Update the local state with the new image URL
        const updatedPlaces = places.map((p) =>
          p.id === place.id ? { ...p, image: imageUrl } : p
        );
        setPlaces(updatedPlaces);
      }
    } catch (error) {
      console.error('Failed to update item image:', error);
      toast.error('Failed to update item image');
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

  const columns = [
    {
      header: 'id',
      accessorKey: 'id',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <Link href={`/places/${row.original.id}`}>{row.original.id}</Link>
        );
      }
    },
    {
      header: 'Image',
      accessorKey: 'image',
      cell: ({ row }: { row: Row<Place> }) => {
        return (
          <div className="w-[50px] p-2">
            {loadingId === row.original.id ? (
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-gray-100">
                <icons.Loader
                  className="animate-spin text-gray-500"
                  size={24}
                />
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
                  <icons.Camera
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
                <icons.ImagePlus className="text-gray-500" size={24} />
              </div>
            )}
          </div>
        );
      }
    },
    {
      header: 'Name',
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
      header: 'Description',
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
      header: 'Slug',
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
                className={`w-40 rounded border ${
                  editingSlugError ? 'border-red-500' : 'border-gray-300'
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
      header: 'Visibility',
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
              {row.original.hidden ? 'Private' : 'Public'}
            </Label>
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

      <div className="flex justify-end">
        <SearchInput className="w-80" />
      </div>
      <div className="w-[95vw] overflow-x-auto md:w-full">
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
