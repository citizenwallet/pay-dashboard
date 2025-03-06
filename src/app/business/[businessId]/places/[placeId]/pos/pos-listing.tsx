"use client"


import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import type { Pos } from "@/db/pos"
import { Button } from "@/components/ui/button"
import { icons, Plus, Trash } from "lucide-react"
import { useState } from "react"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function PosListing({
  placeId,
  items = [],
}: {
  placeId: number
  items?: Pos[]
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [posName, setposName] = React.useState('');
  const [posId, setposId] = React.useState('');



  const columns: ColumnDef<Pos>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name"
    },
    {
      accessorKey: "type",
      header: "Type"
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const isoDate = row.getValue("created_at") as string
        const date = new Date(isoDate)
        return (
          <div>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        )
      },
    },
    {
      id: "actions",
      accessorKey: "Action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => {
              console.log("Delete item:", row.original)
            }}
          >
            <Trash className="h-5 w-5" />
            <span className="sr-only">Delete</span>
          </Button>
        )
      },
    },
  ]

  const handleAddPlace = () => {
    console.log("Add POS")

    if (!posId || !posName) {
      toast.error("Please enter the details")
      return
    }
  }

  return (
    <div className="w-full">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>

        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 mb-4">
            <icons.Plus size={16} />
            Add Viva Terminal
          </Button>
        </DialogTrigger>

        <DialogContent>

          <DialogHeader>
            <DialogTitle>Add  Viva Terminal</DialogTitle>
            <DialogDescription>
              Added new Viva Terminal to your places.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="id" className="text-sm font-medium">
                Id
              </label>
              <Input id="id"
                type="number"
                value={posId}
                onChange={(e) => setposId(e.target.value)}
                placeholder="Enter Pos name"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name"
                value={posName}
                onChange={(e) => setposName(e.target.value)}
                placeholder="Enter Pos name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPlace}>Add</Button>
          </DialogFooter>

        </DialogContent>

      </Dialog>

      <DataTable
        columns={columns}
        data={items}
      />
      
    </div>
  )
}
