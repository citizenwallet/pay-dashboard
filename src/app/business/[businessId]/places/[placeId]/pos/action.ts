'use server';

import { getServiceRoleClient } from '@/db';
import { isUserLinkedToPlaceAction } from '@/actions/session';
import { getUserIdFromSessionAction } from '@/actions/session';
import { createPos, deletePos, getPosById, getPosByPlaceId, updatePos } from '@/db/pos';



export async function getPosAction(place_id: number) {
  const client = getServiceRoleClient();

  const userId = await getUserIdFromSessionAction();

  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const items = await getPosByPlaceId(client, Number(place_id));
  return items;
}

export async function addVivaPosAction(id: number, name: string, place_id: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }

  const pos = await createPos(client, name, id, place_id, "viva");
  return pos;
}


export async function deletePosAction(id: number,place_id: number) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const pos = await deletePos(client, id);
  return pos;
}

export async function updatePosAction(id: number, name: string, place_id: number,type: string) {
  const client = getServiceRoleClient();
  const userId = await getUserIdFromSessionAction();
  const res = await isUserLinkedToPlaceAction(client, userId, place_id);
  if (!res) {
    throw new Error('User does not have access to this place');
  }
  const pos = await updatePos(client, id, name, type);
  return pos;
}

export async function checkPlaceIdAlreadyExistsAction(posId: string) {
  const client = getServiceRoleClient();
  const pos = await getPosById(client, posId);
  if(pos.data){
    return false;
  }
  return true;
}


