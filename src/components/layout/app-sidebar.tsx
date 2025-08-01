'use client';
import { getUserFromSessionAction } from '@/actions/session';
import { Logo } from '@/components/logo';
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
import { Business } from '@/db/business';
import { Place } from '@/db/places';
import { User } from '@/db/users';
import { ArrowLeft, ChevronsUpDown, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NavButton } from './nav-button';
import { NavMain } from './nav-main';
import { PlaceSwitcher } from './place-switcher';
import { UserNav } from './user-nav';
import LanguageSwitcher from './language-switcher';
import { useTranslations } from 'next-intl';

export default function AppSidebar({
  isAdmin,
  user: initialUser,
  business,
  place: initialPlace,
  isOwner,
  children
}: {
  isAdmin?: boolean;
  user?: User | null;
  business: Business | null;
  place: Place;
  isOwner: boolean;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null | undefined>(initialUser);
  const [place, setPlace] = useState<Place | null>(initialPlace);
  const session = useSession();
  const t = useTranslations('sidebar');

  useEffect(() => {
    if (session.status === 'authenticated' && !user) {
      getUserFromSessionAction().then((user) => {
        setUser(user);
      });
    }

    setPlace(initialPlace);
  }, [session, user, initialPlace]);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {isAdmin && (
          <div className="align-center flex w-full justify-center bg-orange-500 text-sm font-normal">
            {t('systemAdmin')}
          </div>
        )}
        <SidebarHeader>
          <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
            <Link href="/business">
              <ArrowLeft />
            </Link>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{business?.name}</span>
              <span className="truncate text-xs">{business?.vat_number}</span>
            </div>
          </div>

          {business && place && (
            <PlaceSwitcher business={business} place={place} />
          )}
        </SidebarHeader>

        <SidebarContent>
          {place && <NavButton place={place} />}
          {business && place && (
            <NavMain businessId={business.id} place={place} isOwner={isOwner} />
          )}
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
                        src={user?.avatar || ''}
                        alt={user?.name || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || ''}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email || ''}
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
                          src={user?.avatar || ''}
                          alt={user?.name || ''}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.name || ''}
                        </span>
                        <span className="truncate text-xs">
                          {user?.email || ''}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut />
                    {t('logout')}
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
          </div>

          <div className="flex items-center gap-2 px-4">
            {user && (
              <UserNav businessId={business?.id} place={place} user={user} />
            )}
            <LanguageSwitcher />
          </div>
        </header>
        {/* page main content */}
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
