'use client'

import * as React from "react"
import {
  Search,
  Package,
  Users,
  Tag,
  FolderOpen,
  ShoppingCart,
  Truck,
  FileText,
  Building2,
  Star,
  CheckCircle2,
  ListFilter,
} from "lucide-react"
import { SearchableSelect } from "@/components/select/searchable-select"
import type { SelectOption } from "@/components/select/searchable-select"
import { MultiSelect } from "@/components/select/multi-select"
import type { MultiSelectOption } from "@/components/select/multi-select"
import { AsyncSelect } from "@/components/select/async-select"
import type { AsyncSelectOption } from "@/components/select/async-select"
import { ClassicSelect } from "@/components/select/classic-select"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// ===== ERP Sample Data =====

const productOptions: SelectOption[] = [
  { value: "prod-001", label: "Industrial Motor IM-200", group: "Motors", icon: <Package className="h-3.5 w-3.5 text-navy-500" /> },
  { value: "prod-002", label: "Servo Motor SM-100", group: "Motors", icon: <Package className="h-3.5 w-3.5 text-navy-500" /> },
  { value: "prod-003", label: "Hydraulic Pump HP-500", group: "Pumps", icon: <Package className="h-3.5 w-3.5 text-emerald-500" /> },
  { value: "prod-004", label: "Centrifugal Pump CP-300", group: "Pumps", icon: <Package className="h-3.5 w-3.5 text-emerald-500" /> },
  { value: "prod-005", label: "Steel Bearing SB-080", group: "Bearings", icon: <Package className="h-3.5 w-3.5 text-amber-500" /> },
  { value: "prod-006", label: "Ceramic Bearing CB-060", group: "Bearings", icon: <Package className="h-3.5 w-3.5 text-amber-500" /> },
  { value: "prod-007", label: "PLC Controller PX-400", group: "Controllers", icon: <Package className="h-3.5 w-3.5 text-rose-500" /> },
  { value: "prod-008", label: "Temperature Sensor TS-100", group: "Sensors", icon: <Package className="h-3.5 w-3.5 text-sky-500" /> },
  { value: "prod-009", label: "Pressure Sensor PS-200", group: "Sensors", icon: <Package className="h-3.5 w-3.5 text-sky-500" /> },
  { value: "prod-010", label: "Conveyor Belt CB-1500", group: "Conveyors", disabled: true, icon: <Package className="h-3.5 w-3.5 text-muted-foreground" /> },
]

const categoryOptions: SelectOption[] = [
  { value: "cat-motors", label: "Motors & Drives", group: "Power Systems" },
  { value: "cat-pumps", label: "Pumps & Valves", group: "Power Systems" },
  { value: "cat-bearings", label: "Bearings & Seals", group: "Mechanical" },
  { value: "cat-controllers", label: "PLC Controllers", group: "Automation" },
  { value: "cat-sensors", label: "Sensors & Transducers", group: "Automation" },
  { value: "cat-conveyors", label: "Conveyors & Material Handling", group: "Logistics" },
  { value: "cat-safety", label: "Safety Equipment", group: "Compliance" },
  { value: "cat-tools", label: "Hand & Power Tools", group: "Maintenance" },
]

const customerOptions: SelectOption[] = [
  { value: "cust-001", label: "Acme Manufacturing Co." },
  { value: "cust-002", label: "Global Industries Ltd." },
  { value: "cust-003", label: "TechPrime Solutions" },
  { value: "cust-004", label: "Northern Steel Works" },
  { value: "cust-005", label: "Pacific Trading Corp." },
  { value: "cust-006", label: "Metro Engineering Group" },
]

