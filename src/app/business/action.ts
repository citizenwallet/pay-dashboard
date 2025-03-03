'use server';

import {
  getUserIdFromSessionAction,
  isUserLinkedToPlaceAction
} from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { getBusinessIdByUserId } from '@/db/business';
import { getOrdersByPlace } from '@/db/orders';
import { getPlacesByBusinessId, Place } from '@/db/places';

export async function getPlaceAction(){
    const client = getServiceRoleClient();
    const userId = await getUserIdFromSessionAction();
    const businessid =(await getBusinessIdByUserId(client,userId))
    const places = await getPlacesByBusinessId(client,businessid.data?.linked_business_id)
    return places.data;

}
