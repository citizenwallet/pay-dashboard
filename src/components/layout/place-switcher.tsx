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

  const changePlace = (place:Place)=>{
    console.log("change place")
    console.log(place)
    setActiveTeam(place)
  }
  // Function to handle adding a new place (e.g., API call)
  const handleAddPlace = () => {
    if (!newPlaceName.trim()) {
      alert("Please enter a place name.");
      return;
    }
    const newPlace: Place = {
      name: newPlaceName,
      id: 0,
      created_at: "",
      business_id: 0,
      slug: "",
      accounts: [],
      invite_code: null,
      terminal_id: null,
      image: null,
      description: null
    };
    console.log("Adding new place:", newPlace);
    // Here you’d typically call an API to save the new place
    // For now, we’ll just log it and close the modal
    setNewPlaceName(""); // Reset input
    setIsAddDialogOpen(false); // Close modal
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
                  {/* Add more fields here if needed */}
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
