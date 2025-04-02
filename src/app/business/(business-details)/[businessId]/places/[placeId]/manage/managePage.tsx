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
import { EyeOff, Archive, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import {
  deletePlaceAction,
  handleArchiveToggleAction,
  handleVisibilityToggleAction
} from './action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ManagePage({
  place,
  hasOrders
}: {
  place: Place | null;
  hasOrders: boolean;
}) {
  const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
        `${t('Placehasbeen')} ${actionMessage} ${t('andarchivedsuccessfully')}`
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

      toast.success(`${t('placedeletedsuccessfully')}`);

      setIsDeleteDialogOpen(false);
      router.push('/');
    } catch (error) {
      toast.error(`${t('errorplacedelete')}`);
    }
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
                  {t('Unarchive')}
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  {t('Archive')}
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
                {loading ? t('Archiving') : t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!hasOrders && (
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
    </div>
  );
}
