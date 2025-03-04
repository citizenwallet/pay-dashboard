"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Place } from "@/db/places";
import { EyeOff, Archive, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { deleteplaceAction, handleArchiveToggleAction, handleVisibilityToggleAction } from "./action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ManagePage(
    { place, orderPlace }:
        { place: Place | null, orderPlace: number | undefined }) {

    const [isHideDialogOpen, setIsHideDialogOpen] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleHide = async (lastplace: Place) => {
        try {
            const data =await handleVisibilityToggleAction(lastplace.id);
            toast.success(`Place ${lastplace.hidden ? "public" : "hidden"} successfully`);
            setIsHideDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(`Error with handle Visibility Toggle the place`);
        }
    };

    const handleArchive = async (place: Place) => {
        try {
            const data = await handleArchiveToggleAction(place.id);
            const actionMessage = place.hidden ? "Hidden" : "Unhidden";
            toast.success(`Place has been ${actionMessage} and archived successfully`);
            setIsArchiveDialogOpen(false);
            router.refresh();
        } catch (error) {
            toast.error(`Error with Archive button clicked the place`);
        }
    };
    

    const handleDelete = async (place:Place) => {
        try {
            const data = await deleteplaceAction(place.id);
            toast.success(`Delete that Place successfully`);
            setIsDeleteDialogOpen(false);
            router.push("/");
        } catch (error) {
            toast.error(`Error with Delete the place`);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="mb-2 text-gray-600">
                    Hide this place from the app and all public listings while keeping it accessible via direct link.
                </p>
                <Dialog open={isHideDialogOpen} onOpenChange={setIsHideDialogOpen}>
                    <DialogTrigger asChild>
                        {place?.hidden ? (
                            <Button variant="outline" disabled={loading}>
                                <Eye className="mr-2 h-4 w-4" />
                                Make Public
                            </Button>
                        ) : (
                            <Button variant="outline" disabled={loading}>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Hide
                            </Button>
                        )}
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Hide</DialogTitle>
                            <DialogDescription>
                                {place?.hidden
                                    ? "This place is hidden from the app and all public listings. It remains active through its direct link."
                                    : "Hide this place from the app and all public listings. The place will remain active directly through its link."}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsHideDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                onClick={() => handleHide(place!)}
                            >
                                {loading ? "Hiding..." : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div>
                <p className="mb-2 text-gray-600">
                    Archive this place to disable checkout flow and remove it from public listings entirely.
                </p>
                <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            disabled={loading }
                        >
                            {place?.archived ? (
                                <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Unarchive
                                </>
                            ) : (
                                <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archive
                                </>
                            )}
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Archive</DialogTitle>
                            <DialogDescription>
                                This will disable the checkout flow and hide this place from all public listings.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                onClick={() => handleArchive(place!)}
                            >
                                {loading ? "Archiving..." : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {orderPlace === 0 && (
                <div>
                    <p className="mb-2 text-gray-600">
                        Permanently remove this place. This action cannot be undone and is only available if there are no associated orders.
                    </p>
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={loading}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Delete</DialogTitle>
                                <DialogDescription>
                                    Permanently delete this place. This cannot be reversed.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={loading}
                                    onClick={() => handleDelete(place!)}
                                >
                                    {loading ? "Deleting..." : "Confirm"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}
