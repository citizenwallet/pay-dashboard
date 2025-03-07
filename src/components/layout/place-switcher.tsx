'use client';

import { useState, useEffect } from 'react';
import { ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { Place } from '@/db/places';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import {
  changeLastPlaceAction,
  createPlaceAction,
  generateUniqueSlugAction,
  uploadImageAction
} from '@/app/business/action';
import { createSlug } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Business } from '@/db/business';
import { useDebounce } from 'use-debounce';


export function PlaceSwitcher({
  places,
  business,
  lastPlace
}: {
  places: Place[] | null;
  business: Business;
  lastPlace: Place;
}) {
  const { isMobile } = useSidebar();

  const [activePlace, setActivePlace] = useState<Place | null>(lastPlace);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlacedescription, setNewPlacedescription] = useState('');

  const [newPlaceSlug, setNewPlaceSlug] = useState('');
  const [newPlaceImage, setNewPlaceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [debouncedPlaceName] = useDebounce(newPlaceName, 500);

  const router = useRouter();

  useEffect(() => {
    if (lastPlace && lastPlace.id !== activePlace?.id) {
      setActivePlace(lastPlace);
    }
  }, [lastPlace, activePlace]);

  const changePlace = async (place: Place) => {
    try {
      setActivePlace(place);
      await changeLastPlaceAction(place.id);
    } catch (error) {
      toast.error('Error with switching the place');
    } finally {
      router.push(`/business/${business.id}/places/${place.id}/orders`);
    }
  };
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

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Function to handle adding a new place
  const handleAddPlace = async () => {
    if (!newPlaceName.trim()) {
      toast.error('Please enter a place name.');
      return;
    }
    if (slugError) {
      toast.error('Please resolve the slug error before adding.');
      return;
    }

    try {
      const image = newPlaceImage ? await uploadImage(newPlaceImage) : '';
      const newPlace = await createPlaceAction(
        newPlaceName,
        newPlacedescription,
        newPlaceSlug,
        image
      );

      setIsAddDialogOpen(false);
      setActivePlace(newPlace);
      setIsOpen(false);
      router.push(`/business/${business.id}/places/${newPlace.id}/orders`);
    } catch (error: any) {
      toast.error(error.toString());
    } finally {
      setNewPlaceName('');
      setNewPlaceSlug('');
      setNewPlaceImage(null);
      setImagePreview('');
      setSlugTouched(false);
      setIsAddDialogOpen(false);
      setSlugError(null);
    }
  };

  //  upload function
  const uploadImage = async (file: File): Promise<string> => {
    const imageUrl = await uploadImageAction(file);
    return imageUrl;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Image
                src={activePlace?.image ?? '/shop.png'}
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover"
              />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activePlace?.name}
                </span>
              </div>
              {activePlace?.hidden == true ? (
                <Badge variant="destructive">Private</Badge>
              ) : (
                <Badge variant="secondary">Public</Badge>
              )}

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Places
            </DropdownMenuLabel>

            {places &&
              places.map((team) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => changePlace(team)}
                  className="flex items-center justify-between gap-2 p-2"
                >
                  <div className="flex items-center gap-2">
                    <Image
                      src={team.image ?? '/shop.png'}
                      alt="Logo"
                      width={26}
                      height={26}
                      className="h-6 w-6 rounded-md object-cover"
                    />

                    {team.name}
                  </div>

                  {team.hidden == true ? (
                    <Badge variant="destructive">Private</Badge>
                  ) : (
                    <Badge variant="secondary">Public</Badge>
                  )}
                </DropdownMenuItem>
              ))}

            <DropdownMenuSeparator />

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onSelect={(e) => e.preventDefault()} // Prevent dropdown from closing
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add place
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Place</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new place below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Place Name
                    </label>
                    <Input
                      id="name"
                      value={newPlaceName}
                      onChange={(e) => setNewPlaceName(e.target.value)}
                      placeholder="Enter place name"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={newPlacedescription}
                      onChange={(e) => setNewPlacedescription(e.target.value)}
                      placeholder="Enter place description"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="slug" className="text-sm font-medium">
                      Slug
                    </label>
                    <Input
                      id="slug"
                      value={newPlaceSlug}
                      onChange={(e) => {
                        setNewPlaceSlug(e.target.value);
                        setSlugTouched(true);
                      }}
                      placeholder="Enter slug"
                    />
                    {slugError && (
                      <p className="text-sm text-red-500">{slugError}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="image" className="text-sm font-medium">
                      Image
                    </label>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewPlaceImage(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 h-20 w-20 rounded-md object-cover"
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddPlace}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
