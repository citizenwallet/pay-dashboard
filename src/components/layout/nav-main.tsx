'use client';

import {
  BanknoteIcon,
  BoxesIcon,
  ChevronRight,
  QrCode,
  Settings,
  ShoppingCartIcon,
  SmartphoneNfcIcon,
  User,
  type LucideIcon
} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Place } from '@/db/places';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Define the interface for sidebar items
interface SidebarItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items: SidebarSubItem[];
}

interface SidebarSubItem {
  title: string;
  url: string;
}

// Reusable component for sidebar menu items
function SidebarMenuItems({
  items,
  activePath
}: {
  items: SidebarItem[];
  activePath: string;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const mainPath =
          activePath.split('/').length > 2
            ? activePath.split('/').slice(0, -1).join('/')
            : activePath;
        const isActive = item.url.endsWith(mainPath);

        return (
          <Collapsible
            key={item.url}
            asChild
            defaultOpen={isActive}
            className="group/collapsible"
          >
            {item.items.length > 0 ? (
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && (
                      <item.icon
                        className={cn(
                          isActive ? 'font-bold text-gray-950' : 'opacity-90'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        isActive ? 'font-bold text-gray-950' : 'text-gray-700'
                      )}
                    >
                      {item.title}
                    </span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = subItem.url.endsWith(activePath);
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span
                                className={cn(
                                  isSubActive
                                    ? 'font-bold text-gray-950'
                                    : 'text-gray-700'
                                )}
                              >
                                {subItem.title}
                              </span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <Link href={item.url}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && (
                        <item.icon
                          className={cn(
                            isActive ? 'font-bold text-gray-950' : 'opacity-90'
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          isActive ? 'font-bold text-gray-950' : 'text-gray-700'
                        )}
                      >
                        {item.title}
                      </span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </Link>
              </SidebarMenuItem>
            )}
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}

export function NavMain({
  businessId,
  lastPlace
}: {
  businessId: number;
  lastPlace: Place;
}) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();

  console.log(pathname);

  const data: SidebarItem[] = [
    {
      title: t('profile'),
      url: `/business/${businessId}/places/${lastPlace.id}/profile`,
      icon: User,
      items: []
    },
    {
      title: t('qrcode'),
      url: `/business/${businessId}/places/${lastPlace.id}/qr`,
      icon: QrCode,
      items: [
        {
          title: t('light'),
          url: `/business/${businessId}/places/${lastPlace.id}/qr/light`
        },
        {
          title: t('dark'),
          url: `/business/${businessId}/places/${lastPlace.id}/qr/dark`
        }
      ]
    }
  ];

  const salesData: SidebarItem[] = [
    {
      title: t('orders'),
      url: `/business/${businessId}/places/${lastPlace.id}/orders`,
      icon: BoxesIcon,
      items: []
    },
    {
      title: t('checkout'),
      url: `/business/${businessId}/places/${lastPlace.id}/checkout`,
      icon: ShoppingCartIcon,
      items: []
    },
    {
      title: t('terminal'),
      url: `/business/${businessId}/places/${lastPlace.id}/pos`,
      icon: SmartphoneNfcIcon,
      items: []
    },
    {
      title: t('payouts'),
      url: `/business/${businessId}/places/${lastPlace.id}/payouts`,
      icon: BanknoteIcon,
      items: []
    }
  ];

  const adminData: SidebarItem[] = [
    {
      title: t('manage'),
      url: `/business/${businessId}/places/${lastPlace.id}/manage`,
      icon: Settings,
      items: []
    }
  ];

  const activePath = pathname.split('/places/').pop() || '';

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t('place')}</SidebarGroupLabel>
      <SidebarMenuItems items={data} activePath={activePath} />

      <SidebarGroupLabel>{t('sales')}</SidebarGroupLabel>
      <SidebarMenuItems items={salesData} activePath={activePath} />

      <SidebarGroupLabel>{t('admin')}</SidebarGroupLabel>
      <SidebarMenuItems items={adminData} activePath={activePath} />
    </SidebarGroup>
  );
}
