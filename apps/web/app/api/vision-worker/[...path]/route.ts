import { NextRequest } from 'next/server';
import { handleApiProxy } from '@/lib/proxy-handler';

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleApiProxy(request, { params: Promise.resolve({ path: ['vision-worker', ...path] }) });
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleApiProxy(request, { params: Promise.resolve({ path: ['vision-worker', ...path] }) });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleApiProxy(request, { params: Promise.resolve({ path: ['vision-worker', ...path] }) });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return handleApiProxy(request, { params: Promise.resolve({ path: ['vision-worker', ...path] }) });
}
