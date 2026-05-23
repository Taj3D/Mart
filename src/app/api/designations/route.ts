// ============================================================================
// Electronics Mart IMS — Designations CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/designations — List designations
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
        { description: { contains: search } },
        { grade: { contains: search } },
      ]
    }

    const designations = await db.designation.findMany({
      where,
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(designations.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      description: d.description ?? null,
      grade: d.grade ?? null,
      minSalary: d.minSalary,
      maxSalary: d.maxSalary,
      isActive: d.isActive,
      isDeleted: d.isDeleted,
      employeeCount: d._count.employees,
      createdBy: d.createdBy ?? null,
      createdDate: d.createdDate ?? null,
      updatedBy: d.updatedBy ?? null,
      updatedDate: d.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Designations API error:', error)
    return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/designations — Create designation with auto-code DSG-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Designation name is required' }, { status: 400 })
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

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Designation')

      const designation = await tx.designation.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          grade: body.grade || null,
          minSalary: Number(body.minSalary) || 0,
          maxSalary: Number(body.maxSalary) || 0,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return designation
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Designation',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        grade: result.grade,
        minSalary: result.minSalary,
        maxSalary: result.maxSalary,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create designation error:', error)
    return NextResponse.json({ error: 'Failed to create designation' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/designations — Update designation (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Designation ID is required' }, { status: 400 })
    }

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
// DELETE /api/designations — Soft-delete (check active employees first)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Designation ID is required' }, { status: 400 })
    }

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
