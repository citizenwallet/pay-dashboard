'use client';
import CurrencyLogo from '@/components/currency-logo';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/db/items';
import { icons, ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import { toast } from 'sonner';
import { addNewItemAction, uploadImageAction } from './action';
import { useTranslations } from 'next-intl';

export default function AddItem({
  currencyLogo,
  placeId,
  handleAddItem
}: {
  currencyLogo: string;
  placeId: number;
  handleAddItem: (item: Item) => void;
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    vat: '',
    image: null as File | null
  });
  const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(
    null
  );
  const [handleAddButton, setHandleAddButton] = useState(true);
  const t = useTranslations('checkout');

  // New item form handlers
  const handleNewItemFormChange = (
    field: string,
    value: string | File | null
  ) => {
    setNewItemForm((prev) => ({ ...prev, [field]: value }));

    // Update button state based on required fields
    const updatedForm = { ...newItemForm, [field]: value };
    const isFormValid =
      updatedForm.name.trim() !== '' && updatedForm.price.trim() !== '';
    setHandleAddButton(!isFormValid);
  };

  const handleNewItemImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setNewItemForm((prev) => ({ ...prev, image: file }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewItemImagePreview(previewUrl);
    }
  };

  const handleSubmitNewItem = async () => {
    try {
      setAddingItem(true);
      let imageUrl = null;
      if (newItemForm.image) {
        imageUrl = await uploadImageAction(newItemForm.image, Number(placeId));
      }

      const newItem = await addNewItemAction(
        Number(placeId),
        newItemForm.name,
        newItemForm.description,
        imageUrl,
        Math.round(parseFloat(newItemForm.price) * 100),
        parseFloat(newItemForm.vat) || 0,
        newItemForm.category
      );
      handleAddItem(newItem.data);
      toast.success('Item added successfully');
      resetNewItemForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item');
    } finally {
      setAddingItem(false);
    }
  };

  const resetNewItemForm = () => {
    setNewItemForm({
      name: '',
      description: '',
      category: '',
      price: '',
      vat: '',
      image: null
    });
    setNewItemImagePreview(null);
    setHandleAddButton(true);
  };

  return (
    <>
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetNewItemForm();
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="mb-4 flex items-center gap-2">
            <icons.Plus size={16} />
            {t('addItem')}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addItem')}</DialogTitle>
            <DialogDescription>{t('addItemDescription')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image">{t('image')} </Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleNewItemImageChange}
                  className="hidden"
                />
                <Label
                  htmlFor="image"
                  className=" flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  {newItemImagePreview ? (
                    <Image
                      src={newItemImagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-gray-400" size={24} />
                  )}
                </Label>
                {newItemImagePreview && (
                  <Button
                    className="absolute left-28 top-28"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewItemForm((prev) => ({ ...prev, image: null }));
                      setNewItemImagePreview(null);
                    }}
                  >
                    <X size={16} className="text-red-500" />
                  </Button>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('name')} *</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                value={newItemForm.name}
                onChange={(e) =>
                  handleNewItemFormChange('name', e.target.value)
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                value={newItemForm.description}
                onChange={(e) =>
                  handleNewItemFormChange('description', e.target.value)
                }
                className="min-h-[80px]"
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">{t('category')}</Label>
              <Input
                id="category"
                placeholder={t('categoryPlaceholder')}
                value={newItemForm.category}
                onChange={(e) =>
                  handleNewItemFormChange('category', e.target.value)
                }
              />
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">{t('price')} *</Label>
              <div className="flex items-center gap-2">
                <CurrencyLogo logo={currencyLogo} size={18} />
                <Input
                  id="price"
                  type="text"
                  placeholder="0.00"
                  value={newItemForm.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^(\d*\.?\d{0,2})?$/.test(value)) {
                      handleNewItemFormChange('price', value);
                    }
                  }}
                />
              </div>
            </div>

            {/* VAT */}
            <div className="grid gap-2">
              <Label htmlFor="vat">{t('vat')} (%) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="vat"
                  type="text"
                  placeholder="0.00"
                  value={newItemForm.vat}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^(\d*\.?\d{0,2})?$/.test(value)) {
                      handleNewItemFormChange('vat', value);
                    }
                  }}
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewItemForm();
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={handleAddButton || addingItem}
              onClick={handleSubmitNewItem}
            >
              {addingItem ? (
                <>
                  <icons.Loader className="mr-2 animate-spin" size={16} />
                  {t('adding')}
                </>
              ) : (
                t('addItem')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
