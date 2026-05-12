import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/categories/[id] - Get single category with children
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        parentId: category.parentId,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        parent: category.parent,
        productCount: category._count.products,
        children: category.children.map(ch => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          parentId: ch.parentId,
          isActive: ch.isActive,
          productCount: ch._count.products,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingCategory = await db.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Prevent setting parentId to self
    if (body.parentId === id) {
      return NextResponse.json(
        { error: 'Category cannot be its own parent' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    const allowedFields = ['name', 'description', 'parentId', 'isActive']

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    })

    return NextResponse.json({ data: category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category (only if no products or children)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products' },
        { status: 400 }
      )
    }

    // Check if category has children
    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
