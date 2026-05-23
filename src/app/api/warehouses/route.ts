// ============================================================================
// Electronics Mart IMS — Warehouses (Godowns) CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/warehouses — List warehouses
// Params: ?all=true, ?search=
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    const search = request.nextUrl.searchParams.get('search') || ''

    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    const where: Record<string, unknown> = { ...baseWhere }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { address: { contains: search } },
        { managerName: { contains: search } },
      ]
    }

    const warehouses = await db.warehouse.findMany({
      where,
      include: {
        _count: { select: { stockDetails: true, warehouseStocks: true, stockAdjustments: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(warehouses.map((w) => ({
      id: w.id,
      code: w.code,
      name: w.name,
      address: w.address ?? null,
      phone: w.phone ?? null,
      managerName: w.managerName ?? null,
      type: w.type,
      capacity: w.capacity,
      isActive: w.isActive,
      isDeleted: w.isDeleted,
      stockCount: w._count.stockDetails + w._count.warehouseStocks,
      adjustmentCount: w._count.stockAdjustments,
      createdBy: w.createdBy ?? null,
      createdDate: w.createdDate ?? null,
      updatedBy: w.updatedBy ?? null,
      updatedDate: w.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Warehouses API error:', error)
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/warehouses — Create warehouse with auto-code WHS-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Warehouse name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Warehouse')

      const warehouse = await tx.warehouse.create({
        data: {
          code,
          name: body.name.trim(),
          address: body.address?.trim() || null,
          phone: body.phone?.trim() || null,
          managerName: body.managerName?.trim() || null,
          type: body.type || 'General',
          capacity: body.capacity ? parseInt(String(body.capacity)) : null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return warehouse
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Warehouse',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        type: result.type,
        capacity: result.capacity,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create warehouse error:', error)
    return NextResponse.json({ error: 'Failed to create warehouse' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/warehouses — Update warehouse (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 })
    }

    const existing = await db.warehouse.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted warehouse' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Warehouse name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'address', 'phone', 'managerName', 'type', 'capacity', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'capacity' ? (body[field] ? parseInt(String(body[field])) : null) : body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const warehouse = await tx.warehouse.update({
        where: { id },
        data: updateData,
      })
      return warehouse
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Warehouse',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        type: existing.type,
        capacity: existing.capacity,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        type: result.type,
        capacity: result.capacity,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update warehouse error:', error)
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/warehouses — Soft-delete
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 })
    }

    const existing = await db.warehouse.findUnique({
      where: { id },
      include: { _count: { select: { stockDetails: true, warehouseStocks: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Warehouse is already deleted' }, { status: 400 })
    }

    const activeStockCount = existing._count.stockDetails + existing._count.warehouseStocks
    if (activeStockCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: warehouse has ${activeStockCount} active stock record(s). Please relocate stock first.` },
        { status: 400 }
      )
    }

    await softDelete(db.warehouse, id, undefined)

    await createAuditLog({
      action: 'Delete',
      entity: 'Warehouse',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, type: existing.type },
    })

    return NextResponse.json({ message: 'Warehouse soft-deleted successfully' })
  } catch (error) {
    console.error('Delete warehouse error:', error)
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 400 })
  }
}
