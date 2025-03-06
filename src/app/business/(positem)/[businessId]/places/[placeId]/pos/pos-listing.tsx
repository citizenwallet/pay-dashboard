"use client"


import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import type { Pos } from "@/db/pos"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"

export default function PosListing({
  placeId,
  items = [],
}: {
  placeId: number
  items?: Pos[]
}) {

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
      header:"Created At",
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


  return (
    <div className="w-full">
      <Button className="mb-4">+ Add Viva Terminal</Button>
      <DataTable
        columns={columns}
        data={items}
      />
    </div>
  )
}

