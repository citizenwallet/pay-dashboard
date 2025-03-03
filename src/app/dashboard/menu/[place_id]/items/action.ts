'use server';

import { getServiceRoleClient } from '@/db';
import {
  deleteItem,
  getItemsForPlace,
  reorderItem,
  updateItemOrder,
  updateItem,
  insertItem,
  getItemById
} from '@/db/items';

import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getUserIdFromSessionAction } from '@/actions/session';
import { uploadImage } from '@/services/storage/image';
import { getUserBusinessId } from '@/db/users';
import { updatePlaceDisplay } from '@/db/places';

export async function getItemsAction(place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const items = await getItemsForPlace(client, Number(place_id));
  return items;
}

export async function deletePlaceItemAction(id: number, place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const item = await deleteItem(client, id);
  return item;
}

export async function updateItemOrderInPlaceAction(
  placeId: number,
  itemId: number,
  prevItemId: number | null,
  nextItemId: number | null
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return reorderItem(client, placeId, itemId, prevItemId, nextItemId);
}

export async function updateItemNameAction(
  itemId: number,
  placeId: number,
  name: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { name });
}

export async function updateItemDescriptionAction(
  itemId: number,
  placeId: number,
  description: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { description });
}

export async function updateItemPriceAction(
  itemId: number,
  placeId: number,
  price: number
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { price });
}

export async function updateItemCategoryAction(
  itemId: number,
  placeId: number,
  category: string
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { category });
}

export async function updateItemVatAction(
  itemId: number,
  placeId: number,
  vat: number
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { vat });
}

export async function uploadItemImageAction(formData: FormData) {
  const client = getServiceRoleClient();

  // Extract data from FormData
  const itemId = Number(formData.get('itemId'));
  const placeId = Number(formData.get('placeId'));
  const imageFile = formData.get('file') as File;

  if (!itemId || !placeId || !imageFile) {
    throw new Error('Missing required data for image upload');
  }

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  // Get the business ID for the user
  const businessId = await getUserBusinessId(client, userId);
  if (!businessId) {
    throw new Error('User does not have a business');
  }

  try {
    // Upload the image to storage
    const imageUrl = await uploadImage(client, imageFile, businessId, placeId);

    // Update the item with the image URL
    return updateItem(client, itemId, { image: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

export async function updateItemHiddenStatusAction(
  itemId: number,
  placeId: number,
  hidden: boolean
) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updateItem(client, itemId, { hidden });
}

export async function addNewItemAction(placeId: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  // Get all items to determine the lowest order value
  const { data: items } = await getItemsForPlace(client, placeId);

  // Calculate the order value for the new item (put it at the top)
  let newOrder = 0;
  if (items && items.length > 0) {
    // Find the minimum order value and subtract 1
    const minOrder = Math.min(...items.map((item) => item.order));
    newOrder = minOrder - 1;
  }

  // Create a new item with default values
  const newItem = await insertItem(
    client,
    'New Item',
    '',
    '',
    0,
    0,
    '',
    placeId
  );

  // Update the order to place it at the top
  if (newItem.data) {
    await updateItemOrder(client, newItem.data.id, newOrder);

    // Fetch the updated item
    return getItemById(client, placeId, newItem.data.id);
  }

  return newItem;
}

export async function updatePlaceDisplayAction(
  placeId: number,
  display: 'amount' | 'menu' | 'topup'
) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, placeId);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  return updatePlaceDisplay(client, placeId, display);
}
