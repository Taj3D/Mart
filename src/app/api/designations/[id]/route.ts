// ============================================================================
// Electronics Mart IMS — Designations Dynamic Route [id]
// GET / PUT / DELETE by ID
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/designations/[id] — Get single designation
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const designation = await db.designation.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } },
        employees: {
          where: { ...notDeleted() },
          select: { id: true, code: true, name: true, status: true },
          take: 20,
        },
      },
    })

    if (!designation || designation.isDeleted) {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: designation.id,
      code: designation.code,
      name: designation.name,
      description: designation.description ?? null,
      grade: designation.grade ?? null,
      minSalary: designation.minSalary,
      maxSalary: designation.maxSalary,
      isActive: designation.isActive,
      isDeleted: designation.isDeleted,
      employeeCount: designation._count.employees,
      employees: designation.employees,
      createdBy: designation.createdBy ?? null,
      createdDate: designation.createdDate ?? null,
      updatedBy: designation.updatedBy ?? null,
      updatedDate: designation.updatedDate ?? null,
    })
  } catch (error) {
    console.error('Get designation error:', error)
    return NextResponse.json({ error: 'Failed to fetch designation' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/designations/[id] — Update designation (code is read-only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.designation.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted designation' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Designation name cannot be empty' }, { status: 400 })
    }

    // Validate salary band
    if (body.minSalary !== undefined && body.maxSalary !== undefined) {
      const minSalary = Number(body.minSalary) || 0
      const maxSalary = Number(body.maxSalary) || 0
      if (maxSalary > 0 && minSalary > 0 && maxSalary < minSalary) {
        return NextResponse.json(
          { error: 'Maximum salary must be greater than or equal to minimum salary' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'grade', 'minSalary', 'maxSalary', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'minSalary' || field === 'maxSalary') {
          updateData[field] = Number(body[field]) || 0
        } else {
          updateData[field] = body[field]
        }
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const designation = await tx.designation.update({
        where: { id },
        data: updateData,
      })
      return designation
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Designation',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        description: existing.description,
        grade: existing.grade,
        minSalary: existing.minSalary,
        maxSalary: existing.maxSalary,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        grade: result.grade,
        minSalary: result.minSalary,
        maxSalary: result.maxSalary,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update designation error:', error)
    return NextResponse.json({ error: 'Failed to update designation' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/designations/[id] — Soft-delete (check active employees)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.designation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Designation is already deleted' }, { status: 400 })
    }

    // Check for active employees linked to this designation
    const activeEmployees = await db.employee.count({
      where: { designationId: id, ...notDeleted() },
    })

    if (activeEmployees > 0) {
      return NextResponse.json(
        { error: `Cannot delete: designation has ${activeEmployees} active employee(s). Please reassign employees first.` },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await softDelete(tx.designation, id, undefined)
      await createAuditLog({
        action: 'Delete',
        entity: 'Designation',
        entityId: id,
        oldValues: {
          code: existing.code,
          name: existing.name,
          description: existing.description,
          grade: existing.grade,
          minSalary: existing.minSalary,
          maxSalary: existing.maxSalary,
        },
      })
    })

    return NextResponse.json({ message: 'Designation soft-deleted successfully' })
  } catch (error) {
    console.error('Delete designation error:', error)
    return NextResponse.json({ error: 'Failed to delete designation' }, { status: 400 })
  }
}
