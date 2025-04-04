'use client';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Business } from '@/db/business';
import { Place } from '@/db/places';
import { ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function PlaceSwitcher({
  business,
  lastPlace
}: {
  business: Business;
  lastPlace: Place;
}) {
  const [activePlace, setActivePlace] = useState<Place | null>(lastPlace);

  const router = useRouter();
  const t = useTranslations('navButton');

  const changePlace = async (place: Place) => {
    try {
      router.push(`/business/${business.id}/places/${place.id}/list`);
    } catch (error) {
      toast.error('Error with switching the place');
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className=" data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => activePlace && changePlace(activePlace)}
            >
              <Image
                src={activePlace?.image ?? '/shop.png'}
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover"
              />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activePlace?.name}
                </span>
              </div>
              {activePlace?.hidden == true ? (
                <Badge variant="destructive">{t('private')}</Badge>
              ) : (
                <Badge variant="secondary">{t('public')}</Badge>
              )}

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
