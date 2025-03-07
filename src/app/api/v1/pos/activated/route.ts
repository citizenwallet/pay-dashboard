'use server';
import { getServiceRoleClient } from '@/db';
import { getPosById, Pos } from '@/db/pos';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);
    const posId = searchParams.get('posId');

    if (!posId) {
      return new Response(JSON.stringify({ error: 'posId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = getServiceRoleClient();
    const res = await getPosById(client, posId);
    const pos: Pos = res.data as Pos;

    if (!pos) {
      return new Response(JSON.stringify({ error: 'pos not found' }), {
        status: 412,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify( {"place_id":pos.place_id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {

    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });

  }
}
