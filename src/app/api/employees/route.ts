// ============================================================================
// Electronics Mart IMS — Employees CRUD API
// Full: GET (list/search/filter), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/employees — List employees with relations
// Params: ?search=, ?departmentId=, ?designationId=, ?status=, ?all=true
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('all') === 'true'
    const search = request.nextUrl.searchParams.get('search') || ''
    const departmentId = request.nextUrl.searchParams.get('departmentId') || ''
    const designationId = request.nextUrl.searchParams.get('designationId') || ''
    const status = request.nextUrl.searchParams.get('status') || ''

    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    const where: Record<string, unknown> = { ...baseWhere }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (designationId) {
      where.designationId = designationId
    }

    if (status) {
      where.status = status
    }

    const employees = await db.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
        _count: { select: { leaves: true, srTargets: true } },
      },
      orderBy: { createdDate: 'desc' },
    })

    return NextResponse.json(employees.map((e) => ({
      id: e.id,
      code: e.code,
      name: e.name,
      email: e.email ?? null,
      phone: e.phone ?? null,
      accountNo: e.accountNo ?? null,
      departmentId: e.departmentId ?? null,
      designationId: e.designationId ?? null,
      religion: e.religion ?? null,
      salary: e.salary,
      srDueLimit: e.srDueLimit,
      photo: e.photo ?? null,
      nid: e.nid ?? null,
      fatherName: e.fatherName ?? null,
      motherName: e.motherName ?? null,
      joinDate: e.joinDate ? e.joinDate.toISOString() : null,
      dateOfBirth: e.dateOfBirth ? e.dateOfBirth.toISOString() : null,
      bloodGroup: e.bloodGroup ?? null,
      presentAddress: e.presentAddress ?? null,
      permanentAddress: e.permanentAddress ?? null,
      emergencyContact: e.emergencyContact ?? null,
      status: e.status,
      isActive: e.isActive,
      isDeleted: e.isDeleted,
      department: e.department ? { id: e.department.id, name: e.department.name } : null,
      designation: e.designation ? { id: e.designation.id, name: e.designation.name } : null,
      leaveCount: e._count.leaves,
      srTargetCount: e._count.srTargets,
      createdBy: e.createdBy ?? null,
      createdDate: e.createdDate ? e.createdDate.toISOString() : null,
      updatedBy: e.updatedBy ?? null,
      updatedDate: e.updatedDate ? e.updatedDate.toISOString() : null,
    })))
  } catch (error) {
    console.error('Employees API error:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/employees — Create employee with auto-code EMP-00001
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Employee name is required' }, { status: 400 })
    }

    const result = await db.$transaction(async (tx) => {
      const code = await generateNextCode('Employee')

      // Parse dates
      const joinDate = body.joinDate ? new Date(body.joinDate) : undefined
      const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined

      const employee = await tx.employee.create({
        data: {
          code,
          name: body.name.trim(),
          email: body.email?.trim() || null,
          phone: body.phone?.trim() || null,
          accountNo: body.accountNo?.trim() || null,
          departmentId: body.departmentId || null,
          designationId: body.designationId || null,
          religion: body.religion || null,
          salary: Number(body.salary) || 0,
          srDueLimit: Number(body.srDueLimit) || 0,
          photo: body.photo || null,
          nid: body.nid?.trim() || null,
          fatherName: body.fatherName?.trim() || null,
          motherName: body.motherName?.trim() || null,
          joinDate: joinDate ?? new Date(),
          dateOfBirth: dateOfBirth ?? undefined,
          bloodGroup: body.bloodGroup || null,
          presentAddress: body.presentAddress?.trim() || null,
          permanentAddress: body.permanentAddress?.trim() || null,
          emergencyContact: body.emergencyContact?.trim() || null,
          status: body.status || 'Active',
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
        },
      })

      return employee
    })

    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Employee',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        departmentId: result.departmentId,
        designationId: result.designationId,
        salary: result.salary,
        status: result.status,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/employees — Update employee (code is read-only)
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    const existing = await db.employee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted employee' }, { status: 400 })
    }

    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Employee name cannot be empty' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'name', 'email', 'phone', 'accountNo',
      'departmentId', 'designationId', 'religion',
      'salary', 'srDueLimit', 'photo', 'nid',
      'fatherName', 'motherName', 'bloodGroup',
      'presentAddress', 'permanentAddress', 'emergencyContact',
      'status', 'isActive',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'salary' || field === 'srDueLimit') {
          updateData[field] = Number(body[field]) || 0
        } else if (field === 'isActive') {
          updateData[field] = Boolean(body[field])
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Handle date fields separately
    if (body.joinDate !== undefined) {
      updateData.joinDate = body.joinDate ? new Date(body.joinDate) : new Date()
    }
    if (body.dateOfBirth !== undefined) {
      updateData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
    }

    updateData['updatedBy'] = body.updatedBy || null

    const result = await db.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: { id },
        data: updateData,
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
        },
      })
      return employee
    })

    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Employee',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        departmentId: existing.departmentId,
        designationId: existing.designationId,
        salary: existing.salary,
        status: existing.status,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        departmentId: result.departmentId,
        designationId: result.designationId,
        salary: result.salary,
        status: result.status,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/employees — Soft-delete (check active srTargets first)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    const existing = await db.employee.findUnique({
      where: { id },
      include: {
        _count: { select: { srTargets: { where: { isActive: true, isDeleted: false } } } },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Employee is already deleted' }, { status: 400 })
    }

    // Check for active SR targets
    const activeSrTargets = existing._count.srTargets
    if (activeSrTargets > 0) {
      return NextResponse.json(
        { error: `Cannot delete: employee has ${activeSrTargets} active SR target(s). Please resolve them first.` },
        { status: 400 }
      )
    }

    await db.$transaction(async (tx) => {
      await softDelete(tx.employee, id, undefined)
      await createAuditLog({
        action: 'Delete',
        entity: 'Employee',
        entityId: id,
        oldValues: {
          code: existing.code,
          name: existing.name,
          departmentId: existing.departmentId,
          designationId: existing.designationId,
          salary: existing.salary,
          status: existing.status,
        },
      })
    })

    return NextResponse.json({ message: 'Employee soft-deleted successfully' })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 400 })
  }
}
