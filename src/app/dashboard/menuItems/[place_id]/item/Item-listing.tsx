"use client";
import Link from "next/link";
import { Item } from "@/db/items";
import { icons } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { deleteItem, updateItemOrder } from "./action";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ItemListing({ Items: initialItems }: { Items: Item[] }) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [changedPositions, setChangedPositions] = useState<Record<number, { from: number; to: number }>>({});
  const router = useRouter();

  // Track original positions
  const originalOrder = initialItems.map((item, index) => ({ id: item.id, position: item.order }));

  useEffect(() => {
    // Prevent unnecessary updates by checking if there are actual changes
    const newPositions = items.map((item) => ({ id: item.id, position: item.order }));
    const changes: Record<number, { from: number; to: number }> = {};
    let hasChanges = false;

    newPositions.forEach((newPos) => {
      const originalPos = originalOrder.find((o) => o.id === newPos.id)?.position;
      if (originalPos !== undefined && originalPos !== newPos.position) {
        changes[newPos.id] = { from: originalPos, to: newPos.position };
        hasChanges = true;
      }
    });

    // Only update state if there are actual changes
    if (hasChanges) {
      setChangedPositions(changes);
    }
  }, [items, originalOrder]);

  const handleDragStart = (id: number) => {
    setDraggingItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggingItem === null || draggingItem === targetId) return;

    const newItems = [...items];
    const draggingIndex = newItems.findIndex((item) => item.id === draggingItem);
    const targetIndex = newItems.findIndex((item) => item.id === targetId);

    [newItems[draggingIndex], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[draggingIndex],
    ];

    setItems(newItems);
    setDraggingItem(null);

    const draggedItem = newItems[targetIndex];
    const targetItem = newItems[draggingIndex];
    // console.log(
    //   `Moved "${draggedItem.name}" from position ${draggingIndex + 1} to ${targetIndex + 1}`
    // );



    // Update positions in the list
    const positions: Record<number, { from: number; to: number }> = {};
    newItems.forEach((item, index) => {
      if (item.id !== items[index].id) {
        positions[item.id] = { from: item.order, to: index + 1 };
        item.order = index + 1; // Update the item's position
      }
    });
    const response = await updateItemOrder(items[0].place_id, positions);
    if (response.success) {
      toast.success("Item order updated successfully");
    } else {
      toast.error("Failed to update item order");
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
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => toast.dismiss(t)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white ml-4"
              onClick={async () => {
                toast.dismiss(t);
                const response = await deleteItem(id, place_id);
                if (response.error) {
                  toast.error("Failed to delete item");
                } else {
                  toast.success("Item deleted successfully");
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
      toast.error("Failed to delete item");
    } finally {
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
            <th className="border p-2 text-left">Price</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}

            >
              <td className="border p-2">
                <icons.GripVertical size={20} className="text-gray-500" />
              </td>

              <td className="border p-2">
                {item.image && (
                  <Image src={item.image} alt={item.name} width={50} height={50} />
                )}
              </td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.description}</td>
              <td className="border p-2">{item.price}</td>
              <td className="border p-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/menuItems/${item.place_id}/item/${item.id}`}
                    className="hover:text-blue-600"
                  >
                    <icons.Eye size={20} />
                  </Link>
                  <Link
                    href={`/dashboard/menuItems/${item.place_id}/edit/${item.id}`}
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