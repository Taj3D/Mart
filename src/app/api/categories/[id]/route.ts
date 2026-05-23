// ============================================================================
// Electronics Mart IMS — Category [id] CRUD API
// GET by ID, PUT by ID, DELETE by ID (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// GET /api/categories/[id] — Get single category with parent, children, product count
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: {
          where: notDeleted(),
          include: {
            _count: { select: { products: true } },
          },
          orderBy: { name: 'asc' },
        },
        _count: { select: { products: true, children: true } },
      },
    })

    if (!category || category.isDeleted) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description,
      parentId: category.parentId,
      parentName: category.parent?.name ?? null,
      parentCode: category.parent?.code ?? null,
      isActive: category.isActive,
      isDeleted: category.isDeleted,
      productCount: category._count.products,
      childCount: category._count.children,
      children: category.children.map((ch) => ({
        id: ch.id,
        code: ch.code,
        name: ch.name,
        description: ch.description,
        parentId: ch.parentId,
        isActive: ch.isActive,
        productCount: ch._count.products,
      })),
      createdBy: category.createdBy,
      createdDate: category.createdDate,
      updatedBy: category.updatedBy,
      updatedDate: category.updatedDate,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// ============================================================================
// PUT /api/categories/[id] — Update with transaction + audit log
// Code field is read-only on edit
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted category' }, { status: 400 })
    }

    // Prevent setting parentId to self
    if (body.parentId === id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 })
    }

    // Validate name if provided
    if (body.name !== undefined && (!body.name || !String(body.name).trim())) {
      return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 })
    }

    // Code is read-only — never allow changing it
    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'parentId', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }
    updateData['updatedBy'] = body.updatedBy || null

    // Atomic transaction
    const result = await db.$transaction(async (tx) => {
      const category = await tx.category.update({
        where: { id },
        data: updateData,
        include: {
          parent: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true, children: true } },
        },
      })
      return category
    })

    // Audit log
    await createAuditLog({
      userId: body.updatedBy || undefined,
      action: 'Update',
      entity: 'Category',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        description: existing.description,
        parentId: existing.parentId,
        isActive: existing.isActive,
      },
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        parentId: result.parentId,
        isActive: result.isActive,
      },
    })

    return NextResponse.json({
      id: result.id,
      code: result.code,
      name: result.name,
      description: result.description,
      parentId: result.parentId,
      parentName: result.parent?.name ?? null,
      isActive: result.isActive,
      productCount: result._count.products,
      childCount: result._count.children,
      updatedBy: result.updatedBy,
      updatedDate: result.updatedDate,
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// ============================================================================
// DELETE /api/categories/[id] — Soft-delete with audit log
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Category is already deleted' }, { status: 400 })
    }

    // Check for active products
    const activeProducts = await db.product.count({
      where: { categoryId: id, ...notDeleted() },
    })
    if (activeProducts > 0) {
      return NextResponse.json(
        { error: `Cannot delete: category has ${activeProducts} active product(s). Please reassign products first.` },
        { status: 400 }
      )
    }

    // Soft-delete using the helper
    await softDelete(db.category, id, undefined)

    // Audit log
    await createAuditLog({
      action: 'Delete',
      entity: 'Category',
      entityId: id,
      oldValues: {
        code: existing.code,
        name: existing.name,
        isActive: existing.isActive,
      },
    })

    return NextResponse.json({ message: 'Category soft-deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
