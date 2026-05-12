import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings - Get all settings as key-value object
export async function GET() {
  try {
    const settings = await db.setting.findMany()

    // Convert array to key-value object
    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ data: settingsMap })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Upsert settings (accepts { settings: [{ key, value }] })
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.settings || !Array.isArray(body.settings)) {
      return NextResponse.json(
        { error: 'settings array is required' },
        { status: 400 }
      )
    }

    // Upsert each setting in a transaction
    const results = await db.$transaction(
      body.settings.map(
        (setting: { key: string; value: string }) =>
          db.setting.upsert({
            where: { key: setting.key },
            update: { value: String(setting.value) },
            create: {
              key: setting.key,
              value: String(setting.value),
            },
          })
      )
    )

    // Convert back to key-value object
    const settingsMap: Record<string, string> = {}
    for (const setting of results) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ data: settingsMap })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
