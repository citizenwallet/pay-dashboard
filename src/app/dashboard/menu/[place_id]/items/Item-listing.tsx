'use client';
import Link from 'next/link';
import { Item } from '@/db/items';
import { icons } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  deletePlaceItemAction,
  updateItemOrderInPlaceAction,
  updateItemNameAction,
  updateItemDescriptionAction,
  updateItemPriceAction,
  updateItemCategoryAction
} from './action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import { Input } from '@/components/ui/input';

export default function ItemListing({
  items: initialItems,
  currencyLogo
}: {
  items: Item[];
  currencyLogo: string;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const previousItemIdRef = useRef<number | null>(null);
  const nextItemIdRef = useRef<number | null>(null);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<
    'name' | 'description' | 'price' | 'category' | null
  >(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<string>('');
  const router = useRouter();

  const handleDragStart = (id: number) => {
    setDraggingItem(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    // Only proceed if we're dragging an item
    if (draggingItem === null) return;

    const draggedItemIndex = items.findIndex(
      (item) => item.id === draggingItem
    );
    if (draggedItemIndex === index) return; // No need to do anything if hovering over the same item

    previousItemIdRef.current = index > 0 ? items[index - 1]?.id : null;
    nextItemIdRef.current = index < items.length ? items[index]?.id : null;

    // Create a copy of the items array
    const updatedItems = [...items];
    // Remove the dragged item from its current position
    const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
    // Insert it at the new position
    updatedItems.splice(index, 0, draggedItem);

    // Update the state with the new order
    setItems(updatedItems);
  };

  const handleDrop = async (draggedItemId: number, targetIndex: number) => {
    // Find the dragged item index
    const draggedItemIndex = items.findIndex(
      (item) => item.id === draggedItemId
    );
    if (draggedItemIndex === -1) return;

    // Create a copy of the items array with the updated order
    const updatedItems = [...items];
    // Remove the dragged item from its current position
    const [draggedItem] = updatedItems.splice(draggedItemIndex, 1);
    // Insert it at the new position
    updatedItems.splice(targetIndex, 0, draggedItem);

    // Update the state with the new order
    setItems(updatedItems);

    // Update the order in the database
    try {
      const item = await updateItemOrderInPlaceAction(
        items[0].place_id,
        draggedItemId,
        previousItemIdRef.current,
        nextItemIdRef.current
      );

      if (item.error) {
        toast.error('Failed to update item order');
      } else {
        toast.success('Item order updated successfully');

        const newItems = [...updatedItems];
        newItems[draggedItemIndex] = item.data;
        setItems(newItems);
      }
    } catch (error) {
      console.error('Failed to update item order:', error);
      // Revert the UI change if the database update fails
      setItems(initialItems);
      toast.error('Failed to update item order');
    }
  };

  const handleDelete = async (id: number, place_id: number) => {
    try {
      const item = items.find((item) => item.id === id);
      if (!item) return;
      setLoading(id);
      toast.custom((t) => (
        <div>
          <h3>Are you sure you want to delete this item?</h3>
          <p>This action cannot be undone</p>
          <div className="mt-4 flex justify-end gap-3">
            <Button onClick={() => toast.dismiss(t)}>Cancel</Button>
            <Button
              className="ml-4 bg-red-600 text-white hover:bg-red-700"
              onClick={async () => {
                toast.dismiss(t);
                const response = await deletePlaceItemAction(id, place_id);
                if (response.error) {
                  toast.error('Failed to delete item');
                } else {
                  toast.success('Item deleted successfully');
                  setItems(items.filter((item) => item.id !== id));
                  router.refresh();
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ));
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setLoading(null);
    }
  };

  const handleNameClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('name');
    setEditingName(item.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    item: Item
  ) => {
    if (e.key === 'Enter') {
      handleNameSave(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  const handleNameSave = async (item: Item) => {
    if (editingName.trim() === '') {
      toast.error('Item name cannot be empty');
      return;
    }

    if (editingName === item.name) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoading(item.id);
      const response = await updateItemNameAction(
        item.id,
        item.place_id,
        editingName
      );

      if (response.error) {
        toast.error('Failed to update item name');
      } else {
        toast.success('Item name updated successfully');

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, name: editingName } : i
        );
        setItems(updatedItems);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update item name:', error);
      toast.error('Failed to update item name');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
    }
  };

  const handleDescriptionClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('description');
    setEditingDescription(item.description);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditingDescription(e.target.value);
  };

  const handleDescriptionKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
    item: Item
  ) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleDescriptionSave(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  const handleDescriptionSave = async (item: Item) => {
    if (editingDescription === item.description) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoading(item.id);
      const response = await updateItemDescriptionAction(
        item.id,
        item.place_id,
        editingDescription
      );

      if (response.error) {
        toast.error('Failed to update item description');
      } else {
        toast.success('Item description updated successfully');

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, description: editingDescription } : i
        );
        setItems(updatedItems);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update item description:', error);
      toast.error('Failed to update item description');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
    }
  };

  const handlePriceClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('price');
    setEditingPrice(formatCurrencyNumber(item.price));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (/^(\d*\.?\d{0,2})?$/.test(value)) {
      setEditingPrice(value);
    }
  };

  const handlePriceKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    item: Item
  ) => {
    if (e.key === 'Enter') {
      handlePriceSave(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  const handlePriceSave = async (item: Item) => {
    if (editingPrice.trim() === '') {
      toast.error('Price cannot be empty');
      return;
    }

    const newPrice = Math.round(parseFloat(editingPrice) * 100);

    if (isNaN(newPrice)) {
      toast.error('Please enter a valid price');
      return;
    }

    if (newPrice < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (newPrice === item.price) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoading(item.id);
      const response = await updateItemPriceAction(
        item.id,
        item.place_id,
        newPrice
      );

      if (response.error) {
        toast.error('Failed to update item price');
      } else {
        toast.success('Item price updated successfully');

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, price: newPrice } : i
        );
        setItems(updatedItems);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update item price:', error);
      toast.error('Failed to update item price');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
    }
  };

  const handleCategoryClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('category');
    setEditingCategory(item.category);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingCategory(e.target.value);
  };

  const handleCategoryKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    item: Item
  ) => {
    if (e.key === 'Enter') {
      handleCategorySave(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  const handleCategorySave = async (item: Item) => {
    if (editingCategory === item.category) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoading(item.id);
      const response = await updateItemCategoryAction(
        item.id,
        item.place_id,
        editingCategory
      );

      if (response.error) {
        toast.error('Failed to update item category');
      } else {
        toast.success('Item category updated successfully');

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, category: editingCategory } : i
        );
        setItems(updatedItems);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update item category:', error);
      toast.error('Failed to update item category');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
    }
  };

  return (
    <div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 text-left"></th>
            <th className="border p-2 text-left">Image</th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Price</th>
            <th className="border p-2 text-left">VAT</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingItem !== null) {
                  handleDrop(draggingItem, index);
                  setDraggingItem(null);
                }
              }}
            >
              <td className="border p-2">
                <icons.GripVertical size={20} className="text-gray-500" />
              </td>

              <td className="border p-2">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={50}
                    height={50}
                    className="rounded-md"
                  />
                )}
              </td>
              <td className="border p-2">
                {editingItemId === item.id && editingField === 'name' ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={handleNameChange}
                    onKeyDown={(e) => handleNameKeyDown(e, item)}
                    onBlur={() => handleNameSave(item)}
                    autoFocus
                    className="w-full rounded border border-gray-300 p-1"
                  />
                ) : (
                  <div
                    onClick={() => handleNameClick(item)}
                    className="cursor-pointer rounded p-1 hover:bg-gray-100"
                  >
                    {item.name}
                  </div>
                )}
              </td>
              <td className="border p-2">
                {editingItemId === item.id && editingField === 'description' ? (
                  <textarea
                    value={editingDescription}
                    onChange={handleDescriptionChange}
                    onKeyDown={(e) => handleDescriptionKeyDown(e, item)}
                    onBlur={() => handleDescriptionSave(item)}
                    autoFocus
                    className="w-full rounded border border-gray-300 p-1"
                    rows={3}
                    placeholder="Enter description"
                  />
                ) : (
                  <div
                    onClick={() => handleDescriptionClick(item)}
                    className="cursor-pointer rounded p-1 hover:bg-gray-100"
                  >
                    {item.description || (
                      <span className="italic text-gray-400">
                        No description
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td className="border p-2">
                {editingItemId === item.id && editingField === 'category' ? (
                  <input
                    type="text"
                    value={editingCategory}
                    onChange={handleCategoryChange}
                    onKeyDown={(e) => handleCategoryKeyDown(e, item)}
                    onBlur={() => handleCategorySave(item)}
                    autoFocus
                    className="w-full rounded border border-gray-300 p-1"
                  />
                ) : (
                  <div
                    onClick={() => handleCategoryClick(item)}
                    className="cursor-pointer rounded p-1 hover:bg-gray-100"
                  >
                    {item.category || (
                      <span className="italic text-gray-400">No category</span>
                    )}
                  </div>
                )}
              </td>
              <td className="border p-2">
                {editingItemId === item.id && editingField === 'price' ? (
                  <div className="flex items-center gap-1">
                    <CurrencyLogo logo={currencyLogo} size={18} />
                    <input
                      type="text"
                      value={editingPrice}
                      onChange={handlePriceChange}
                      onKeyDown={(e) => handlePriceKeyDown(e, item)}
                      onBlur={() => handlePriceSave(item)}
                      autoFocus
                      className="w-20 rounded border border-gray-300 p-1"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => handlePriceClick(item)}
                    className="flex w-fit cursor-pointer items-center gap-1 rounded p-1 hover:bg-gray-100"
                  >
                    <CurrencyLogo logo={currencyLogo} size={18} />
                    {formatCurrencyNumber(item.price)}
                  </div>
                )}
              </td>
              <td className="border p-2">{item.vat}%</td>
              <td className="border p-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/menu/${item.place_id}/items/${item.id}/edit`}
                    className="hover:text-yellow-600"
                  >
                    <icons.Pen size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.place_id)}
                    className="hover:text-red-600"
                    disabled={loading === item.id}
                  >
                    {loading === item.id ? (
                      <icons.Loader className="animate-spin" size={20} />
                    ) : (
                      <icons.Trash size={20} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