const multiSelectProducts: MultiSelectOption[] = [
  { value: "prod-001", label: "Industrial Motor IM-200", group: "Motors" },
  { value: "prod-002", label: "Servo Motor SM-100", group: "Motors" },
  { value: "prod-003", label: "Hydraulic Pump HP-500", group: "Pumps" },
  { value: "prod-004", label: "Centrifugal Pump CP-300", group: "Pumps" },
  { value: "prod-005", label: "Steel Bearing SB-080", group: "Bearings" },
  { value: "prod-006", label: "Ceramic Bearing CB-060", group: "Bearings" },
  { value: "prod-007", label: "PLC Controller PX-400", group: "Controllers" },
  { value: "prod-008", label: "Temperature Sensor TS-100", group: "Sensors" },
  { value: "prod-009", label: "Pressure Sensor PS-200", group: "Sensors" },
  { value: "prod-010", label: "Flow Meter FM-300", group: "Sensors" },
]

const multiSelectCategories: MultiSelectOption[] = [
  { value: "cat-motors", label: "Motors & Drives", group: "Power Systems" },
  { value: "cat-pumps", label: "Pumps & Valves", group: "Power Systems" },
  { value: "cat-bearings", label: "Bearings & Seals", group: "Mechanical" },
  { value: "cat-controllers", label: "PLC Controllers", group: "Automation" },
  { value: "cat-sensors", label: "Sensors & Transducers", group: "Automation" },
  { value: "cat-safety", label: "Safety Equipment", group: "Compliance" },
]

const classicSelectOptions: SelectOption[] = [
  { value: "status-active", label: "Active" },
  { value: "status-inactive", label: "Inactive" },
  { value: "status-pending", label: "Pending Review" },
  { value: "status-discontinued", label: "Discontinued", disabled: true },
  { value: "status-archived", label: "Archived" },
]

const warehouseOptions: SelectOption[] = [
  { value: "wh-main", label: "Main Warehouse (Zone A)" },
  { value: "wh-secondary", label: "Secondary Storage (Zone B)" },
  { value: "wh-cold", label: "Cold Storage (Zone C)" },
  { value: "wh-hazardous", label: "Hazardous Materials (Zone D)" },
  { value: "wh-returns", label: "Returns Processing (Zone E)" },
]

// Simulated async search function
const simulateAsyncSearch = async (query: string): Promise<AsyncSelectOption[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const allCustomers: AsyncSelectOption[] = [
    { value: "cust-001", label: "Acme Manufacturing Co.", group: "Tier 1" },
    { value: "cust-002", label: "Global Industries Ltd.", group: "Tier 1" },
    { value: "cust-003", label: "TechPrime Solutions", group: "Tier 2" },
    { value: "cust-004", label: "Northern Steel Works", group: "Tier 2" },
    { value: "cust-005", label: "Pacific Trading Corp.", group: "Tier 3" },
    { value: "cust-006", label: "Metro Engineering Group", group: "Tier 3" },
    { value: "cust-007", label: "Summit Electric Inc.", group: "Tier 1" },
    { value: "cust-008", label: "BlueLine Logistics", group: "Tier 2" },
    { value: "cust-009", label: "Alpine Automation", group: "Tier 1" },
    { value: "cust-010", label: "River Valley Supplies", group: "Tier 3" },
  ]

  return allCustomers.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )
}

