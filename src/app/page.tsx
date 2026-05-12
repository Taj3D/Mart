'use client'

import * as React from 'react'
import {
  GripVertical,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Users,
  BarChart3,
  Move,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SortableList,
  SortableItem,
  SelectableList,
  DraggablePanel,
  type SortableItemData,
} from '@/components/ui/sortable-list'

/* ================================================================
   DEMO DATA
   ================================================================ */

interface TaskItem extends SortableItemData {
  title: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'active' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

const initialTasks: TaskItem[] = [
  { id: 'task-1', title: 'Review Purchase Orders', description: 'Check and approve pending POs', icon: ShoppingCart, status: 'active', priority: 'high' },
  { id: 'task-2', title: 'Inventory Audit', description: 'Quarterly inventory count', icon: Package, status: 'pending', priority: 'medium' },
  { id: 'task-3', title: 'Generate Reports', description: 'Monthly sales report', icon: FileText, status: 'completed', priority: 'low' },
  { id: 'task-4', title: 'System Configuration', description: 'Update ERP settings', icon: Settings, status: 'pending', priority: 'high' },
  { id: 'task-5', title: 'User Management', description: 'Add new team members', icon: Users, status: 'active', priority: 'medium' },
  { id: 'task-6', title: 'Analytics Dashboard', description: 'Review performance metrics', icon: BarChart3, status: 'pending', priority: 'low' },
]

interface EmployeeItem extends SortableItemData {
  name: string
  role: string
  department: string
}

const employees: EmployeeItem[] = [
  { id: 'emp-1', name: 'Alice Chen', role: 'Warehouse Manager', department: 'Operations' },
  { id: 'emp-2', name: 'Bob Martinez', role: 'Sales Lead', department: 'Sales' },
  { id: 'emp-3', name: 'Carol White', role: 'Procurement Specialist', department: 'Purchasing' },
  { id: 'emp-4', name: 'David Kim', role: 'IT Administrator', department: 'IT' },
  { id: 'emp-5', name: 'Eva Johnson', role: 'Finance Analyst', department: 'Finance' },
  { id: 'emp-6', name: 'Frank Liu', role: 'Quality Inspector', department: 'QA' },
  { id: 'emp-7', name: 'Grace Patel', role: 'HR Coordinator', department: 'HR' },
]

/* ================================================================
   HELPERS
   ================================================================ */

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'high':
      return <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0 text-[10px] px-1.5 py-0">{priority}</Badge>
    case 'medium':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 text-[10px] px-1.5 py-0">{priority}</Badge>
    case 'low':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px] px-1.5 py-0">{priority}</Badge>
    default:
      return <Badge variant="outline" className="text-[10px]">{priority}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300 border-0 text-[10px] px-1.5 py-0">{status}</Badge>
    case 'completed':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 text-[10px] px-1.5 py-0">{status}</Badge>
    case 'pending':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 text-[10px] px-1.5 py-0">{status}</Badge>
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>
  }
}

/* ================================================================
   DEMO SECTIONS
   ================================================================ */

