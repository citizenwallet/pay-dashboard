
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@radix-ui/react-separator";
import { Suspense } from "react";
import { getItem } from "./action";
import ItemEditData from "./itemEdit";

export default async function ItemEdit({ params }: { params: { place_id: string, item_id: string } }) {
    const resolvedParams = await params;
    return (
        <div>
            <PageContainer>
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <Heading title="Edit Item" description="Edit item information" />
                    </div>
                    <Separator />

                    
                        <Suspense fallback={<div>Loading...</div>}>
                            <ItemEditsLoader resolvedParams={resolvedParams} />
                        </Suspense>
                    
                </div>
            </PageContainer>
        </div>
    );
}

async function ItemEditsLoader({ resolvedParams }: { resolvedParams: { place_id: string, item_id: string } }) {
    const item = await getItem(resolvedParams.place_id, resolvedParams.item_id);

    if (!item.data) {
        return <div>Item not found</div>;
    }
    return <ItemEditData item={{...item.data, image: item.data.image || ''}} />;
}
