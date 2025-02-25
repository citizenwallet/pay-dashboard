"use client"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Item } from '@/db/items'
import React from 'react'



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
                <img src={item.image} alt="Item Image" width={100} height={100} />
            </div>
            <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea className="mt-3" readOnly value={item.description} />
            </div>
        </>
    )
}
