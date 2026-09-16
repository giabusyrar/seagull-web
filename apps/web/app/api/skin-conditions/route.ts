import { NextRequest } from 'next/server';
import { handleApiProxy } from '@/lib/proxy-handler';

export async function GET(request: NextRequest) {
  return handleApiProxy(request, { params: Promise.resolve({ path: ['reference', 'skin-conditions'] }) });
}

export async function POST(request: NextRequest) {
  return handleApiProxy(request, { params: Promise.resolve({ path: ['reference', 'skin-conditions'] }) });
}

export async function PUT(request: NextRequest) {
  return handleApiProxy(request, { params: Promise.resolve({ path: ['reference', 'skin-conditions'] }) });
}

export async function DELETE(request: NextRequest) {
  return handleApiProxy(request, { params: Promise.resolve({ path: ['reference', 'skin-conditions'] }) });
}
