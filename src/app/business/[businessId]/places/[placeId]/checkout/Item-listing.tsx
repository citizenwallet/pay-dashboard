'use client';
import { Item } from '@/db/items';
import { icons } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useRef, KeyboardEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  deletePlaceItemAction,
  updateItemOrderInPlaceAction,
  updateItemNameAction,
  updateItemDescriptionAction,
  updateItemPriceAction,
  updateItemCategoryAction,
  updateItemVatAction,
  uploadItemImageAction,
  updateItemHiddenStatusAction,
  addNewItemAction,
  updatePlaceDisplayAction
} from './action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatCurrencyNumber } from '@/lib/currency';
import CurrencyLogo from '@/components/currency-logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DisplayMode } from '@/db/places';

export default function ItemListing({
  placeId,
  items: initialItems,
  currencyLogo,
  displayMode: initialDisplayMode = 'amount'
}: {
  placeId: number;
  items: Item[];
  currencyLogo: string;
  displayMode?: DisplayMode;
}) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [addingItem, setAddingItem] = useState<boolean>(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [displayMode, setDisplayMode] =
    useState<DisplayMode>(initialDisplayMode);
  const [editingField, setEditingField] = useState<
    'name' | 'description' | 'price' | 'category' | 'vat' | 'image' | null
  >(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingDescription, setEditingDescription] = useState<string>('');
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [editingVat, setEditingVat] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Add move handlers
  const handleMoveUp = async (index: number) => {
    // If the item is already at the top, do nothing
    if (index === 0) return;

    // Create a copy of the items array
    const updatedItems = [...items];

    // Swap the item with the one above it
    const itemToMove = updatedItems[index];
    updatedItems[index] = updatedItems[index - 1];
    updatedItems[index - 1] = itemToMove;

    // Update the state with the new order
    setItems(updatedItems);

    // Calculate previous and next item IDs for the new position
    const draggedItemId = itemToMove.id;
    const previousItemId = index - 2 >= 0 ? updatedItems[index - 2].id : null;
    const nextItemId = updatedItems[index].id; // The item now below it

    // Update the order in the backend
    try {
      const item = await updateItemOrderInPlaceAction(
        items[0].place_id,
        draggedItemId,
        previousItemId,
        nextItemId
      );

      if (item.error) {
        toast.error('Failed to update item order');
        // Revert to the original order on failure
        setItems(items);
      } else {
        toast.success('Item moved up successfully');
      }
    } catch (error) {
      console.error('Failed to update item order:', error);
      setItems(items); // Revert on error
      toast.error('Failed to update item order');
    }
  };

  const handleMoveDown = async (index: number) => {
    // If the item is already at the bottom, do nothing
    if (index === items.length - 1) return;

    // Create a copy of the items array
    const updatedItems = [...items];

    // Swap the item with the one below it
    const itemToMove = updatedItems[index];
    updatedItems[index] = updatedItems[index + 1];
    updatedItems[index + 1] = itemToMove;

    // Update the state with the new order
    setItems(updatedItems);

    // Calculate previous and next item IDs for the new position
    const draggedItemId = itemToMove.id;
    const previousItemId = updatedItems[index].id; // The item now above it
    const nextItemId =
      index + 2 < updatedItems.length ? updatedItems[index + 2].id : null;

    // Update the order in the backend
    try {
      const item = await updateItemOrderInPlaceAction(
        items[0].place_id,
        draggedItemId,
        previousItemId,
        nextItemId
      );

      if (item.error) {
        toast.error('Failed to update item order');
        // Revert to the original order on failure
        setItems(items);
      } else {
        toast.success('Item moved down successfully');
      }
    } catch (error) {
      console.error('Failed to update item order:', error);
      setItems(items); // Revert on error
      toast.error('Failed to update item order');
    }
  };

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

    const previousItemId =
      targetIndex > 0 && updatedItems[targetIndex - 1]
        ? updatedItems[targetIndex - 1].id
        : null;
    const nextItemId =
      targetIndex + 1 < updatedItems.length
        ? updatedItems[targetIndex + 1]?.id
        : null;

    // Update the state with the new order
    setItems(updatedItems);

    // Update the order in the database
    try {
      const item = await updateItemOrderInPlaceAction(
        items[0].place_id,
        draggedItemId,
        previousItemId,
        nextItemId
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

  const handleVatClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('vat');
    setEditingVat(item.vat.toString());
  };

  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and a single decimal point
    const value = e.target.value;
    if (/^(\d*\.?\d{0,2})?$/.test(value)) {
      setEditingVat(value);
    }
  };

  const handleVatKeyDown = (e: KeyboardEvent<HTMLInputElement>, item: Item) => {
    if (e.key === 'Enter') {
      handleVatSave(item);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
      setEditingField(null);
    }
  };

  const handleVatSave = async (item: Item) => {
    if (editingVat.trim() === '') {
      toast.error('VAT cannot be empty');
      return;
    }

    const newVat = parseFloat(editingVat);

    if (isNaN(newVat)) {
      toast.error('Please enter a valid VAT percentage');
      return;
    }

    if (newVat < 0) {
      toast.error('VAT cannot be negative');
      return;
    }

    if (newVat === item.vat) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setLoading(item.id);
      const response = await updateItemVatAction(
        item.id,
        item.place_id,
        newVat
      );

      if (response.error) {
        toast.error('Failed to update item VAT');
      } else {
        toast.success('Item VAT updated successfully');

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, vat: newVat } : i
        );
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to update item VAT:', error);
      toast.error('Failed to update item VAT');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
    }
  };

  const handleImageClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditingField('image');
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    item: Item
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      setEditingItemId(null);
      setEditingField(null);
      return;
    }

    try {
      setUploadingImage(true);
      setLoading(item.id);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('itemId', item.id.toString());
      formData.append('placeId', item.place_id.toString());

      // Upload the image using FormData
      const response = await uploadItemImageAction(formData);

      if (response.error) {
        toast.error('Failed to update item image');
      } else {
        toast.success('Item image updated successfully');

        // Update the local state with the new image URL
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, image: response.data.image } : i
        );
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to update item image:', error);
      toast.error('Failed to update item image');
    } finally {
      setEditingItemId(null);
      setEditingField(null);
      setLoading(null);
      setUploadingImage(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleHiddenToggle = async (item: Item, hidden: boolean) => {
    try {
      setLoading(item.id);
      const response = await updateItemHiddenStatusAction(
        item.id,
        item.place_id,
        hidden
      );

      if (response.error) {
        toast.error(`Failed to ${hidden ? 'hide' : 'show'} item`);
      } else {
        toast.success(`Item ${hidden ? 'hidden' : 'shown'} successfully`);

        // Update the local state
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, hidden } : i
        );
        setItems(updatedItems);
      }
    } catch (error) {
      console.error(`Failed to update item visibility:`, error);
      toast.error(`Failed to ${hidden ? 'hide' : 'show'} item`);
    } finally {
      setLoading(null);
    }
  };

  const handleAddItem = async () => {
    try {
      setAddingItem(true);

      const response = await addNewItemAction(placeId);

      if (response.error) {
        toast.error('Failed to add new item');
      } else {
        toast.success('New item added successfully');

        // Add the new item to the top of the list
        const newItem = response.data;
        setItems([newItem, ...items]);

        // Automatically start editing the name of the new item
        setEditingItemId(newItem.id);
        setEditingField('name');
        setEditingName(newItem.name);

        // Use setTimeout to ensure the input field is rendered before focusing
        setTimeout(() => {
          const inputElement = document.querySelector(
            `input[data-item-id="${newItem.id}"]`
          ) as HTMLInputElement;
          if (inputElement) {
            inputElement.focus();
          }
        }, 0);
      }
    } catch (error) {
      console.error('Failed to add new item:', error);
      toast.error('Failed to add new item');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDisplayModeChange = async (value: string) => {
    if (displayMode === 'topup') return; // Prevent changes if current mode is topup

    const oldDisplayMode = displayMode;
    setDisplayMode(value as DisplayMode);

    try {
      await updatePlaceDisplayAction(placeId, value as DisplayMode);
      toast.success('Place display mode updated successfully');
    } catch (error) {
      console.error('Failed to update place display:', error);
      toast.error('Failed to update place display');
      setDisplayMode(oldDisplayMode);
    }
  };

  if (displayMode === 'topup') {
    return (
      <div>
        <h1>Topup mode</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (editingItemId !== null) {
            const item = items.find((i) => i.id === editingItemId);
            if (item) {
              handleImageChange(e, item);
            }
          }
        }}
      />

      <div className="mb-4 flex items-center justify-between">
        <Button
          onClick={handleAddItem}
          disabled={addingItem}
          className="flex items-center gap-2"
        >
          {addingItem ? (
            <>
              <icons.Loader className="animate-spin" size={16} />
              Adding...
            </>
          ) : (
            <>
              <icons.Plus size={16} />
              Add Item
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Display mode:</span>
          <Select value={displayMode} onValueChange={handleDisplayModeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Display mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menu">Menu</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="amountAndMenu">Amount and Menu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-[90vw] overflow-x-auto md:w-full">
        {displayMode !== 'amount' && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left"></th>
                <th className="border p-2 text-left">Image</th>
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Category</th>
                <th className="border p-2 text-left">Price</th>
                <th className="border p-2 text-left">VAT %</th>
                <th className="border p-2 text-left">Visible</th>
                <th className="border p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  {...(isDesktop
                    ? {
                        draggable: true,
                        onDragStart: () => handleDragStart(item.id),
                        onDragOver: (e) => handleDragOver(e, index),
                        onDrop: (e) => {
                          e.preventDefault();
                          if (draggingItem !== null) {
                            handleDrop(draggingItem, index);
                            setDraggingItem(null);
                          }
                        }
                      }
                    : {})}
                  className={item.hidden ? 'bg-gray-50 opacity-70' : ''}
                >
                  {/* <td className="w-[50px] border p-2">
                  <div className="flex h-[50px] w-[50px] items-center justify-center">
                    <icons.GripVertical size={20} className="text-gray-500" />
                  </div>
                </td> */}

                  <td className="w-[50px] border p-2">
                    {!isDesktop ? (
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="text-gray-500 disabled:opacity-50"
                        >
                          <icons.ChevronUp size={20} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === items.length - 1}
                          className="text-gray-500 disabled:opacity-50"
                        >
                          <icons.ChevronDown size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-[50px] w-[50px] items-center justify-center">
                        <icons.GripVertical
                          size={20}
                          className="text-gray-500"
                        />
                      </div>
                    )}
                  </td>

                  <td className="w-[50px] border p-2">
                    {loading === item.id && editingField === 'image' ? (
                      <div className="flex h-[50px] w-[50px] items-center justify-center rounded-md bg-gray-100">
                        <icons.Loader
                          className="animate-spin text-gray-500"
                          size={24}
                        />
                      </div>
                    ) : item.image ? (
                      <div
                        className="relative flex w-[50px] cursor-pointer items-center justify-center overflow-hidden rounded-md"
                        onClick={() => handleImageClick(item)}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover transition-opacity hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all hover:bg-opacity-30">
                          <icons.Camera
                            className="text-white opacity-0 transition-opacity hover:opacity-100"
                            size={20}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-md bg-gray-100 transition-colors hover:bg-gray-200"
                        onClick={() => handleImageClick(item)}
                      >
                        <icons.ImagePlus className="text-gray-500" size={24} />
                      </div>
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
                        data-item-id={item.id}
                        className="w-full rounded border border-gray-300 p-1"
                        placeholder="Enter name"
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
                    {editingItemId === item.id &&
                    editingField === 'description' ? (
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
                    {editingItemId === item.id &&
                    editingField === 'category' ? (
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
                          <span className="italic text-gray-400">
                            No category
                          </span>
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
                  <td className="border p-2">
                    {editingItemId === item.id && editingField === 'vat' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingVat}
                          onChange={handleVatChange}
                          onKeyDown={(e) => handleVatKeyDown(e, item)}
                          onBlur={() => handleVatSave(item)}
                          autoFocus
                          className="w-16 rounded border border-gray-300 p-1"
                        />
                        <span>%</span>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleVatClick(item)}
                        className="flex w-fit cursor-pointer items-center gap-1 rounded p-1 hover:bg-gray-100"
                      >
                        {item.vat}%
                      </div>
                    )}
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!item.hidden}
                        onCheckedChange={(checked) =>
                          handleHiddenToggle(item, !checked)
                        }
                        disabled={loading === item.id}
                        aria-label={`Toggle visibility for ${item.name}`}
                      />
                      <Label className="text-sm text-gray-600">
                        {item.hidden ? 'Hidden' : 'Visible'}
                      </Label>
                    </div>
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-2">
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
        )}
      </div>

      {displayMode === 'amount' && (
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <icons.LayoutGrid className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="mb-2 text-lg font-medium">Amount Display Mode</h3>
          <p className="text-gray-500">
            The amount display mode is currently selected. Switch to menu mode
            to view and edit your items.
          </p>
        </div>
      )}
    </div>
  );
}
