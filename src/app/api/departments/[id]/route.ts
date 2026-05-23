// ============================================================================
// Electronics Mart IMS — Departments Dynamic Route [id]
// GET / PUT / DELETE by ID
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/departments/[id] — Get single department
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const department = await db.department.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } },
      },
    })

    if (!department || department.isDeleted) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: department.id,
      code: department.code,
      name: department.name,
      description: department.description ?? null,
      isActive: department.isActive,
      isDeleted: department.isDeleted,
      employeeCount: department._count.employees,
      createdBy: department.createdBy ?? null,
      createdDate: department.createdDate ?? null,
      updatedBy: department.updatedBy ?? null,
      updatedDate: department.updatedDate ?? null,
    })
  } catch (error) {
    console.error('Get department error:', error)
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/departments/[id] — Update department (code read-only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted department' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Department name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const department = await tx.department.update({
        where: { id },
        data: updateData,
      })
      return department
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Department',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description, isActive: existing.isActive },
      newValues: { code: result.code, name: result.name, description: result.description, isActive: result.isActive },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update department error:', error)
    return NextResponse.json({ error: 'Failed to update department' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/departments/[id] — Soft-delete (block if has active employees)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.department.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Department is already deleted' }, { status: 400 })
    }

    // Check for active employees
    const activeEmployees = await db.employee.count({
      where: { departmentId: id, ...notDeleted() },
    })

    if (activeEmployees > 0) {
      return NextResponse.json(
        { error: `Cannot delete: department has ${activeEmployees} active employee(s). Please reassign employees first.` },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await softDelete(tx.department, id, undefined)
    })

    await createAuditLog({
      action: 'Delete',
      entity: 'Department',
      entityId: id,
      oldValues: { code: existing.code, name: existing.name, description: existing.description },
    })

    return NextResponse.json({ message: 'Department soft-deleted successfully' })
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 400 })
  }
}
