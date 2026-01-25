import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const params = await context.params;
  const requestedKey = params.key;
  const key = process.env.INDEXNOW_KEY

  if (!key) {
    return new NextResponse('IndexNow key not configured', { status: 404 })
  }

  // Verify the requested key matches our configured key
  if (requestedKey !== key) {
    return new NextResponse('Invalid IndexNow key', { status: 404 })
  }

  // Return the key as plain text
  return new NextResponse(key, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}