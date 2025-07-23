'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { icons, Trash, Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Pos } from '@/db/pos';
import {
  addVivaPosAction,
  checkPlaceIdAlreadyExistsAction,
  deletePosAction,
  updatePosAction,
  setPosActiveAction
} from './action';
import { useDebounce } from 'use-debounce';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';

export default function PosListing({
  placeId,
  items = []
}: {
  placeId: number;
  items?: Pos[];
}) {
  const t = useTranslations('pos');
  const [posItems, setPosItems] = useState(items);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [terminalToDelete, setTerminalToDelete] = useState<string | null>(null);
  const [terminalToDeactivate, setTerminalToDeactivate] = useState<
    string | null
  >(null);

  const [posName, setPosName] = useState('');
  const [posId, setPosId] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingType, setEditingType] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [handleAddButton, setHandleAddButton] = useState(true);
  const [debouncedPlaceId] = useDebounce(posId, 500);

  // Inline Edit Handlers
  const handleEditClick = (item: Pos, field: string) => {
    setEditingItemId(item.id);
    setEditingField(field);
    setEditingName(item.name);
    setEditingType(item.type || '');
  };

  // Update a POS terminal
  const handleSave = async (item: Pos) => {
    setLoading(item.id);

    try {
      // Check if any value has changed
      const hasChanged = item.name !== editingName || item.type !== editingType;

      if (!hasChanged) {
        return;
      }

      const updatedPos = {
        name: editingName,
        type: editingType
      };

      const res = await updatePosAction(
        item.id,
        updatedPos.name,
        placeId,
        updatedPos.type
      );

      if (res.error) {
        toast.error(res.error.message);
        return;
      }

      setPosItems((prev) =>
        prev.map((pos) =>
          pos.id === item.id ? { ...pos, ...updatedPos } : pos
        )
      );
      toast.success(t('terminalUpdatedSuccessfully'));
    } catch (error) {
      toast.error(t('errorUpdatingTerminal'));
    } finally {
      setLoading(null);
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  // Delete a POS terminal
  const handleDelete = async (id: string) => {
    setTerminalToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!terminalToDelete) return;

    setLoading(terminalToDelete);
    try {
      const res = await deletePosAction(terminalToDelete, placeId);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('terminalDeletedSuccessfully'));
      setPosItems((prev) =>
        prev.filter((item) => item.id !== terminalToDelete)
      );
    } catch (error) {
      toast.error(t('errorDeletingTerminal'));
    } finally {
      setLoading(null);
      setIsDeleteDialogOpen(false);
      setTerminalToDelete(null);
    }
  };

  // Toggle terminal active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      // If currently active, show deactivation confirmation
      setTerminalToDeactivate(id);
      setIsDeactivateDialogOpen(true);
    } else {
      // If currently inactive, activate immediately
      setLoading(id);
      try {
        const res = await setPosActiveAction(id, placeId, true);

        if (res.error) {
          toast.error(res.error.message);
          return;
        }

        setPosItems((prev) =>
          prev.map((pos) => (pos.id === id ? { ...pos, is_active: true } : pos))
        );
        toast.success(t('terminalActivatedSuccessfully'));
      } catch (error) {
        toast.error(t('errorUpdatingTerminalStatus'));
      } finally {
        setLoading(null);
      }
    }
  };

  const confirmDeactivate = async () => {
    if (!terminalToDeactivate) return;

    setLoading(terminalToDeactivate);
    try {
      const res = await setPosActiveAction(
        terminalToDeactivate,
        placeId,
        false
      );

      if (res.error) {
        toast.error(res.error.message);
        return;
      }

      setPosItems((prev) =>
        prev.map((pos) =>
          pos.id === terminalToDeactivate ? { ...pos, is_active: false } : pos
        )
      );
      toast.success(t('terminalDeactivatedSuccessfully'));
    } catch (error) {
      toast.error(t('errorUpdatingTerminalStatus'));
    } finally {
      setLoading(null);
      setIsDeactivateDialogOpen(false);
      setTerminalToDeactivate(null);
    }
  };

  // Add a new POS terminal
  const handleAddPlace = async () => {
    try {
      if (!posId || !posName) {
        toast.error(t('pleaseEnterDetails'));
        return;
      }
      const res = await addVivaPosAction(posId, posName, placeId);

      setPosId('');
      setPosName('');
      setIsAddDialogOpen(false);

      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success(t('terminalAddedSuccessfully'));
      setPosItems((prev) => [...prev, res.data as Pos]);
    } catch (error) {
      toast.error(error as string);
    }
  };

  // Check if the POS terminal Id already exists
  useEffect(() => {
    const checkPlaceIdAlreadyExists = async () => {
      if (!debouncedPlaceId) return; // Avoid calling API if ID is empty

      try {
        const res = await checkPlaceIdAlreadyExistsAction(debouncedPlaceId);
        if (res) {
          setHandleAddButton(false);
        } else {
          setHandleAddButton(true);
          toast.error(t('terminalIdAlreadyExists'));
        }
      } catch (error) {
        console.error('Error checking place ID:', error);
      }
    };

    checkPlaceIdAlreadyExists();
  }, [debouncedPlaceId, t]);

  return (
    <div className="w-full">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 flex items-center gap-2">
            <icons.Plus size={16} />
            {t('addTerminal')}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addTerminal')}</DialogTitle>
            <DialogDescription>{t('addTerminalDescription')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="id" className="text-sm font-medium">
                {t('id')}
              </label>
              <Input
                id="id"
                type="text" // Changed to text since id is a string
                value={posId}
                onChange={(e) => setPosId(e.target.value)}
                placeholder={t('enterTerminalId')}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('name')}
              </label>
              <Input
                id="name"
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                placeholder={t('enterTerminalName')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button disabled={handleAddButton} onClick={handleAddPlace}>
              {t('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteTerminal')}</DialogTitle>
            <DialogDescription>
              {t('deleteTerminalDescription')}
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
              onClick={confirmDelete}
              disabled={loading === terminalToDelete}
            >
              {loading === terminalToDelete ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                t('delete')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deactivateTerminal')}</DialogTitle>
            <DialogDescription>
              {t('deactivateTerminalDescription')}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeactivateDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeactivate}
              disabled={loading === terminalToDeactivate}
            >
              {loading === terminalToDeactivate ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                t('deactivate')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-[90vw] overflow-x-auto md:w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left min-w-20">{t('id')}</th>
              <th className="border p-2 text-left min-w-20">{t('name')}</th>
              <th className="border p-2 text-left min-w-20">{t('type')}</th>
              <th className="border p-2 text-left min-w-20">{t('createdAt')}</th>
              <th className="border p-2 text-left min-w-20">{t('active')}</th>
              <th className="border p-2 text-left min-w-20">{t('action')}</th>
            </tr>
          </thead>

          <tbody>
            {posItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border p-2">{item.id} </td>

                <td className="border p-2">
                  {editingItemId === item.id && editingField === 'name' ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => handleSave(item)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(item)}
                      autoFocus
                      className="w-full rounded border border-gray-300 p-1"
                    />
                  ) : (
                    <div
                      onClick={() => handleEditClick(item, 'name')}
                      className="cursor-pointer rounded p-1 hover:bg-gray-100"
                    >
                      {item.name}
                    </div>
                  )}
                </td>

                <td className="border p-2">
                  {editingItemId === item.id && editingField === 'type' ? (
                    <input
                      type="text"
                      value={editingType}
                      onChange={(e) => setEditingType(e.target.value)}
                      onBlur={() => handleSave(item)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave(item)}
                      autoFocus
                      className="w-full rounded border border-gray-300 p-1"
                    />
                  ) : (
                    <div
                      onClick={() => handleEditClick(item, 'type')}
                      className="cursor-pointer rounded p-1 hover:bg-gray-100"
                    >
                      {item.type || (
                        <span className="italic text-gray-400">
                          {t('noType')}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="border p-2">
                  {new Date(item.created_at).toLocaleDateString()}{' '}
                  {new Date(item.created_at).toLocaleTimeString()}
                </td>

                <td className="border p-2">
                  <Switch
                    checked={item.is_active !== false}
                    onCheckedChange={() =>
                      handleToggleActive(item.id, item.is_active !== false)
                    }
                    disabled={loading === item.id}
                  />
                </td>

                <td className="border p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading === item.id}
                  >
                    {loading === item.id ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash className="h-5 w-5" />
                    )}
                    <span className="sr-only">{t('delete')}</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
