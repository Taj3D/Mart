'use client'

import * as React from 'react'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { IMSBreadcrumb } from '@/components/layout/ims-breadcrumb'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

/* ---------- Mock Data ---------- */

const statsCards = [
  {
    title: 'Total Products',
    value: '1,284',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Package,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    title: 'Sales Today',
    value: '$24,580',
    change: '+8.2%',
    trend: 'up' as const,
    icon: TrendingUp,
    color: 'text-navy-600 dark:text-navy-300',
    bg: 'bg-navy-50 dark:bg-navy-900/20',
  },
  {
    title: 'Low Stock',
    value: '23',
    change: '+3',
    trend: 'down' as const,
    icon: AlertTriangle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    title: 'Pending Orders',
    value: '47',
    change: '-5.1%',
    trend: 'down' as const,
    icon: ShoppingCart,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
]

const recentOrders = [
  { id: 'ORD-001', customer: 'Acme Corp', product: 'Widget A', qty: 150, status: 'Completed', date: '2025-01-15' },
  { id: 'ORD-002', customer: 'Globex Inc', product: 'Gadget B', qty: 75, status: 'Processing', date: '2025-01-15' },
  { id: 'ORD-003', customer: 'Initech', product: 'Component C', qty: 200, status: 'Pending', date: '2025-01-14' },
  { id: 'ORD-004', customer: 'Umbrella Co', product: 'Device D', qty: 30, status: 'Completed', date: '2025-01-14' },
  { id: 'ORD-005', customer: 'Wayne Ent.', product: 'Module E', qty: 90, status: 'Processing', date: '2025-01-13' },
]

const progressData = [
  { label: 'Sales Target', value: 78, color: 'bg-emerald-500' },
  { label: 'Inventory Fill', value: 92, color: 'bg-navy-500' },
  { label: 'Order Completion', value: 64, color: 'bg-amber-500' },
  { label: 'Return Rate', value: 15, color: 'bg-rose-500' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 hover:bg-emerald-100">{status}</Badge>
    case 'Processing':
      return <Badge className="bg-navy-100 text-navy-700 dark:bg-navy-900/30 dark:text-navy-300 border-0 hover:bg-navy-100">{status}</Badge>
    case 'Pending':
      return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 hover:bg-amber-100">{status}</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

/* ---------- Dashboard Page ---------- */

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <AppHeader />

      {/* Body: Sidebar + Main */}
      <div className="flex-1 flex">
        {/* Sidebar - desktop only */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <IMSBreadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard' },
            ]}
          />

          {/* Dashboard Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Welcome Panel */}
            <Card className="border-none bg-gradient-to-r from-navy-700 to-navy-500 dark:from-navy-800 dark:to-navy-600 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Welcome back, Admin!</h2>
                    <p className="text-navy-100 mt-1">
                      Here&apos;s what&apos;s happening with your inventory today.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white w-fit"
                  >
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statsCards.map((stat) => (
                <Card key={stat.title} className="py-4">
                  <CardContent className="px-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-xs">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 mr-1" />
                      )}
                      <span
                        className={
                          stat.trend === 'up'
                            ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                            : 'text-rose-600 dark:text-rose-400 font-medium'
                        }
                      >
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Data Table Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders from your store</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-2">
                <Table>
                  <TableHeader>
                    <TableRow className="ims-table-header">
                      <TableHead className="text-white font-semibold">Order ID</TableHead>
                      <TableHead className="text-white font-semibold">Customer</TableHead>
                      <TableHead className="text-white font-semibold hidden sm:table-cell">Product</TableHead>
                      <TableHead className="text-white font-semibold text-right">Qty</TableHead>
                      <TableHead className="text-white font-semibold hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-white font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} className="ims-table-row-hover">
                        <TableCell className="font-mono text-sm font-medium text-navy-600 dark:text-navy-300">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="hidden sm:table-cell">{order.product}</TableCell>
                        <TableCell className="text-right">{order.qty}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{order.date}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bottom Row: Progress, Alerts, Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Progress Bars */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Performance</CardTitle>
                  <CardDescription>Key metrics overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressData.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Alert Examples */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>System alerts and messages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle className="text-emerald-800 dark:text-emerald-300">Success</AlertTitle>
                    <AlertDescription className="text-emerald-700/80 dark:text-emerald-400/80">
                      Database backup completed successfully.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-300">Warning</AlertTitle>
                    <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
                      23 items are running low on stock.
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-navy-200 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-900/10">
                    <Info className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                    <AlertTitle className="text-navy-800 dark:text-navy-300">Info</AlertTitle>
                    <AlertDescription className="text-navy-700/80 dark:text-navy-400/80">
                      System maintenance scheduled for tonight.
                    </AlertDescription>
                  </Alert>
                  <Alert variant="destructive" className="bg-rose-50/50 dark:bg-rose-900/10">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to sync with warehouse API.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Badge & Button Showcase */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Design System</CardTitle>
                  <CardDescription>Badge & button variants</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Badges */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Badge Variants</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="success">Success</Badge>
                      <Badge variant="warning">Warning</Badge>
                      <Badge variant="info">Info</Badge>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Button Variants</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Default</Button>
                      <Button variant="secondary" size="sm">Secondary</Button>
                      <Button variant="outline" size="sm">Outline</Button>
                      <Button variant="ghost" size="sm">Ghost</Button>
                      <Button variant="destructive" size="sm">Destructive</Button>
                      <Button variant="link" size="sm">Link</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="success" size="sm">Success</Button>
                      <Button variant="info" size="sm">Info</Button>
                      <Button variant="warning" size="sm">Warning</Button>
                      <Button variant="danger" size="sm">Danger</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Footer - sticky at bottom */}
      <Footer />
    </div>
  )
}
