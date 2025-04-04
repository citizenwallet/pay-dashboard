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
  updatePosAction
} from './action';
import { useDebounce } from 'use-debounce';

export default function PosListing({
  placeId,
  items = []
}: {
  placeId: number;
  items?: Pos[];
}) {
  const [posItems, setPosItems] = useState(items);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
        Number(item.id),
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
      toast.success('POS terminal updated successfully');
    } catch (error) {
      toast.error('Error updating POS terminal');
    } finally {
      setLoading(null);
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  // Delete a POS terminal
  const handleDelete = async (id: string) => {
    setLoading(id);
    try {
      const res = await deletePosAction(Number(id), placeId);
      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success('POS terminal deleted successfully');
      setPosItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error('Error deleting POS terminal');
    } finally {
      setLoading(null);
    }
  };

  // Add a new POS terminal
  const handleAddPlace = async () => {
    try {
      if (!posId || !posName) {
        toast.error('Please enter the details');
        return;
      }
      const res = await addVivaPosAction(Number(posId), posName, placeId);

      setPosId('');
      setPosName('');
      setIsAddDialogOpen(false);

      if (res.error) {
        toast.error(res.error.message);
        return;
      }
      toast.success('POS terminal added successfully');
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
          toast.error('POS terminal Id already exists');
        }
      } catch (error) {
        console.error('Error checking place ID:', error);
      }
    };

    checkPlaceIdAlreadyExists();
  }, [debouncedPlaceId]);

  return (
    <div className="w-full">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4 flex items-center gap-2">
            <icons.Plus size={16} />
            Add Viva Terminal
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Viva Terminal</DialogTitle>
            <DialogDescription>
              Add a new Viva Terminal to your place.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="id" className="text-sm font-medium">
                ID
              </label>
              <Input
                id="id"
                type="text" // Changed to text since id is a string
                value={posId}
                onChange={(e) => setPosId(e.target.value)}
                placeholder="Enter POS ID"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                placeholder="Enter POS name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={handleAddButton} onClick={handleAddPlace}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left">ID</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">Created At</th>
            <th className="border p-2 text-left">Action</th>
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
                      <span className="italic text-gray-400">No type</span>
                    )}
                  </div>
                )}
              </td>

              <td className="border p-2">
                {new Date(item.created_at).toLocaleDateString()}{' '}
                {new Date(item.created_at).toLocaleTimeString()}
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
                  <span className="sr-only">Delete</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
