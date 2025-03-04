'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { NavMain } from "./nav-main";
import {
  ChevronsUpDown,
  GalleryVerticalEnd,
  LogOut,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import { Breadcrumbs } from '../breadcrumbs';
import ThemeToggle from './ThemeToggle/theme-toggle';
import { UserNav } from './user-nav';
import { Logo } from '@/components/logo';
import { signOut } from 'next-auth/react';
import { PlaceSwitcher } from "./place-switcher";
import { NavButton } from './nav-button';
import { Place } from '@/db/places';

export const company = {
  name: 'Brussels Pay',
  logo: GalleryVerticalEnd,
  plan: 'Business'
};

export default function AppSidebar({
  isAdmin,
  places,
  bussinessid,
  lastid,
  children
}: {
  isAdmin: boolean;
  places:Place[] | null;
  bussinessid:number;
  lastid:Place;
  children: React.ReactNode;
}) {

  const { data: session } = useSession();

  return (
    <SidebarProvider>

      <Sidebar collapsible="icon">
        {isAdmin && (
          <div className="align-center flex w-full justify-center bg-orange-500 text-sm font-normal">
            SYSTEM ADMIN
          </div>
        )}
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{company.name}</span>
              <span className="truncate text-xs">{company.plan}</span>

            </div>
          </div>

          <PlaceSwitcher bussinessid={bussinessid} places={places} lastid={lastid}/>

        </SidebarHeader>

        <SidebarContent>
          <NavButton lastplace={lastid}/>
          <NavMain businessId={bussinessid} lastid={lastid}/>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={session?.user?.image || ''}
                        alt={session?.user?.name || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                          'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name || ''}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user?.email || ''}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={session?.user?.image || ''}
                          alt={session?.user?.name || ''}
                        />
                        <AvatarFallback className="rounded-lg">
                          {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                            'CN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {session?.user?.name || ''}
                        </span>
                        <span className="truncate text-xs">
                          {' '}
                          {session?.user?.email || ''}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />


                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2 px-4">
            <UserNav />
            <ThemeToggle />
          </div>
        </header>
        {/* page main content */}
        {children}
      </SidebarInset>

    </SidebarProvider>
  );
}
