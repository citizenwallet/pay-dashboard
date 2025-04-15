'use client';

import { Copy, Eye, EyeOff, Check } from 'lucide-react';

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
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { Place } from '@/db/places';
import { handleVisibilityToggleAction } from '@/app/business/(business-details)/[businessId]/places/[placeId]/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function NavButton({ lastPlace }: { lastPlace: Place }) {
  const [copied, setCopied] = useState(false);
  const [copiedOrdersFeed, setCopiedOrdersFeed] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations('navButton');

  const handleCopyCheckoutLink = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);

    const checkoutUrl = `${process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL}/${lastPlace.slug}`;
    navigator.clipboard
      .writeText(checkoutUrl)
      .then(() => {
        toast.success(t('linkCopied'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error(t('failedToCopy'));
      });
  };

  const handleCopyOrdersFeedLink = () => {
    setCopiedOrdersFeed(true);
    setTimeout(() => {
      setCopiedOrdersFeed(false);
    }, 1000);

    const ordersFeedUrl = `${process.env.NEXT_PUBLIC_CHECKOUT_BASE_URL}/${lastPlace.slug}/orders`;
    navigator.clipboard
      .writeText(ordersFeedUrl)
      .then(() => {
        toast.success(t('linkCopied'));
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
        toast.error(t('failedToCopy'));
      });
  };

  const handleVisibilityToggle = async () => {
    try {
      setIsDialogOpen(false);
      await handleVisibilityToggleAction(lastPlace.id);
      toast.success(
        `${t('place')} ${lastPlace.hidden ? t('public') : t('private')} ${t(
          'successfully'
        )}`
      );
      router.refresh();
    } catch (error) {
      toast.error(`${t('errorVisibilityToggle')}`);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <SidebarMenuButton>
                {lastPlace.hidden ? <Eye /> : <EyeOff />}
                <span>
                  {lastPlace.hidden ? t('makePublic') : t('makePrivate')}
                </span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('areYouSure')}</DialogTitle>
                <DialogDescription>
                  {`${t('doYouWantTo')} ${
                    lastPlace.hidden
                      ? t('makePublicDescription')
                      : t('makePrivateDescription')
                  }?`}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {t('no')}
                </Button>
                <Button onClick={handleVisibilityToggle}>{t('yes')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!lastPlace.archived && (
            <SidebarMenuButton
              onClick={handleCopyCheckoutLink}
              className={cn(
                'transition-all',
                copied ? 'border border-green-500' : ''
              )}
            >
              {copied ? <Check /> : <Copy />}
              <span>{t('copyCheckoutLink')}</span>
            </SidebarMenuButton>
          )}
          {!lastPlace.archived && (
            <SidebarMenuButton
              onClick={handleCopyOrdersFeedLink}
              className={cn(
                'transition-all',
                copiedOrdersFeed ? 'border border-green-500' : ''
              )}
            >
              {copiedOrdersFeed ? <Check /> : <Copy />}
              <span>{t('copyOrdersFeedLink')}</span>
            </SidebarMenuButton>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
