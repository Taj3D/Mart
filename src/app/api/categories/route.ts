// ============================================================================
// Electronics Mart IMS — Category CRUD API
// Full: GET (tree/flat), POST (create), PUT (update), DELETE (soft-delete)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

// ============================================================================
// HELPER: Map category record to API response
// ============================================================================

function mapCategory(c: Record<string, any>) {
  return {
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description ?? null,
    parentId: c.parentId ?? null,
    parentName: c.parent?.name ?? null,
    isActive: c.isActive,
    isDeleted: c.isDeleted ?? false,
    productCount: c._count?.products ?? 0,
    childCount: c._count?.children ?? 0,
    children: Array.isArray(c.children) ? c.children.map(mapCategory) : [],
    createdBy: c.createdBy ?? null,
    createdDate: c.createdDate ?? c.createdAt ?? null,
    updatedBy: c.updatedBy ?? null,
    updatedDate: c.updatedDate ?? c.updatedAt ?? null,
  }
}

// ============================================================================
// GET /api/categories — List categories
// Params: ?all=true (include inactive), ?flat=true (flat list)
// ============================================================================

export async function GET(request?: NextRequest) {
  try {
    const showAll = request?.nextUrl?.searchParams?.get('all') === 'true'
    const flat = request?.nextUrl?.searchParams?.get('flat') === 'true'

    const baseWhere = showAll ? notDeleted() : activeNotDeleted()

    if (flat) {
      // Flat list for dropdowns and imports
      const categories = await db.category.findMany({
        where: baseWhere,
        include: {
          parent: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true, children: true } },
        },
        orderBy: { code: 'asc' },
      })

      return NextResponse.json(categories.map(mapCategory))
    }

    // Tree structure (default) — root categories with nested children
    const categories = await db.category.findMany({
      where: {
        ...baseWhere,
        parentId: null,
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        _count: { select: { products: true, children: true } },
        children: {
          where: baseWhere,
          include: {
            parent: { select: { id: true, name: true, code: true } },
            _count: { select: { products: true, children: true } },
            children: {
              where: baseWhere,
              include: {
                parent: { select: { id: true, name: true, code: true } },
                _count: { select: { products: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(categories.map(mapCategory))
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// ============================================================================
// POST /api/categories — Create category
// Auto-generates code, uses $transaction for atomicity
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation: name is required
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    // Atomic transaction: generate code + create category + audit log
    const result = await db.$transaction(async (tx) => {
      // Generate next code
      const code = await generateNextCode('Category')

      // Create the category
      const category = await tx.category.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          parentId: body.parentId || null,
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdBy: body.createdBy || null,
        },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true, children: true } },
        },
      })

      return category
    })

    // Audit log (outside transaction for non-blocking)
    await createAuditLog({
      userId: body.createdBy || undefined,
      action: 'Create',
      entity: 'Category',
      entityId: result.id,
      newValues: {
        code: result.code,
        name: result.name,
        description: result.description,
        parentId: result.parentId,
        isActive: result.isActive,
      },
    })

    return NextResponse.json(mapCategory(result), { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 400 })
  }
}

// ============================================================================
// PUT /api/categories — Update category (code is read-only)
// Uses $transaction for atomicity
// ============================================================================

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const id = body.id

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Fetch existing for audit comparison
    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    if (existing.isDeleted) {
      return NextResponse.json({ error: 'Cannot update a deleted category' }, { status: 400 })
    }

    // Prevent setting parentId to self (circular reference)
    if (body.parentId === id) {
      return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 })
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

    // Validate name if provided
    if (updateData.name !== undefined && (!updateData.name || !String(updateData.name).trim())) {
      return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 })
    }

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

    return NextResponse.json(mapCategory(result))
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 400 })
  }
}

// ============================================================================
// DELETE /api/categories — Soft-delete using helper
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

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

    // Warn if category has active products
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
    console.error('Delete category error:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 400 })
  }
}
