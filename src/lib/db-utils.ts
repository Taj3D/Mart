// ============================================================================
// Electronics Mart IMS — Database Utility Helpers
// Phase 2: Auto-code generation, soft-delete, base entity types
// ============================================================================

import { db } from '@/lib/db'

// ============================================================================
// 1. BASE ENTITY TYPE DEFINITIONS
// ============================================================================

/**
 * Shared BaseEntity interface mapping the mandatory automated fields
 * present on every corporate model for operational tracing.
 * All models inherit these fields — do NOT duplicate in individual types.
 */
export interface BaseEntity {
  isDeleted: boolean
  createdBy: string | null
  createdDate: Date
  updatedBy: string | null
  updatedDate: Date
}

/**
 * Extended BaseEntity for models that also carry isActive flag.
 * Most configuration and master-data models use this variant.
 */
export interface ActiveEntity extends BaseEntity {
  isActive: boolean
}

// ============================================================================
// 2. AUTO-CODE GENERATION ENGINE
// ============================================================================

/**
 * Code prefix registry — maps model names to their immutable 5-digit
 * zero-padded auto record number prefixes.
 *
 * Format: {PREFIX}-{5-digit zero-padded number}
 * Example: CUS-00001, PRT-00001, DMG-00001
 */
export const CODE_PREFIXES: Record<string, string> = {
  InvestmentHead:    'INVH',
  Investment:        'INV',
  Asset:             'AST',
  FixedAsset:        'FAX',
  CurrentAsset:      'CAX',
  DepreciationLog:   'DPR',
  Liability:         'LIA',
  LiabilityTransaction: 'LTX',
  LiabilityPayment:  'LPY',
  Company:           'CMP',
  Category:          'CAT',
  Color:             'CLR',
  Brand:             'BRD',
  Unit:              'UNT',
  Warehouse:         'WHS',
  Segment:           'SEG',
  Capacity:          'CAP',
  SrTarget:          'SRT',
  PaymentOption:     'POP',
  CardType:          'CDT',
  Customer:          'CUS',
  Supplier:          'SUP',
  Employee:          'EMP',
  Designation:       'DSG',
  Department:        'DEP',
  EmployeeLeave:     'LV',
  Product:           'PRT',
  OrderSheet:        'OS',
  PurchaseOrder:     'PO',
  SalesOrder:        'SO',
  StockDetail:       'STK',
  StockTransfer:     'TRF',
  StockAdjustment:   'ADJ',
  SalesReturn:       'SR',
  PurchaseReturn:    'PR',
  DamageProduct:     'DMG',
  ReplacementOrder:  'RPL',
  Transaction:       'TXN',
  Expense:           'EXP',
  Income:            'INC',
  CashCollection:    'CC',
  CashDelivery:      'CD',
  BankAccount:       'BNA',
  BankTransaction:   'BNT',
  Invoice:           'INV',
  Payment:           'PAY',
  User:              'USR',
}

/**
 * Generates the next immutable 5-digit zero-padded code for a given model.
 *
 * Algorithm:
 * 1. Look up the prefix from CODE_PREFIXES registry
 * 2. Query the database for the MAX(code) with that prefix
 * 3. Extract the numeric portion, increment by 1
 * 4. Return the formatted code: {PREFIX}-{5-digit padded number}
 *
 * Thread-safe for single-writer SQLite. For multi-writer scenarios,
 * wrap in a transaction with SELECT FOR UPDATE equivalent.
 *
 * @param modelName - The Prisma model name (e.g., "Customer", "Product")
 * @returns The next code string (e.g., "CUS-00001", "CUS-00002")
 *
 * @example
 * const code = await generateNextCode('Customer') // "CUS-00001"
 * const code2 = await generateNextCode('Customer') // "CUS-00002"
 */
export async function generateNextCode(modelName: string): Promise<string> {
  const prefix = CODE_PREFIXES[modelName]
  if (!prefix) {
    throw new Error(`No code prefix defined for model: ${modelName}`)
  }

  // Use raw query to find the max code with this prefix across the correct table
  // NOTE: Prisma tagged template literals cannot parameterize table names,
  // so we use $queryRawUnsafe with proper SQL-identifier escaping.
  const tableName = modelName.replace(/[^a-zA-Z0-9_]/g, '') // Sanitize table name
  const likePattern = `${prefix}-%`

  // Query the table for max code with the prefix
  const result = await db.$queryRawUnsafe<Array<{ maxCode: string | null }>>(
    `SELECT MAX(code) as maxCode FROM "${tableName}" WHERE code LIKE ?`,
    likePattern
  )

  const maxCode = result[0]?.maxCode

  if (!maxCode) {
    // First record with this prefix
    return `${prefix}-00001`
  }

  // Extract numeric portion after the hyphen
  const numericPart = maxCode.split('-')[1]
  const currentNumber = parseInt(numericPart, 10)

  if (isNaN(currentNumber)) {
    throw new Error(`Invalid code format encountered: ${maxCode}`)
  }

  const nextNumber = currentNumber + 1

  // Enforce 5-digit boundary (max 99999)
  if (nextNumber > 99999) {
    throw new Error(
      `Code overflow: ${modelName} has exceeded the 5-digit limit (99999). ` +
      `Consider archiving old records or extending the code format.`
    )
  }

  return `${prefix}-${String(nextNumber).padStart(5, '0')}`
}

