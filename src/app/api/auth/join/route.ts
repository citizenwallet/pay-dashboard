'use server';
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import '@/lib/utils';
import { joinAction } from '@/actions/joinAction';
import { generateRandomString } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const res = await req.json();
  const invite_code = res.invite_code || generateRandomString(6);
  const response = await joinAction(invite_code, res);
  return NextResponse.json(response);
}
