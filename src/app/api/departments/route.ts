// ============================================================================
// Electronics Mart IMS — Departments CRUD API
// Full: GET (list/search), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/departments — List departments
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
      ]
    }

    const departments = await db.department.findMany({
      where,
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      description: d.description ?? null,
      isActive: d.isActive,
      isDeleted: d.isDeleted,
      employeeCount: d._count.employees,
      createdBy: d.createdBy ?? null,
      createdDate: d.createdDate ?? null,
      updatedBy: d.updatedBy ?? null,
      updatedDate: d.updatedDate ?? null,
    })))
  } catch (error) {
    console.error('Departments API error:', error)
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/departments — Create department with auto-code DEP-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Department')

      const department = await tx.department.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
      })

      return department
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Department',
      entityId: result.id,
      newValues: { code: result.code, name: result.name, description: result.description },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create department error:', error)
    return NextResponse.json({ error: 'Failed to create department' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/departments — Update department (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 })
    }

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
// DELETE /api/departments — Soft-delete (block if has active employees)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 })
    }

    const existing = await db.department.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Department is already deleted' }, { status: 400 })
    }

    // Check for active employees in this department
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
