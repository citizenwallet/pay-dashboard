'use client';

import {
  BookOpen,
  Bot,
  BoxesIcon,
  ChevronRight,
  LayoutDashboard,
  PanelBottomClose,
  QrCode,
  Settings2,
  ShoppingCartIcon,
  SquareTerminal,
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

export function NavMain({
  businessId,
  lastPlace
}: {
  businessId: number;
  lastPlace: Place;
}) {
  const data = [
    {
      title: 'Orders',
      url: `/business/${businessId}/places/${lastPlace.id}/orders`,
      icon: BoxesIcon,
      isActive: true,
      items: []
    },
    {
      title: 'Checkout',
      url: `/business/${businessId}/places/${lastPlace.id}/checkout`,
      icon: ShoppingCartIcon,
      items: []
    },
    {
      title: 'Profile',
      url: `/business/${businessId}/places/${lastPlace.id}/profile`,
      icon: User,
      items: []
    },
    {
      title: 'Manage',
      url: `/business/${businessId}/places/${lastPlace.id}/manage`,
      icon: Settings2,
      items: []
    },
    {
      title: 'QR Code',
      url: `#`,
      icon: QrCode,
      items: [
        {
          title: 'Light',
          url: `/business/${businessId}/places/${lastPlace.id}/qr/light`
        },
        {
          title: 'Dark',
          url: `/business/${businessId}/places/${lastPlace.id}/qr/dark`
        }
      ]
    },
    {
      title: 'Payouts',
      url: `/business/${businessId}/places/${lastPlace.id}/payouts`,
      icon: PanelBottomClose,
      items: []
    }
  ];
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Place</SidebarGroupLabel>
      <SidebarMenu>
        {data.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            {item.items.length > 0 ? (
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <Link href={item.url}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                </Link>
              </SidebarMenuItem>
            )}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
