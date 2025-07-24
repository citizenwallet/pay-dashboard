'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Place } from '@/db/places';
import { formatAddress } from '@/lib/address';
import { Archive, Check, Copy, ExternalLink, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deletePlaceAction,
  handleArchiveToggleAction,
  handleVisibilityToggleAction
} from './action';



export default function ManagePage({
  place,
  hasOrders,
  isOwner
}: {
  place: Place | null;
  hasOrders: boolean;
  isOwner: boolean;
}) {
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const t = useTranslations('manage');

  const handleHide = async (lastplace: Place) => {
    try {
      const data = await handleVisibilityToggleAction(lastplace.id);
      toast.success(
        `${t('place')} ${lastplace.hidden ? t('public') : t('hidden')} ${t(
          'successfully'
        )}`
      );
      setIsHideDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`${t('errorVisibilityToggle')}`);
    }
  };

  const handleArchive = async (place: Place) => {
    try {
      const data = await handleArchiveToggleAction(place.id);
      const actionMessage = place.hidden ? 'Hidden' : 'Unhidden';
      toast.success(
        `${t('placeHasBeen')} ${actionMessage} ${t('andArchivedSuccessfully')}`
      );
      setIsArchiveDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(`${t('errorArchiveToggle')}`);
    }
  };

  const handleDelete = async (place: Place) => {
    try {
      await deletePlaceAction(place.id);

      toast.success(`${t('placeDeletedSuccessfully')}`);

      setIsDeleteDialogOpen(false);
      router.push('/');
    } catch (error) {
      toast.error(`${t('errorPlaceDelete')}`);
    }
  };

  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-gray-600">{t('hideDescription')}</p>
        <Dialog open={isHideDialogOpen} onOpenChange={setIsHideDialogOpen}>
          <DialogTrigger asChild>
            {place?.hidden ? (
              <Button variant="outline" disabled={loading}>
                <Eye className="mr-2 h-4 w-4" />
                {t('makePublic')}
              </Button>
            ) : (
              <Button variant="outline" disabled={loading}>
                <EyeOff className="mr-2 h-4 w-4" />
                {t('hide')}
              </Button>
            )}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirmHide')}</DialogTitle>
              <DialogDescription>
                {place?.hidden
                  ? t('confirmHideDescription')
                  : t('notconfirmHideDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHideDialogOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                className="mb-2 md:mb-0"
                disabled={loading}
                onClick={() => handleHide(place!)}
              >
                {loading ? t('hidding') : t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <p className="mb-2 text-gray-600">{t('archiveDescription')}</p>
        <Dialog
          open={isArchiveDialogOpen}
          onOpenChange={setIsArchiveDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" disabled={loading}>
              {place?.archived ? (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('unarchive')}
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('archive')}
                </>
              )}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirmArchive')}</DialogTitle>
              <DialogDescription>
                {t('confirmArchiveDescription')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsArchiveDialogOpen(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                className="mb-2 md:mb-0"
                disabled={loading}
                onClick={() => handleArchive(place!)}
              >
                {loading ? t('archiving') : t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!hasOrders && isOwner && (
        <div>
          <p className="mb-2 text-gray-600">{t('deleteDescription')}</p>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={loading}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('delete')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('confirmDelete')}</DialogTitle>
                <DialogDescription>
                  {t('confirmDeleteDescription')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  disabled={loading}
                  onClick={() => handleDelete(place!)}
                >
                  {loading ? t('deleting') : t('confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div>
        <p className="mb-2 text-gray-600">{t('accountsDescription')}</p>
        <div className="space-y-2">
          {place?.accounts?.map((address, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 cursor-pointer hover:bg-muted rounded-md p-1"
                onClick={() => copyToClipboard(address)}
              >
                {formatAddress(address)}
                {isCopied ? (
                  <Check className="ml-1 h-3 w-3" />
                ) : (
                  <Copy className="ml-1 h-3 w-3" />
                )}
              </div>

              <Link
                href={`https://gnosisscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 ml-2"
                title={address}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
