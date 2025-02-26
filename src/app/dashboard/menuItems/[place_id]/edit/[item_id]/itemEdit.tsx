"use client";

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@radix-ui/react-separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateItem } from "./action";

// Define Item Type
interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  vat: number;
  category: string;
  place_id: number;
}

// Define Form Schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  vat: z.coerce.number().min(0, "VAT must be a positive number"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItemEdit({ item }: { item: Item }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(item.image || null);

  // Update preview URL when a new file is selected
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Remove the image
  const handleRemoveImage = () => {
    if (previewUrl && imageFile) {
      URL.revokeObjectURL(previewUrl); // Clean up if it’s a local preview
    }
    setImageFile(null);
    setPreviewUrl(null);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      vat: item?.vat || 0,
      category: item?.category || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const updatedItem = await updateItem(item.id, { ...item, ...data }, imageFile);

      if (updatedItem.error) {
        toast.error(updatedItem.error.message);
      } else {
        toast.success("Item updated successfully");
        router.push(`/dashboard/menuItems/${item.place_id}/item`);
      }

    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Item name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input disabled={loading} placeholder="Item category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" disabled={loading} placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="vat" render={({ field }) => (
            <FormItem>
              <FormLabel>VAT (%)</FormLabel>
              <FormControl>
                <Input type="number" disabled={loading} placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormItem>
            <FormLabel>Image</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                disabled={loading}
                onChange={handleImageChange}
              />
            </FormControl>
            {previewUrl && (
              <div className="mt-2 relative">
                <img src={previewUrl} alt="Preview" className="max-w-xs h-auto" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-0 left-0"
                  onClick={handleRemoveImage}
                >
                  X
                </Button>
              </div>
            )}
            <FormMessage />
          </FormItem>

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea disabled={loading} placeholder="Item description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button disabled={loading} type="submit">Update Item</Button>
      </form>
    </Form>

  );
}
