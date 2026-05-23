import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateNextCode, notDeleted, activeNotDeleted, softDelete, createAuditLog } from '@/lib/db-utils'

/** GET /api/brands — List brands */
export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('all') === 'true'

    const brands = await db.brand.findMany({
      where: showAll ? notDeleted() : activeNotDeleted(),
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(brands.map(b => ({
      id: b.id,
      code: b.code,
      name: b.name,
      description: b.description,
      logo: b.logo,
      isActive: b.isActive,
      isDeleted: b.isDeleted,
      productCount: b._count.products,
      createdDate: b.createdDate,
      updatedDate: b.updatedDate,
    })))
  } catch (error) {
    console.error('Brands GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

/** POST /api/brands — Create brand */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    const code = await generateNextCode('Brand')

    const brand = await db.$transaction(async (tx) => {
      const created = await tx.brand.create({
        data: {
          code,
          name: body.name.trim(),
          description: body.description?.trim() || null,
          logo: body.logo?.trim() || null,
          isActive: body.isActive !== false,
          createdBy: body.createdBy || null,
        },
      })

      await createAuditLog({
        action: 'Create',
        entity: 'Brand',
        entityId: created.id,
        newValues: { code: created.code, name: created.name },
        userId: body.createdBy || undefined,
      })

      return created
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Brands POST error:', error)
    if (error instanceof Error && error.message.includes('Unique')) {
      return NextResponse.json({ error: 'Brand name or code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}

/** PUT /api/brands — Update brand */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    if (!data.name?.trim()) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 })
    }

    const brand = await db.$transaction(async (tx) => {
      // Get old values for audit
      const old = await tx.brand.findUnique({ where: { id } })
      if (!old) throw new Error('Brand not found')

      const updated = await tx.brand.update({
        where: { id },
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          logo: data.logo?.trim() || null,
          isActive: data.isActive !== undefined ? data.isActive : old.isActive,
          updatedBy: data.updatedBy || null,
        },
      })

      await createAuditLog({
        action: 'Update',
        entity: 'Brand',
        entityId: updated.id,
        oldValues: { name: old.name, description: old.description, logo: old.logo, isActive: old.isActive },
        newValues: { name: updated.name, description: updated.description, logo: updated.logo, isActive: updated.isActive },
        userId: data.updatedBy || undefined,
      })

      return updated
    })

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Brands PUT error:', error)
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 400 })
  }
}

/** DELETE /api/brands — Soft-delete brand */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId') || undefined

    if (!id) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check for active products
    const productCount = await db.product.count({
      where: { brandId: id, isDeleted: false, isActive: true },
    })

    if (productCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${productCount} active product(s) are linked to this brand` },
        { status: 409 }
      )
    }

    await softDelete(db.brand, id, userId)

    await createAuditLog({
      action: 'Delete',
      entity: 'Brand',
      entityId: id,
      userId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Brands DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 400 })
  }
}
