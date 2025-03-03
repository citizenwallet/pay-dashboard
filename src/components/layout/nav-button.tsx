"use client";

import {
  Copy,
  Eye,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";

interface ProjectItem {
  name: string;
  icon: LucideIcon;
}

export function NavButton() {
  const { isMobile } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for modal

  const data: ProjectItem[] = [
    {
      name: "Make public",
      icon: Eye,
    },
    {
      name: "Copy checkout link",
      icon: Copy,
    },
  ];

  // Function to handle copying the checkout link
  const handleCopyCheckoutLink = () => {
    const checkoutUrl = "https://example.com/checkout"; // Replace with your dynamic URL if needed
    navigator.clipboard.writeText(checkoutUrl).then(() => {
      alert(`Copied to clipboard: ${checkoutUrl}`);
    }).catch((err) => {
      console.error("Failed to copy: ", err);
      alert("Failed to copy the link. Please try again.");
    });
  };

  // Function to handle "Yes" in the modal
  const handleMakePublicConfirm = () => {
    // Add your logic here for making something public (e.g., API call)
    console.log("Confirmed: Making public");
    setIsDialogOpen(false); // Close the modal
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {data.map((item) => (
          <SidebarMenuItem key={item.name}>
            {item.name === "Make public" ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      Do you want to make this item public? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      No
                    </Button>
                    <Button onClick={handleMakePublicConfirm}>Yes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <SidebarMenuButton
                onClick={() => {
                  if (item.name === "Copy checkout link") {
                    handleCopyCheckoutLink();
                  }
                }}
              >
                <item.icon />
                <span>{item.name}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}