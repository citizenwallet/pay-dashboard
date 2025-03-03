"use client"

import * as React from "react"
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Place } from "@/db/places"
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button"

export function PlaceSwitcher({
  places,
}: {
  places: Place[] | null
}) {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState<Place | null>(
    places && places.length > 0 ? places[0] : null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newPlaceName, setNewPlaceName] = React.useState("");
  const [newPlaceDescription, setNewPlaceDescription] = React.useState("");
  const [newPlaceSlug, setNewPlaceSlug] = React.useState("");
  const [newPlaceImage, setNewPlaceImage] = React.useState<File | null>(null); // Store the File object
  const [imagePreview, setImagePreview] = React.useState<string>(""); // Preview URL

  const [slugTouched, setSlugTouched] = React.useState(false);

  const changePlace = (place: Place) => {
    console.log("change place")
    console.log(place)
    setActiveTeam(place)
  }
  // Auto-generate slug from name if not touched
  React.useEffect(() => {
    if (!slugTouched && newPlaceName) {
      setNewPlaceSlug(newPlaceName.toLowerCase().replace(/\s+/g, "-"));
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
      alert("Please enter a place name.");
      return;
    }
    const newPlace = {
      name: newPlaceName,
      description: newPlaceDescription || undefined,
      slug: newPlaceSlug || undefined,
      image: newPlaceImage ? await uploadImage(newPlaceImage) : undefined, // Upload logic
    };
    console.log("Adding new place:", newPlace);
    // Reset form
    setNewPlaceName("");
    setNewPlaceDescription("");
    setNewPlaceSlug("");
    setNewPlaceImage(null);
    setImagePreview("");
    setSlugTouched(false);
    setIsAddDialogOpen(false);
  };

  // Dummy upload function (replace with actual API call)
  const uploadImage = async (file: File): Promise<string> => {
    // Simulate upload to a server (e.g., Supabase, AWS S3, etc.)
    const formData = new FormData();
    formData.append("image", file);
    // Example: await fetch("/api/upload", { method: "POST", body: formData });
    return `https://example.com/uploads/${file.name}`; // Return uploaded URL
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam?.name || "Select a place"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Places
            </DropdownMenuLabel>

            {places && places.map((team) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => changePlace(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <GalleryVerticalEnd className="size-4 shrink-0" />
                </div>
                {team.name}
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
                  <div className="font-medium text-muted-foreground">Add place</div>
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
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Input
                      id="description"
                      value={newPlaceDescription}
                      onChange={(e) => setNewPlaceDescription(e.target.value)}
                      placeholder="Enter description"
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
                        setSlugTouched(true); // Mark as touched when user edits
                      }}
                      placeholder="Enter slug"
                    />
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
                        className="mt-2 h-20 w-20 object-cover rounded-md"
                      />
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
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
  )
}
