import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/** GET /api/notifications */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: any = {}
    if (userId) where.userId = userId
    if (unreadOnly) where.isRead = false

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await db.notification.count({
      where: { ...(userId ? { userId } : {}), isRead: false },
    })

    return NextResponse.json({ data: notifications, unreadCount })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

/** POST /api/notifications - Mark as read */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.markAllRead && body.userId) {
      await db.notification.updateMany({
        where: { userId: body.userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json({ success: true })
    }

    if (body.id) {
      const notification = await db.notification.update({
        where: { id: body.id },
        data: { isRead: true, readAt: new Date() },
      })
      return NextResponse.json({ data: notification })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Notifications POST error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