export function SelectsShowcase() {
  // SearchableSelect states
  const [productValue, setProductValue] = React.useState<string | undefined>("prod-003")
  const [categoryValue, setCategoryValue] = React.useState<string | undefined>(undefined)
  const [customerValue, setCustomerValue] = React.useState<string | undefined>(undefined)

  // MultiSelect states
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>(["prod-001", "prod-005"])
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

  // AsyncSelect state
  const [asyncValue, setAsyncValue] = React.useState<string | undefined>(undefined)

  // ClassicSelect states
  const [statusValue, setStatusValue] = React.useState<string | undefined>("status-active")
  const [warehouseValue, setWarehouseValue] = React.useState<string | undefined>(undefined)

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-700 dark:text-navy-200">
          Selects Module
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Replaces Select2 Bootstrap Theme CSS — SearchableSelect, MultiSelect, AsyncSelect, and ClassicSelect components with Deep Navy Blue theme
        </p>
      </div>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== SEARCHABLE SELECT SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5" />
            SearchableSelect
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">Select2 single select</code> — Search/filter with grouped options, clear button, custom icons, and disabled options
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Grouped options with icons */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Grouped Options with Custom Icons
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Products grouped by category (Motors, Pumps, Bearings, Controllers, Sensors). Each option has a custom icon. 
              &quot;Conveyor Belt CB-1500&quot; is disabled (out of stock). Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">grouped=true</code>.
            </p>
            <div className="max-w-sm">
              <SearchableSelect
                options={productOptions}
                value={productValue}
                onChange={setProductValue}
                placeholder="Select a product"
                searchPlaceholder="Search products..."
                emptyMessage="No product found."
                grouped={true}
                clearable={true}
              />
              {productValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected Product: {productOptions.find((o) => o.value === productValue)?.label}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Category grouped select */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Category Selection (Grouped)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Product categories grouped by department (Power Systems, Mechanical, Automation, Logistics, Compliance, Maintenance).
            </p>
            <div className="max-w-sm">
              <SearchableSelect
                options={categoryOptions}
                value={categoryValue}
                onChange={setCategoryValue}
                placeholder="Select a category"
                searchPlaceholder="Search categories..."
                emptyMessage="No category found."
                grouped={true}
                clearable={true}
              />
              {categoryValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected Category: {categoryOptions.find((o) => o.value === categoryValue)?.label}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Size variants */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Size Variants
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Three sizes matching original Select2 Bootstrap sizes: sm (30px), default (36px), lg (44px).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Small</p>
                <SearchableSelect
                  options={customerOptions}
                  value={undefined}
                  onChange={() => {}}
                  placeholder="Small select"
                  size="sm"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Default</p>
                <SearchableSelect
                  options={customerOptions}
                  value={customerValue}
                  onChange={setCustomerValue}
                  placeholder="Default select"
                  size="default"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Large</p>
                <SearchableSelect
                  options={customerOptions}
                  value={undefined}
                  onChange={() => {}}
                  placeholder="Large select"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== MULTI SELECT SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <ListFilter className="h-5 w-5" />
            MultiSelect
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">Select2 multi-select</code> — Multiple selection with badge/chip display, tag removal, search, and grouped options
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Product multi-select with tag removal */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Product Selection with Tag Removal
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Select multiple products. Each selected item shows as a Navy Blue badge with X button for individual removal. 
              Click the badge X or use the clear-all button. Grouped by category.
            </p>
            <div className="max-w-md">
              <MultiSelect
                options={multiSelectProducts}
                value={selectedProducts}
                onChange={setSelectedProducts}
                placeholder="Select products..."
                searchPlaceholder="Search products..."
                emptyMessage="No product found."
                clearable={true}
              />
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedProducts.map((val) => {
                    const opt = multiSelectProducts.find((o) => o.value === val)
                    return (
                      <Badge
                        key={val}
                        variant="secondary"
                        className="bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200 text-xs"
                      >
                        {opt?.label}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Category multi-select with maxCount */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Category Selection with Max Count Display
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Uses <code className="bg-navy-50 dark:bg-navy-900 px-1 rounded text-xs">maxCount=2</code> — only shows 2 badges, remaining selections appear as &quot;+N&quot; counter.
              Useful when many items are selected and space is limited.
            </p>
            <div className="max-w-md">
              <MultiSelect
                options={multiSelectCategories}
                value={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Select categories..."
                searchPlaceholder="Search categories..."
                emptyMessage="No category found."
                maxCount={2}
                clearable={true}
              />
              {selectedCategories.length > 0 && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  {selectedCategories.length} categor{selectedCategories.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Size variants */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Size Variants
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Small</p>
                <MultiSelect
                  options={multiSelectCategories}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Small multi"
                  size="sm"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Default</p>
                <MultiSelect
                  options={multiSelectCategories}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Default multi"
                  size="default"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Large</p>
                <MultiSelect
                  options={multiSelectCategories}
                  value={[]}
                  onChange={() => {}}
                  placeholder="Large multi"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== ASYNC SELECT SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            AsyncSelect
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">Select2 AJAX/remote data</code> — Async option loading with debounced search, loading spinner, and error handling
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Async customer search */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Customer Search (Simulated API)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Type at least 1 character to trigger a search. Results load with an 800ms simulated API delay. 
              Loading spinner shows during fetch. Results are grouped by customer tier.
            </p>
            <div className="max-w-sm">
              <AsyncSelect
                loadOptions={simulateAsyncSearch}
                value={asyncValue}
                onChange={setAsyncValue}
                defaultOptions={[
                  { value: "cust-001", label: "Acme Manufacturing Co.", group: "Tier 1" },
                  { value: "cust-002", label: "Global Industries Ltd.", group: "Tier 1" },
                  { value: "cust-003", label: "TechPrime Solutions", group: "Tier 2" },
                ]}
                placeholder="Search customers..."
                searchPlaceholder="Type to search customers..."
                loadingMessage="Searching customers..."
                emptyMessage="No customer found."
                debounceMs={300}
                minChars={1}
                clearable={true}
              />
              {asyncValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected Customer: {asyncValue}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* API configuration info */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Async Configuration Options
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              The AsyncSelect supports configurable debounce delay, minimum characters to trigger search, default options, and custom loading/empty messages.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-navy-200 dark:border-navy-700 p-3 text-center">
                <p className="text-lg font-bold text-navy-600 dark:text-navy-300">300ms</p>
                <p className="text-xs text-muted-foreground">Debounce Delay</p>
              </div>
              <div className="rounded-lg border border-navy-200 dark:border-navy-700 p-3 text-center">
                <p className="text-lg font-bold text-navy-600 dark:text-navy-300">1</p>
                <p className="text-xs text-muted-foreground">Min Characters</p>
              </div>
              <div className="rounded-lg border border-navy-200 dark:border-navy-700 p-3 text-center">
                <p className="text-lg font-bold text-navy-600 dark:text-navy-300">3</p>
                <p className="text-xs text-muted-foreground">Default Options</p>
              </div>
              <div className="rounded-lg border border-navy-200 dark:border-navy-700 p-3 text-center">
                <p className="text-lg font-bold text-navy-600 dark:text-navy-300">800ms</p>
                <p className="text-xs text-muted-foreground">API Latency</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== CLASSIC SELECT SECTION ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="flex items-center gap-2 text-white">
            <CheckCircle2 className="h-5 w-5" />
            ClassicSelect
          </CardTitle>
          <CardDescription className="text-navy-100">
            Replaces <code className="bg-navy-800/50 px-1 rounded text-xs">Select2 classic theme</code> — Gradient arrow, classic Select2 styling, and search capability
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Status select with gradient arrow */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Product Status (Gradient Arrow Theme)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Classic Select2 gradient arrow on the right side. Background gradient from white to navy-50. 
              Arrow has gradient background and rotates on open. &quot;Discontinued&quot; is a disabled option.
            </p>
            <div className="max-w-sm">
              <ClassicSelect
                options={classicSelectOptions}
                value={statusValue}
                onChange={setStatusValue}
                placeholder="Select status"
                searchPlaceholder="Search statuses..."
                emptyMessage="No status found."
                clearable={true}
              />
              {statusValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Current Status: {classicSelectOptions.find((o) => o.value === statusValue)?.label}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Warehouse select */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Warehouse Selection
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Classic theme with gradient background. Search within dropdown to filter warehouse zones.
            </p>
            <div className="max-w-sm">
              <ClassicSelect
                options={warehouseOptions}
                value={warehouseValue}
                onChange={setWarehouseValue}
                placeholder="Select warehouse zone"
                searchPlaceholder="Search zones..."
                emptyMessage="No warehouse found."
                clearable={true}
              />
              {warehouseValue && (
                <p className="text-xs text-navy-600 dark:text-navy-400 mt-1.5">
                  Selected Zone: {warehouseOptions.find((o) => o.value === warehouseValue)?.label}
                </p>
              )}
            </div>
          </div>

          <Separator className="bg-navy-100 dark:bg-navy-800" />

          {/* Size variants */}
          <div>
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-1">
              Size Variants (Classic Theme)
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Classic sizes match Select2 Bootstrap heights: sm (30px), default (28px — Select2 classic), lg (46px).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Small</p>
                <ClassicSelect
                  options={classicSelectOptions}
                  value={undefined}
                  onChange={() => {}}
                  placeholder="Small classic"
                  size="sm"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Default</p>
                <ClassicSelect
                  options={classicSelectOptions}
                  value={undefined}
                  onChange={() => {}}
                  placeholder="Default classic"
                  size="default"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-navy-600 dark:text-navy-400 mb-1.5">Large</p>
                <ClassicSelect
                  options={classicSelectOptions}
                  value={undefined}
                  onChange={() => {}}
                  placeholder="Large classic"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* ===== COMPARISON TABLE ===== */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader className="bg-gradient-to-r from-navy-600 to-navy-700 text-white rounded-t-lg -m-6 mb-0 p-6">
          <CardTitle className="text-white">Select Component Comparison</CardTitle>
          <CardDescription className="text-navy-100">
            Quick reference for choosing the right select component for each ERP use case
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-navy-200 dark:border-navy-700">
                  <th className="text-left py-2 px-3 text-navy-700 dark:text-navy-300 font-semibold">Component</th>
                  <th className="text-left py-2 px-3 text-navy-700 dark:text-navy-300 font-semibold">Best For</th>
                  <th className="text-left py-2 px-3 text-navy-700 dark:text-navy-300 font-semibold">Key Features</th>
                  <th className="text-left py-2 px-3 text-navy-700 dark:text-navy-300 font-semibold">ERP Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-navy-100 dark:border-navy-800">
                  <td className="py-2 px-3 font-medium text-navy-600 dark:text-navy-400">SearchableSelect</td>
                  <td className="py-2 px-3 text-muted-foreground">Single selection with search</td>
                  <td className="py-2 px-3 text-muted-foreground">Groups, icons, disabled, clearable</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-xs border-navy-300 text-navy-600">Product Picker</Badge>
                  </td>
                </tr>
                <tr className="border-b border-navy-100 dark:border-navy-800">
                  <td className="py-2 px-3 font-medium text-navy-600 dark:text-navy-400">MultiSelect</td>
                  <td className="py-2 px-3 text-muted-foreground">Multiple selections</td>
                  <td className="py-2 px-3 text-muted-foreground">Tags, maxCount, search, groups</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-xs border-navy-300 text-navy-600">Order Items</Badge>
                  </td>
                </tr>
                <tr className="border-b border-navy-100 dark:border-navy-800">
                  <td className="py-2 px-3 font-medium text-navy-600 dark:text-navy-400">AsyncSelect</td>
                  <td className="py-2 px-3 text-muted-foreground">Remote/API data</td>
                  <td className="py-2 px-3 text-muted-foreground">Debounce, loading, minChars</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-xs border-navy-300 text-navy-600">Customer Search</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium text-navy-600 dark:text-navy-400">ClassicSelect</td>
                  <td className="py-2 px-3 text-muted-foreground">Classic UI style</td>
                  <td className="py-2 px-3 text-muted-foreground">Gradient arrow, classic theme</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline" className="text-xs border-navy-300 text-navy-600">Status Dropdown</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