/**
 * Batch variant — generates multiple sequential codes in one call.
 * Useful for bulk import operations.
 *
 * @param modelName - The Prisma model name
 * @param count - Number of codes to generate
 * @returns Array of sequential code strings
 */
export async function generateNextCodes(modelName: string, count: number): Promise<string[]> {
  const prefix = CODE_PREFIXES[modelName]
  if (!prefix) {
    throw new Error(`No code prefix defined for model: ${modelName}`)
  }

  const tableName = modelName.replace(/[^a-zA-Z0-9_]/g, '')
  const likePattern = `${prefix}-%`
  const result = await db.$queryRawUnsafe<Array<{ maxCode: string | null }>>(
    `SELECT MAX(code) as maxCode FROM "${tableName}" WHERE code LIKE ?`,
    likePattern
  )

  const maxCode = result[0]?.maxCode
  const startNumber = maxCode
    ? parseInt(maxCode.split('-')[1], 10) + 1
    : 1

  if (isNaN(startNumber)) {
    throw new Error(`Invalid code format encountered: ${maxCode}`)
  }

  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const num = startNumber + i
    if (num > 99999) {
      throw new Error(`Code overflow: ${modelName} would exceed 5-digit limit`)
    }
    codes.push(`${prefix}-${String(num).padStart(5, '0')}`)
  }

  return codes
}

// ============================================================================
// 3. SOFT-DELETE HELPER
// ============================================================================

/**
 * Soft-delete filter — returns the standard where clause for excluding
 * soft-deleted records. Apply this to every query by default.
 *
 * @example
 * const products = await db.product.findMany({
 *   where: {
 *     ...notDeleted(),
 *     categoryId: '123'
 *   }
 * })
 */
export function notDeleted(): { isDeleted: false } {
  return { isDeleted: false }
}

/**
 * Active & not-deleted filter — combines both flags for master data queries.
 * Most list/dropdown queries should use this.
 *
 * @example
 * const customers = await db.customer.findMany({
 *   where: {
 *     ...activeNotDeleted(),
 *     customerType: 'Wholesale'
 *   }
 * })
 */
export function activeNotDeleted(): { isActive: true; isDeleted: false } {
  return { isActive: true, isDeleted: false }
}

/**
 * Perform a soft-delete on a record by setting isDeleted = true.
 * The record remains in the database for audit/recovery purposes.
 *
 * @param model - The Prisma delegate (e.g., db.customer)
 * @param id - The record ID to soft-delete
 * @param deletedBy - The user ID performing the deletion
 */
export async function softDelete<T extends { update: (args: any) => Promise<any> }>(
  model: T,
  id: string,
  deletedBy?: string
): Promise<any> {
  return model.update({
    where: { id },
    data: {
      isDeleted: true,
      updatedBy: deletedBy ?? null,
      updatedDate: new Date(),
    },
  })
}

/**
 * Recover a soft-deleted record by setting isDeleted = false.
 *
 * @param model - The Prisma delegate
 * @param id - The record ID to recover
 * @param recoveredBy - The user ID performing the recovery
 */
export async function recoverDeleted<T extends { update: (args: any) => Promise<any> }>(
  model: T,
  id: string,
  recoveredBy?: string
): Promise<any> {
  return model.update({
    where: { id },
    data: {
      isDeleted: false,
      updatedBy: recoveredBy ?? null,
      updatedDate: new Date(),
    },
  })
}

// ============================================================================
// 4. AUDIT LOG HELPER
// ============================================================================

/**
 * Create an audit log entry for tracking system changes.
 * Automatically records who, what, when, and the before/after values.
 */
export async function createAuditLog(params: {
  userId?: string
  action: 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'Export' | 'Import'
  entity: string
  entityId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
      newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  })
}

// ============================================================================
// 5. BULK UTILITY INDEX VERIFICATION
// ============================================================================

/**
 * Verifies that the database has the necessary indices for high-volume
 * bulk operations (CSV import staging, CSV export streams, PDF landscape).
 * Returns a report of index coverage per model.
 *
 * This is a diagnostic utility — call it from admin/settings panels.
 */
export async function verifyBulkIndices(): Promise<Record<string, string[]>> {
  // SQLite: query sqlite_master for index names
  const indices = await db.$queryRaw<Array<{ name: string; tbl_name: string }>>`
    SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'
    ORDER BY tbl_name, name
  `

  const report: Record<string, string[]> = {}
  for (const idx of indices) {
    if (!report[idx.tbl_name]) {
      report[idx.tbl_name] = []
    }
    report[idx.tbl_name].push(idx.name)
  }

  return report
}
