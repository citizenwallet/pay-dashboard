'use client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/db/items';
import Image from 'next/image';
import React from 'react';

export default function ItemListing({ item }: { item: Item }) {
  return (
    <>
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input className="mt-3" readOnly value={item.name} />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <Input className="mt-3" readOnly value={item.category} />
      </div>

      <div>
        <label className="text-sm font-medium">Price</label>
        <Input className="mt-3" type="number" readOnly value={item.price} />
      </div>

      <div>
        <label className="text-sm font-medium">VAT (%)</label>
        <Input className="mt-3" type="number" readOnly value={item.vat} />
      </div>

      <div>
        <label className="text-sm font-medium">Image</label>
        {item.image && (
          <Image src={item.image} alt="Item Image" width={200} height={200} />
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea className="mt-3" readOnly value={item.description} />
      </div>
    </>
  );
}
