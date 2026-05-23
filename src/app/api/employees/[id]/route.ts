// ============================================================================
// Electronics Mart IMS — Employee Detail API
// GET / PUT / DELETE by ID
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/employees/[id] — Get single employee with relations
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true, code: true } },
        designation: { select: { id: true, name: true, code: true } },
        _count: { select: { leaves: true, srTargets: true } },
      },
    })

    if (!employee || employee.isDeleted) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: employee.id,
      code: employee.code,
      name: employee.name,
      email: employee.email ?? null,
      phone: employee.phone ?? null,
      accountNo: employee.accountNo ?? null,
      departmentId: employee.departmentId ?? null,
      designationId: employee.designationId ?? null,
      religion: employee.religion ?? null,
      salary: employee.salary,
      srDueLimit: employee.srDueLimit,
      photo: employee.photo ?? null,
      nid: employee.nid ?? null,
      fatherName: employee.fatherName ?? null,
      motherName: employee.motherName ?? null,
      joinDate: employee.joinDate ? employee.joinDate.toISOString() : null,
      dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString() : null,
      bloodGroup: employee.bloodGroup ?? null,
      presentAddress: employee.presentAddress ?? null,
      permanentAddress: employee.permanentAddress ?? null,
      emergencyContact: employee.emergencyContact ?? null,
      status: employee.status,
      isActive: employee.isActive,
      isDeleted: employee.isDeleted,
      department: employee.department ? { id: employee.department.id, name: employee.department.name, code: employee.department.code } : null,
      designation: employee.designation ? { id: employee.designation.id, name: employee.designation.name, code: employee.designation.code } : null,
      leaveCount: employee._count.leaves,
      srTargetCount: employee._count.srTargets,
      createdBy: employee.createdBy ?? null,
      createdDate: employee.createdDate ? employee.createdDate.toISOString() : null,
      updatedBy: employee.updatedBy ?? null,
      updatedDate: employee.updatedDate ? employee.updatedDate.toISOString() : null,
    })
  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/employees/[id] — Update employee (code is read-only)
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

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

    // Handle date fields
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
// DELETE /api/employees/[id] — Soft-delete (check active srTargets)
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
