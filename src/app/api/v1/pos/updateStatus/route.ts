'use server';
import { getServiceRoleClient } from '@/db';
import { NextRequest } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const posId = searchParams.get('posId');
    const body = await req.json();
    const { is_active } = body;

    if (!posId || typeof is_active !== 'boolean') {
      return new Response(
        JSON.stringify({
          error: 'posId (from URL) and is_active (boolean) are required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const client = getServiceRoleClient();
    const { data, error } = await client
      .from('pos')
      .update({ is_active })
      .eq('id', posId)
      .select()
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update status', details: error }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Status updated successfully', data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
