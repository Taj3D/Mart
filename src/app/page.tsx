'use client'

import * as React from 'react'
import {
  Shield,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  BarChart3,
  Users,
  FileText,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  GripVertical,
  CheckSquare,
  Square,
  Move,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Printer,
  Filter,
  RefreshCw,
  Lock,
  Eye,
  Mail,
  Calendar,
  Database,
  Server,
  Folder,
  File,
  Star,
  Heart,
  Bookmark,
  Flag,
  Globe,
  MapPin,
  Wifi,
  Zap,
  Cloud,
  Save,
  Send,
  Share2,
  Link,
  Image,
  Camera,
  Music,
  Phone,
  Home,
  Cog,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { IMSBreadcrumb } from '@/components/layout/ims-breadcrumb'
import { Footer } from '@/components/footer'
import { Icon, IconStack, IconList, IconListItem } from '@/components/ui/icon'
import {
  SortableList,
  SelectableList,
  DraggablePanel,
  type SortableItemData,
} from '@/components/ui/sortable-list'
import { InlineHeader } from '@/components/ui/inline-header'
import { ShutterButton } from '@/components/ui/shutter-button'
import { RoundButton } from '@/components/ui/round-button'
import { ImsTag } from '@/components/ui/ims-tag'
import { FileUploadButton } from '@/components/ui/file-upload-button'
import { QuickLinkCard } from '@/components/ui/quick-link-card'
import { DividerVertical } from '@/components/ui/divider-vertical'

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
   DASHBOARD SECTIONS
   ================================================================ */

function StatsCards() {
  const stats = [
    { title: 'Total Products', value: '2,847', change: '+12.5%', trend: 'up', icon: Package, color: 'navy' },
    { title: 'Sales Today', value: '$14,392', change: '+8.2%', trend: 'up', icon: DollarSign, color: 'emerald' },
    { title: 'Low Stock Items', value: '23', change: '+3', trend: 'down', icon: AlertTriangle, color: 'amber' },
    { title: 'Pending Orders', value: '18', change: '-5.1%', trend: 'up', icon: Clock, color: 'rose' },
  ]

  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    navy: { bg: 'from-navy-600 to-navy-700 dark:from-navy-700 dark:to-navy-800', iconBg: 'bg-white/20', iconText: 'text-white' },
    emerald: { bg: 'from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800', iconBg: 'bg-white/20', iconText: 'text-white' },
    amber: { bg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700', iconBg: 'bg-white/20', iconText: 'text-white' },
    rose: { bg: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700', iconBg: 'bg-white/20', iconText: 'text-white' },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = colorMap[stat.color]
        return (
          <Card key={stat.title} className="overflow-hidden border-0 shadow-md">
            <div className={`bg-gradient-to-br ${colors.bg} p-4 sm:p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-300" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-white/60">vs last month</span>
                  </div>
                </div>
                <div className={`${colors.iconBg} p-3 rounded-xl`}>
                  <stat.icon className={`h-6 w-6 ${colors.iconText}`} />
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

function RecentOrdersTable() {
  const orders = [
    { id: 'ORD-001', customer: 'Acme Corp', product: 'Widget Pro', amount: '$1,250.00', status: 'Completed', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Globex Inc', product: 'Gizmo Plus', amount: '$890.50', status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Wayne Ent.', product: 'Sensor X1', amount: '$2,100.00', status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Stark Ind.', product: 'Arc Reactor', amount: '$5,000.00', status: 'Completed', date: '2024-01-13' },
    { id: 'ORD-005', customer: 'Umbrella Co', product: 'MedKit V2', amount: '$475.00', status: 'Shipped', date: '2024-01-12' },
  ]

  const statusColors: Record<string, string> = {
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Processing: 'bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    Shipped: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest 5 orders from the system</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-navy-600 dark:text-navy-300">
            <Eye className="h-4 w-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="ims-table w-full text-sm">
            <thead>
              <tr className="ims-table-header">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Customer</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-white/90 uppercase tracking-wider hidden sm:table-cell">Product</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Amount</th>
                <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/90 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-navy-700 dark:text-navy-300">{order.id}</td>
                  <td className="px-3 py-2.5">{order.customer}</td>
                  <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{order.product}</td>
                  <td className="px-3 py-2.5 text-right font-medium">{order.amount}</td>
                  <td className="px-3 py-2.5 text-center">
                    <Badge className={`${statusColors[order.status] || ''} border-0 text-[10px] px-2 py-0.5`}>
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PerformancePanel() {
  const metrics = [
    { label: 'Sales Target', value: 78, color: 'bg-navy-600 dark:bg-navy-500' },
    { label: 'Inventory Accuracy', value: 94, color: 'bg-emerald-600 dark:bg-emerald-500' },
    { label: 'Order Fulfillment', value: 65, color: 'bg-amber-500 dark:bg-amber-400' },
    { label: 'Customer Satisfaction', value: 89, color: 'bg-rose-500 dark:bg-rose-400' },
  ]

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
        <CardDescription>Current quarter KPIs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{metric.label}</span>
              <span className="text-sm font-bold text-navy-700 dark:text-navy-300">{metric.value}%</span>
            </div>
            <div className="h-2.5 bg-navy-100 dark:bg-navy-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color} rounded-full transition-all duration-700`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function NotificationsPanel() {
  const alerts = [
    { type: 'success', icon: CheckCircle, title: 'Order Completed', desc: 'Order #ORD-001 has been delivered successfully', time: '2 min ago' },
    { type: 'warning', icon: AlertTriangle, title: 'Low Stock Alert', desc: 'Widget Pro inventory below threshold (5 units)', time: '15 min ago' },
    { type: 'info', icon: Info, title: 'System Update', desc: 'ERP system maintenance scheduled for tonight', time: '1 hr ago' },
    { type: 'error', icon: XCircle, title: 'Payment Failed', desc: 'Invoice #INV-4521 payment processing failed', time: '3 hrs ago' },
  ]

  const alertStyles: Record<string, { bg: string; border: string; icon: string }> = {
    success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-l-emerald-500', icon: 'text-emerald-600 dark:text-emerald-400' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-l-amber-500', icon: 'text-amber-600 dark:text-amber-400' },
    info: { bg: 'bg-navy-50 dark:bg-navy-900/20', border: 'border-l-navy-500', icon: 'text-navy-600 dark:text-navy-400' },
    error: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-l-rose-500', icon: 'text-rose-600 dark:text-rose-400' },
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Recent system alerts</CardDescription>
          </div>
          <Badge className="bg-rose-500 text-white border-0 text-[10px]">4 new</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-72 overflow-y-auto">
        {alerts.map((alert, idx) => {
          const styles = alertStyles[alert.type]
          return (
            <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${styles.border} ${styles.bg}`}>
              <alert.icon className={`h-5 w-5 mt-0.5 shrink-0 ${styles.icon}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{alert.time}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function QuickActionsPanel() {
  const actions = [
    { icon: Plus, label: 'New Order', variant: 'default' as const },
    { icon: Package, label: 'Add Product', variant: 'default' as const },
    { icon: FileText, label: 'Create Invoice', variant: 'outline' as const },
    { icon: Users, label: 'Add Customer', variant: 'outline' as const },
    { icon: Download, label: 'Export Data', variant: 'outline' as const },
    { icon: Printer, label: 'Print Report', variant: 'outline' as const },
  ]

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common ERP operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              className={`h-auto py-3 flex flex-col items-center gap-1.5 ${
                action.variant === 'default'
                  ? 'bg-navy-600 hover:bg-navy-700 dark:bg-navy-700 dark:hover:bg-navy-600'
                  : 'border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-900/30'
              }`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function IconSystemShowcase() {
  const iconMappingExamples = [
    { fa: 'fa-search', lucide: 'Search', icon: Search },
    { fa: 'fa-plus', lucide: 'Plus', icon: Plus },
    { fa: 'fa-edit', lucide: 'Edit2', icon: Edit2 },
    { fa: 'fa-trash', lucide: 'Trash2', icon: Trash2 },
    { fa: 'fa-download', lucide: 'Download', icon: Download },
    { fa: 'fa-upload', lucide: 'Upload', icon: Upload },
    { fa: 'fa-print', lucide: 'Printer', icon: Printer },
    { fa: 'fa-filter', lucide: 'Filter', icon: Filter },
    { fa: 'fa-refresh', lucide: 'RefreshCw', icon: RefreshCw },
    { fa: 'fa-cog', lucide: 'Settings', icon: Cog },
    { fa: 'fa-user', lucide: 'User', icon: Users },
    { fa: 'fa-lock', lucide: 'Lock', icon: Lock },
    { fa: 'fa-eye', lucide: 'Eye', icon: Eye },
    { fa: 'fa-envelope', lucide: 'Mail', icon: Mail },
    { fa: 'fa-calendar', lucide: 'Calendar', icon: Calendar },
    { fa: 'fa-database', lucide: 'Database', icon: Database },
  ]

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-navy-500" />
          <CardTitle className="text-lg">Icon System (FA → Lucide)</CardTitle>
        </div>
        <CardDescription>
          Font Awesome 4.7.0 icons converted to Lucide React — 500+ mappings available
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {iconMappingExamples.map((item) => (
            <div
              key={item.fa}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border/60 hover:border-navy-300 dark:hover:border-navy-600 hover:bg-navy-50 dark:hover:bg-navy-900/20 transition-colors cursor-default"
              title={`${item.fa} → ${item.lucide}`}
            >
              <item.icon className="h-5 w-5 text-navy-600 dark:text-navy-400" />
              <span className="text-[9px] text-muted-foreground font-mono truncate w-full text-center">{item.lucide}</span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Icon sizes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">FA Size Modifiers</p>
          <div className="flex items-end gap-4 flex-wrap">
            {[
              { label: 'xs', size: 12 },
              { label: 'sm', size: 14 },
              { label: 'default', size: 14 },
              { label: 'lg', size: 18 },
              { label: '2x', size: 28 },
              { label: '3x', size: 42 },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <Icon icon="star" faSize={s.label as 'xs' | 'sm' | 'lg' | '2x' | '3x'} className="text-navy-600 dark:text-navy-400" />
                <span className="text-[10px] text-muted-foreground font-mono">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Icon animations & transforms */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Animations & Transforms</p>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <Icon icon="cog" spin className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">spin</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon icon="spinner" pulse className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">pulse</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon icon="share" rotate="90" className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">rotate-90</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon icon="share" rotate="180" className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">rotate-180</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon icon="share" flipH className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">flip-h</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Icon icon="share" flipV className="text-navy-600 dark:text-navy-400" size={24} />
              <span className="text-[10px] text-muted-foreground">flip-v</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Icon List */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Icon List (FA ul/li replacement)</p>
          <IconList>
            <IconListItem icon="check-circle">Inventory module is active</IconListItem>
            <IconListItem icon="check-circle">Sales module is active</IconListItem>
            <IconListItem icon="exclamation-triangle">Low stock alerts enabled</IconListItem>
            <IconListItem icon="info-circle">System update available</IconListItem>
          </IconList>
        </div>
      </CardContent>
    </Card>
  )
}

function SortableListSection() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks)
  const [selectedIds, setSelectedIds] = React.useState<(string | number)[]>([])
  const [panelPosition, setPanelPosition] = React.useState({ x: 20, y: 20 })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sortable List */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-navy-500" />
            <CardTitle className="text-lg">Sortable List</CardTitle>
          </div>
          <CardDescription>
            Drag items to reorder — replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.sortable()</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SortableList
            items={tasks}
            onReorder={setTasks}
            dragHandle
            renderItem={(task, index) => (
              <div className="flex items-center gap-3 w-full py-2 px-3 rounded-lg border border-border/60 hover:border-navy-200 dark:hover:border-navy-700 bg-card transition-colors">
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

      {/* Selectable + Draggable */}
      <div className="space-y-6">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-navy-500" />
              <CardTitle className="text-lg">Selectable List</CardTitle>
            </div>
            <CardDescription>
              Click / Ctrl+click / Shift+click — replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.selectable()</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {selectedIds.length} of {employees.length} selected
              </span>
              {selectedIds.length > 0 && (
                <Button variant="ghost" size="sm" className="h-5 text-xs text-navy-600 dark:text-navy-300" onClick={() => setSelectedIds([])}>
                  Clear
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
                <div className="flex items-center gap-3 py-2 px-3 rounded-lg border transition-all duration-150">
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

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Move className="h-5 w-5 text-navy-500" />
              <CardTitle className="text-lg">Draggable Panel</CardTitle>
            </div>
            <CardDescription>
              Drag by header — replaces jQuery UI <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.draggable()</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[200px] border border-dashed border-navy-200 dark:border-navy-700 rounded-xl bg-navy-50/30 dark:bg-navy-900/10 overflow-hidden">
              <DraggablePanel
                title="Quick Info"
                defaultPosition={panelPosition}
                onPositionChange={setPanelPosition}
                bounds="parent"
                width={220}
                className="rounded-xl"
              >
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-navy-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground text-xs">
                      Drag this panel by its Navy Blue header.
                    </p>
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
      </div>
    </div>
  )
}

function DesignSystemShowcase() {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Design System — Button & Badge Variants</CardTitle>
        <CardDescription>Deep Navy Blue ERP theme with Bootswatch-inspired variants</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Badge variants */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Badge Variants</p>
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>
        <Separator />
        {/* Button variants */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Button Variants</p>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="info">Info</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
        <Separator />
        {/* Button sizes */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Button Sizes</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================================================================
   FILE 10 SHOWCASE - Custom ERP Components
   ================================================================ */

function File10Showcase() {
  const [tags, setTags] = React.useState(['Inventory', 'Sales', 'Procurement', 'HR'])

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-navy-500" />
            <CardTitle className="text-lg">Custom ERP Components</CardTitle>
          </div>
          <CardDescription>
            File 10 — Converted from custom site CSS with Deep Navy Blue theme
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Links + Inline Headers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Link Cards */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Link Cards</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.quick-link-height</code> — min-height 115px colored cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickLinkCard title="Inventory" icon={Package} color="navy" description="Manage stock" />
              <QuickLinkCard title="Sales" icon={ShoppingCart} color="emerald" description="Track orders" />
              <QuickLinkCard title="Reports" icon={BarChart3} color="amber" description="View analytics" />
              <QuickLinkCard title="Alerts" icon={AlertTriangle} color="rose" description="View warnings" />
            </div>
          </CardContent>
        </Card>

        {/* Inline Headers + Section Headings */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Inline Headers &amp; Section Headings</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.inline-header</code> and <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.container h4</code></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Inline Header Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <InlineHeader color="navy">Navy Blue</InlineHeader>
                <InlineHeader color="emerald">Emerald</InlineHeader>
                <InlineHeader color="amber">Amber</InlineHeader>
                <InlineHeader color="rose">Rose</InlineHeader>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Section Heading (ims-section-heading)</p>
              <h4 className="ims-section-heading text-navy-700 dark:text-navy-300 font-semibold">Product Inventory Report</h4>
              <h4 className="ims-section-heading text-navy-700 dark:text-navy-300 font-semibold mt-2">Monthly Sales Summary</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shutter Buttons + Round Buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shutter Buttons */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Shutter Buttons</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.shutter-out</code> — horizontal wipe animation on hover</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <ShutterButton>Default Navy</ShutterButton>
              <ShutterButton shutterColor="#059669">Emerald</ShutterButton>
              <ShutterButton shutterColor="#d97706">Amber</ShutterButton>
              <ShutterButton shutterColor="#e11d48">Rose</ShutterButton>
              <ShutterButton disabled>Disabled</ShutterButton>
            </div>
          </CardContent>
        </Card>

        {/* Round Buttons */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Round Buttons</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.round</code> and <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.round.hollow</code> — circular icon buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Solid Variant</p>
              <div className="flex flex-wrap items-center gap-3">
                <RoundButton variant="solid" color="default">A</RoundButton>
                <RoundButton variant="solid" color="navy">B</RoundButton>
                <RoundButton variant="solid" color="orange">C</RoundButton>
                <RoundButton variant="solid" color="green">D</RoundButton>
                <DividerVertical height={30} />
                <RoundButton variant="solid" color="default" size="lg">1</RoundButton>
                <RoundButton variant="solid" color="navy" size="lg">2</RoundButton>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hollow Variant</p>
              <div className="flex flex-wrap items-center gap-3">
                <RoundButton variant="hollow" color="default">A</RoundButton>
                <RoundButton variant="hollow" color="navy">B</RoundButton>
                <RoundButton variant="hollow" color="orange">C</RoundButton>
                <RoundButton variant="hollow" color="green">D</RoundButton>
                <DividerVertical height={30} />
                <RoundButton variant="hollow" color="default" size="lg">1</RoundButton>
                <RoundButton variant="hollow" color="navy" size="lg">2</RoundButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IMS Tags + File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IMS Tags */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">IMS Tags</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.tag</code> — arrow-shaped tag with dot indicator and hover color change</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags with Remove (click X to remove)</p>
              <div className="flex flex-wrap gap-4">
                {tags.map((tag) => (
                  <ImsTag
                    key={tag}
                    onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    dotColor={tag === 'Inventory' ? 'red' : tag === 'Sales' ? 'navy' : tag === 'Procurement' ? 'amber' : 'emerald'}
                  >
                    {tag}
                  </ImsTag>
                ))}
              </div>
            </div>
            {tags.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => setTags(['Inventory', 'Sales', 'Procurement', 'HR'])}>
                Reset Tags
              </Button>
            )}
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dot Color Variants</p>
              <div className="flex flex-wrap gap-4">
                <ImsTag dotColor="red">Red Dot</ImsTag>
                <ImsTag dotColor="navy">Navy Dot</ImsTag>
                <ImsTag dotColor="amber">Amber Dot</ImsTag>
                <ImsTag dotColor="emerald">Emerald Dot</ImsTag>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload + Label Urgent */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">File Upload &amp; Urgent Label</CardTitle>
            <CardDescription>Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.btn-file</code> and <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.label-urgent</code></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">File Upload Button</p>
              <div className="flex flex-wrap gap-3">
                <FileUploadButton onFileSelect={(files) => console.log('Files:', files)} variant="default" size="sm">
                  Upload Document
                </FileUploadButton>
                <FileUploadButton onFileSelect={(files) => console.log('Files:', files)} variant="outline" size="sm" multiple>
                  Upload Multiple
                </FileUploadButton>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Urgent Label (ims-label-urgent)</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="ims-label-urgent border-0">URGENT</Badge>
                <Badge className="ims-label-urgent border-0">HIGH PRIORITY</Badge>
                <Badge variant="outline" className="border-navy-300 dark:border-navy-600 text-navy-600 dark:text-navy-300">Normal</Badge>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Blue Dragon Table Row (ims-row-blue-dragon)</p>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="ims-table-header">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/90 uppercase">ID</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/90 uppercase">Product</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-white/90 uppercase">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="ims-row-blue-dragon">
                      <td className="px-3 py-2">WH-001</td>
                      <td className="px-3 py-2">Widget Pro (Featured)</td>
                      <td className="px-3 py-2 text-right font-bold">1,250</td>
                    </tr>
                    <tr className="border-b border-border/50 hover:bg-navy-50/50 dark:hover:bg-navy-900/20">
                      <td className="px-3 py-2">WH-002</td>
                      <td className="px-3 py-2">Gizmo Plus</td>
                      <td className="px-3 py-2 text-right">890</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vertical Divider Demo + Navbar Underline Animation */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Dividers &amp; Nav Animations</CardTitle>
          <CardDescription>
            Replaces <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.divider-vertical</code> and <code className="text-xs bg-navy-50 dark:bg-navy-900/30 px-1 rounded">.navbar-nav li:after</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-muted-foreground">Toolbar item 1</span>
            <DividerVertical height={30} />
            <span className="text-sm text-muted-foreground">Toolbar item 2</span>
            <DividerVertical height={40} />
            <span className="text-sm text-muted-foreground">Toolbar item 3</span>
            <DividerVertical height={50} />
            <Button variant="outline" size="sm">Action</Button>

            <Separator orientation="vertical" className="h-8 mx-2" />

            {/* Nav underline animation demo */}
            <div className="flex items-center gap-1">
              {['Home', 'Products', 'Reports'].map((item, i) => (
                <button
                  key={item}
                  className={`ims-nav-underline px-3 py-1.5 text-sm font-medium transition-colors rounded-sm ${
                    i === 0 ? 'text-navy-600 dark:text-navy-300' : 'text-muted-foreground hover:text-navy-600 dark:hover:text-navy-300'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ================================================================
   MAIN DASHBOARD PAGE
   ================================================================ */

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Header */}
      <AppHeader />

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Left Sidebar (desktop only) */}
        <AppSidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-auto">
          {/* Breadcrumb */}
          <IMSBreadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Welcome Banner */}
            <Card className="overflow-hidden border-0 shadow-md">
              <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-navy-500 dark:from-navy-800 dark:via-navy-700 dark:to-navy-600 p-6 sm:p-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      Welcome back, Admin! 👋
                    </h1>
                    <p className="text-navy-100 text-sm sm:text-base mt-1">
                      Here&apos;s what&apos;s happening with your IMS ERP system today.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Cards */}
            <StatsCards />

            {/* Recent Orders + Performance */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <RecentOrdersTable />
              </div>
              <PerformancePanel />
            </div>

            {/* Notifications + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NotificationsPanel />
              <QuickActionsPanel />
            </div>

            {/* Icon System Showcase */}
            <IconSystemShowcase />

            {/* Sortable / Selectable / Draggable */}
            <SortableListSection />

            {/* Design System Showcase */}
            <DesignSystemShowcase />

            {/* File 10: Custom ERP Components */}
            <File10Showcase />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
