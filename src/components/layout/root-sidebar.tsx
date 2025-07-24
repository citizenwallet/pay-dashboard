'use client';
import { getUserFromSessionAction } from '@/actions/session';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { User } from '@/db/users';
import {
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LanguageSwitcher from './language-switcher';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';

export default function RootAppSidebar({
  isAdmin,
  user: initialUser,
  children
}: {
  isAdmin?: boolean;
  user?: User | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null | undefined>(initialUser);

  const session = useSession();
  const pathname = usePathname();
  const t = useTranslations('rootsidebar');

  useEffect(() => {
    if (session.status === 'authenticated' && !user) {
      getUserFromSessionAction().then((user) => {
        setUser(user);
      });
    }
  }, [session, user]);

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
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Logo />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === '/business'}
                  >
                    <Link href="/business">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>{t('business')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isAdmin && (
                  <Collapsible
                    key={'/business/payouts'}
                    asChild
                    defaultOpen={pathname === '/business/payouts'}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip="payouts">
                          <CreditCard className="h-4 w-4" />

                          <span
                            className={cn(
                              pathname === '/business/payouts'
                                ? 'font-bold text-gray-950'
                                : 'text-gray-700'
                            )}
                          >
                            {t('payouts')}
                          </span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem key="Pending">
                            <SidebarMenuSubButton asChild>
                              <Link href="/business/pending">
                                <span
                                  className={cn(
                                    pathname === '/business/pending'
                                      ? 'font-bold text-gray-950'
                                      : 'text-gray-700'
                                  )}
                                >
                                  {t('pending')}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>

                          <SidebarMenuSubItem key="History ">
                            <SidebarMenuSubButton asChild>
                              <Link href="/business/payouts">
                                <span
                                  className={cn(
                                    pathname === '/business/payouts'
                                      ? 'font-bold text-gray-950'
                                      : 'text-gray-700'
                                  )}
                                >
                                  {t('history')}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          <div className="flex items-center gap-2 px-4">
            {user && <UserNav user={user} />}
            <LanguageSwitcher />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
