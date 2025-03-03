"use client"

import { BookOpen, Bot, ChevronRight, LayoutDashboard, Settings2, SquareTerminal, User, type LucideIcon } from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { Place } from "@/db/places";




export function NavMain({
  businessId,
  lastid
}: {
  businessId:number;
  lastid:Place;
}) {

    const data = [
        {
            title: "Order",
            url: `/business/${businessId}/places/${lastid.id}/orders`,
            icon: LayoutDashboard,
            isActive: true,
            items: [],
        },
        {
            title: "Checkout",
            url: `/business/${businessId}/places/${lastid.id}/checkout`,
            icon: Bot,
            items: [],
        },
        {
            title: "Profile",
            url: `/business/${businessId}/places/${lastid.id}/profile`,
            icon: User,
            items: [],
        },
        {
            title: "Manage",
            url: `/business/${businessId}/places/${lastid.id}/manage`,
            icon: Settings2,
            items: [],
        }

    ];
    return (
        <SidebarGroup>
            <SidebarGroupLabel>OverView</SidebarGroupLabel>
            <SidebarMenu>
                {data.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem>
                            <Link href={item.url}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                            </Link>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
