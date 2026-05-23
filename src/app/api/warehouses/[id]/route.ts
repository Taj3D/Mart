// ============================================================================
// Electronics Mart IMS — Warehouse [id] CRUD API
// GET by ID, PUT by ID, DELETE by ID (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/warehouses/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const warehouse = await db.warehouse.findUnique({
      where: { id },
      include: {
        _count: { select: { stockDetails: true, warehouseStocks: true, stockAdjustments: true, damageProducts: true, stockMovements: true } },
      },
    })

    if (!warehouse || warehouse.isDeleted) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      address: warehouse.address,
      phone: warehouse.phone,
      managerName: warehouse.managerName,
      type: warehouse.type,
      capacity: warehouse.capacity,
      isActive: warehouse.isActive,
      stockCount: warehouse._count.stockDetails + warehouse._count.warehouseStocks,
      adjustmentCount: warehouse._count.stockAdjustments,
      damageCount: warehouse._count.damageProducts,
      movementCount: warehouse._count.stockMovements,
      createdBy: warehouse.createdBy,
      createdDate: warehouse.createdDate,
      updatedBy: warehouse.updatedBy,
      updatedDate: warehouse.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching warehouse:', error)
    return NextResponse.json({ error: 'Failed to fetch warehouse' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/warehouses/[id] — Update with transaction + audit log
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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
      oldValues: { code: existing.code, name: existing.name, type: existing.type, capacity: existing.capacity, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, type: result.type, capacity: result.capacity, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/warehouses/[id] — Soft-delete with audit log
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
        { error: `Cannot delete: warehouse has ${activeStockCount} active stock record(s)` },
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
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: 'Failed to delete warehouse' }, { status: 500 })
  }
}