function SortableListDemo() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GripVertical className="h-5 w-5 text-navy-500" />
          <CardTitle className="text-lg">Sortable List</CardTitle>
        </div>
        <CardDescription>
          Drag items to reorder. Replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.sortable()</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableList
          items={tasks}
          onReorder={setTasks}
          dragHandle
          renderItem={(task, index) => (
            <div className="flex items-center gap-3 w-full py-2.5 px-3 rounded-lg border border-border/60 hover:border-navy-200 dark:hover:border-navy-700 bg-card transition-colors">
              <GripVertical className="h-4 w-4 text-navy-400 dark:text-navy-500 shrink-0" />
              <div className={`p-1.5 rounded-md ${task.status === 'active' ? 'bg-navy-100 dark:bg-navy-900/30' : task.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <task.icon className={`h-4 w-4 ${task.status === 'active' ? 'text-navy-600 dark:text-navy-300' : task.status === 'completed' ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{task.title}</span>
                  {getPriorityBadge(task.priority)}
                </div>
                <p className="text-xs text-muted-foreground truncate">{task.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getStatusBadge(task.status)}
                <span className="text-xs text-muted-foreground tabular-nums w-4 text-right">#{index + 1}</span>
              </div>
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}

function SelectableListDemo() {
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-navy-500" />
          <CardTitle className="text-lg">Selectable List</CardTitle>
        </div>
        <CardDescription>
          Click to select, Ctrl+click for multi, Shift+click for range. Replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.selectable()</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">
            {selectedIds.length} of {employees.length} selected
          </span>
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-navy-600 dark:text-navy-300"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
          )}
        </div>
        <SelectableList
          items={employees}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          multiple
          lasso
          className="space-y-1"
          renderItem={(employee, _index, isSelected) => (
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all duration-150">
              <div className="shrink-0">
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-navy-500 dark:text-navy-400" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{employee.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300">
                    {employee.department}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{employee.role}</p>
              </div>
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}

function DraggablePanelDemo() {
  const [panelPosition, setPanelPosition] = React.useState({ x: 20, y: 20 })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Move className="h-5 w-5 text-navy-500" />
          <CardTitle className="text-lg">Draggable Panel</CardTitle>
        </div>
        <CardDescription>
          Drag the panel by its header. Replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.draggable()</code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[300px] border border-dashed border-navy-200 dark:border-navy-700 rounded-xl bg-navy-50/30 dark:bg-navy-900/10 overflow-hidden">
          <DraggablePanel
            title="Quick Info"
            defaultPosition={panelPosition}
            onPositionChange={setPanelPosition}
            bounds="parent"
            width={260}
            className="rounded-xl"
          >
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-navy-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground text-xs">
                  Drag this panel by its Navy Blue header to move it around the dashed area.
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Position</span>
                  <p className="font-mono font-medium">
                    {Math.round(panelPosition.x)}, {Math.round(panelPosition.y)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bounds</span>
                  <p className="font-medium">Parent</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">System Online</span>
              </div>
            </div>
          </DraggablePanel>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableWithoutHandleDemo() {
  const [items, setItems] = React.useState([
    { id: 'step-1', label: 'Step 1: Data Import', desc: 'Upload CSV files' },
    { id: 'step-2', label: 'Step 2: Validation', desc: 'Check data integrity' },
    { id: 'step-3', label: 'Step 3: Processing', desc: 'Run transformations' },
    { id: 'step-4', label: 'Step 4: Export', desc: 'Generate output files' },
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sortable (No Handle)</CardTitle>
        <CardDescription>
          Drag anywhere on the item to reorder. Workflow pipeline example.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SortableList
          items={items}
          onReorder={setItems}
          strategy="vertical"
          renderItem={(item, index) => (
            <div className="flex items-center gap-3 w-full py-3 px-4 rounded-lg border border-border/60 hover:border-navy-200 dark:hover:border-navy-700 bg-card cursor-grab active:cursor-grabbing transition-colors">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 text-white font-bold text-xs shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm">{item.label}</span>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {index < items.length - 1 && (
                <span className="text-navy-300 dark:text-navy-600 text-lg">→</span>
              )}
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}

/* ================================================================
   MAIN PAGE
   ================================================================ */

export default function SortableListDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-navy-700 to-navy-600 dark:from-navy-800 dark:to-navy-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <GripVertical className="h-7 w-7 text-navy-200" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              SortableList Components
            </h1>
          </div>
          <p className="text-navy-100 text-sm sm:text-base max-w-2xl">
            Comprehensive drag-and-drop components replacing jQuery UI&apos;s sortable, draggable, and selectable.
            Built with <span className="font-semibold">@dnd-kit</span> and styled with the Deep Navy Blue ERP theme.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">SortableList</Badge>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">SortableItem</Badge>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">DragOverlay</Badge>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">SelectableList</Badge>
            <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">DraggablePanel</Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Row 1: Sortable Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SortableListDemo />
          <SortableWithoutHandleDemo />
        </div>

        {/* Row 2: Selectable + Draggable */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectableListDemo />
          <DraggablePanelDemo />
        </div>

        {/* CSS Classes Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CSS Classes Reference</CardTitle>
            <CardDescription>
              ims-* prefixed classes matching jQuery UI&apos;s class system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { cls: '.ims-sortable-handle', desc: 'Touch-action: none, cursor: grab', replaces: '.ui-sortable-handle' },
                { cls: '.ims-sortable-ghost', desc: 'Opacity 0.4 during drag', replaces: '.ui-sortable-placeholder' },
                { cls: '.ims-sortable-chosen', desc: 'Navy Blue highlight on chosen item', replaces: '.ui-sortable-helper' },
                { cls: '.ims-draggable', desc: 'Position relative, cursor: move', replaces: '.ui-draggable' },
                { cls: '.ims-selectable', desc: 'Touch-action: none, user-select: none', replaces: '.ui-selectable' },
                { cls: '.ims-selecting', desc: 'Navy Blue highlight while selecting', replaces: '.ui-selecting' },
                { cls: '.ims-selected', desc: 'Navy Blue highlight for selected', replaces: '.ui-selected' },
                { cls: '.ims-sortable', desc: 'Container for sortable items', replaces: '.ui-sortable' },
                { cls: '.ims-sortable-disabled', desc: 'Disabled item state', replaces: '.ui-state-disabled' },
              ].map((item) => (
                <div
                  key={item.cls}
                  className="p-3 rounded-lg border border-border/60 bg-navy-50/30 dark:bg-navy-900/10 space-y-1"
                >
                  <code className="text-xs font-mono text-navy-600 dark:text-navy-300 font-semibold">{item.cls}</code>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-[10px] text-navy-400 dark:text-navy-500">
                    Replaces: <code>{item.replaces}</code>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
