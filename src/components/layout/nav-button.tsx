'use client';

import { Copy, Eye, EyeOff, type LucideIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { Place } from '@/db/places';
import { handleVisibilityToggleAction } from '@/app/business/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ProjectItem {
  name: string;
  icon: LucideIcon;
}

export function NavButton({ lastplace }: { lastplace: Place }) {
  const { isMobile } = useSidebar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  // Dynamic button data based on hidden status
  const data: ProjectItem[] = [
    {
      name: lastplace.hidden ? 'Make public' : 'Make hidden',
      icon: lastplace.hidden ? Eye : EyeOff
    },
    ...(lastplace.archived === false
      ? [
          {
            name: 'Copy checkout link',
            icon: Copy
          }
        ]
      : [])
  ];

  const handleCopyCheckoutLink = () => {

    const checkoutUrl = `${process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL}/${lastplace.slug}`;
    navigator.clipboard
      .writeText(checkoutUrl)
      .then(() => {
        toast.success(`Copied to clipboard: ${checkoutUrl}`);
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error('Failed to copy the link. Please try again.');
      });
  };

  const handleVisibilityToggle = async () => {
    try {
      setIsDialogOpen(false);
      const data = await handleVisibilityToggleAction(lastplace.id);
      toast.success(
        `Place ${lastplace.hidden ? 'public' : 'hidden'} successfully`
      );
      router.refresh();
    } catch (error) {
      toast.error('Error with handle Visibility Toggle the place');
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {data.map((item) => (
          <SidebarMenuItem key={item.name}>
            {item.name === 'Make public' || item.name === 'Hide' ? (
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
                      {`Do you want to ${
                        lastplace.hidden
                          ? 'making a place public, it will be visible in all public listings'
                          : 'hiding this place, it is still active but not visible in public listings anymore'
                      }?`}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      No
                    </Button>
                    <Button onClick={handleVisibilityToggle}>Yes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <SidebarMenuButton onClick={handleCopyCheckoutLink}>
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
