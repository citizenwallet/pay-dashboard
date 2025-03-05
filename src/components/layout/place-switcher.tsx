'use client';

import * as React from 'react';
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from 'lucide-react';

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

export function PlaceSwitcher({
  places,
  business,
  lastid
}: {
  places: Place[] | null;
  business: Business;
  lastid: Place;
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState<Place | null>(
    places && places.length > 0 ? places[0] : null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newPlaceName, setNewPlaceName] = React.useState('');
  const [newPlacedescription, setNewPlacedescription] = React.useState('');

  const [newPlaceSlug, setNewPlaceSlug] = React.useState('');
  const [newPlaceImage, setNewPlaceImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [slugError, setSlugError] = React.useState<string | null>(null);

  const router = useRouter();

  const changePlace = async (place: Place) => {
    try {
      setActiveTeam(place);
      await changeLastPlaceAction(place.id);
    } catch (error) {
      toast.error('Error with switching the place');
    } finally {
      router.push(`/business/${business.id}/places/${place.id}/orders`);
    }
  };
  // Auto-generate slug from name if not touched
  React.useEffect(() => {
    if (!slugTouched && newPlaceName) {
      const baseSlug = createSlug(newPlaceName);
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
  }, [newPlaceName, slugTouched]);

  // Clean up preview URL when component unmounts or image changes
  React.useEffect(() => {
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
      const data = await createPlaceAction(
        newPlaceName,
        newPlacedescription,
        newPlaceSlug,
        image
      );
      toast.success('New Place added');
      router.refresh();
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {lastid.image && (
                <Image src={lastid.image} alt="Logo" width={32} height={32} />
              )}

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{lastid.name}</span>
              </div>
              {lastid.hidden == true ? (
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
                    {team.image && (
                      <Image
                        src={team.image}
                        alt="Logo"
                        width={26}
                        height={26}
                      />
                    )}
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
