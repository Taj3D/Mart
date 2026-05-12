/**
 * Bootstrap 3 JavaScript Replacement Showcase
 * Demonstrates all components from /src/lib/ims-bootstrap/
 *
 * Replaces: bootstrap.js (carousel.js, collapse.js, modal.js,
 *           tab.js, alert.js, button.js, scrollspy.js, affix.js)
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

'use client';

import * as React from 'react';
import {
  ImsCarousel,
  ImsCarouselItem,
  ImsCarouselCaption,
  ImsCollapse,
  ImsCollapseTrigger,
  ImsAccordion,
  ImsAccordionPanel,
  ImsModal,
  ImsModalHeader,
  ImsModalBody,
  ImsModalFooter,
  ImsModalTitle,
  ImsTabs,
  ImsTabNav,
  ImsTabItem,
  ImsTabContent,
  ImsTabPane,
  ImsDismissAlert,
  ImsAlertHeading,
  ImsAlertLink,
  ImsLoadingButton,
  ImsToggleButton,
  ImsButtonToolbar,
  useScrollSpy,
  useAffix,
} from '@/lib/ims-bootstrap';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Users, BarChart3, Settings, Save, Trash2, RefreshCw, Bold, Italic, Underline } from 'lucide-react';

// ============================================================================
// Section wrapper
// ============================================================================

function Section({
  title,
  description,
  replaces,
  children,
}: {
  title: string;
  description: string;
  replaces: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-navy-200 dark:border-navy-700">
      <CardHeader className="bg-navy-50 dark:bg-navy-900/30 border-b border-navy-200 dark:border-navy-700">
        <CardTitle className="text-navy-800 dark:text-navy-200 text-lg">{title}</CardTitle>
        <CardDescription className="text-navy-600 dark:text-navy-400">
          {description}
        </CardDescription>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-navy-500 dark:text-navy-400">
          <span className="font-mono bg-navy-100 dark:bg-navy-800 px-1.5 py-0.5 rounded">
            {replaces}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

// ============================================================================
// Carousel Demo
// ============================================================================

function CarouselDemo() {
  const slides = [
    {
      title: 'Inventory Management',
      desc: 'Track stock levels across warehouses in real time',
      gradient: 'from-navy-700 to-navy-900',
    },
    {
      title: 'Sales Analytics',
      desc: 'Comprehensive dashboards and reporting tools',
      gradient: 'from-navy-600 to-navy-800',
    },
    {
      title: 'Order Processing',
      desc: 'Automated workflows for order fulfillment',
      gradient: 'from-navy-800 to-navy-950',
    },
  ];

  return (
    <Section
      title="ImsCarousel"
      description="Carousel with autoplay, indicators, keyboard navigation, and pause-on-hover"
      replaces="carousel.js"
    >
      <ImsCarousel interval={3000} pauseOnHover indicators controls className="rounded-lg overflow-hidden">
        {slides.map((slide, i) => (
          <ImsCarouselItem key={i}>
            <div className={`bg-gradient-to-r ${slide.gradient} flex items-center justify-center h-48 sm:h-56`}>
              <ImsCarouselCaption className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
                <p className="text-white/80 text-sm">{slide.desc}</p>
              </ImsCarouselCaption>
            </div>
          </ImsCarouselItem>
        ))}
      </ImsCarousel>
      <p className="text-xs text-muted-foreground mt-3">
        Auto-advances every 3s. Pause on hover. Use arrow keys for navigation.
      </p>
    </Section>
  );
}

// ============================================================================
// Collapse / Accordion Demo
// ============================================================================

function CollapseAccordionDemo() {
  const [open1, setOpen1] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);

  return (
    <Section
      title="ImsCollapse / ImsAccordion"
      description="Animated expand/collapse with accordion mode (only one open at a time)"
      replaces="collapse.js"
    >
      {/* Standalone Collapse */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Standalone Collapse
      </h4>
      <div className="space-y-2 mb-6">
        <div className="flex gap-2">
          <ImsCollapseTrigger
            onToggle={() => setOpen1(!open1)}
            className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors text-sm"
          >
            Toggle Panel 1
          </ImsCollapseTrigger>
          <ImsCollapseTrigger
            onToggle={() => setOpen2(!open2)}
            className="px-4 py-2 bg-navy-600 text-white rounded-md hover:bg-navy-700 transition-colors text-sm"
          >
            Toggle Panel 2
          </ImsCollapseTrigger>
        </div>
        <ImsCollapse open={open1} defaultOpen={false} duration={350}>
          <div className="p-4 bg-navy-50 dark:bg-navy-900/30 rounded-md border border-navy-200 dark:border-navy-700 text-sm">
            <strong className="text-navy-700 dark:text-navy-300">Panel 1 Content</strong>
            <p className="mt-1 text-muted-foreground">
              This panel can be independently toggled. Height animates with 350ms transition.
            </p>
          </div>
        </ImsCollapse>
        <ImsCollapse open={open2} defaultOpen={false} duration={350}>
          <div className="p-4 bg-navy-50 dark:bg-navy-900/30 rounded-md border border-navy-200 dark:border-navy-700 text-sm">
            <strong className="text-navy-700 dark:text-navy-300">Panel 2 Content</strong>
            <p className="mt-1 text-muted-foreground">
              Multiple collapses can be open simultaneously when not grouped in an accordion.
            </p>
          </div>
        </ImsCollapse>
      </div>

      <Separator className="my-4" />

      {/* Accordion */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Accordion (only one open)
      </h4>
      <ImsAccordion groupId="demo-accordion">
        <ImsAccordionPanel header="Products & Inventory" defaultOpen variant="primary">
          Manage your product catalog and track inventory levels across all warehouses.
          Real-time stock alerts and automatic reorder points.
        </ImsAccordionPanel>
        <ImsAccordionPanel header="Orders & Shipping" variant="info">
          Process orders, manage shipments, and track deliveries end-to-end.
          Integrates with major shipping carriers.
        </ImsAccordionPanel>
        <ImsAccordionPanel header="Reports & Analytics" variant="success">
          Generate detailed reports on sales, inventory, and financial performance.
          Custom dashboards with real-time data.
        </ImsAccordionPanel>
        <ImsAccordionPanel header="System Settings" variant="warning">
          Configure ERP settings, user permissions, and integration endpoints.
          Audit log and backup management.
        </ImsAccordionPanel>
      </ImsAccordion>
    </Section>
  );
}

// ============================================================================
// Modal Demo
// ============================================================================

function ModalDemo() {
  const [smOpen, setSmOpen] = React.useState(false);
  const [defaultOpen, setDefaultOpen] = React.useState(false);
  const [lgOpen, setLgOpen] = React.useState(false);

  return (
    <Section
      title="ImsModal"
      description="Modal dialogs with backdrop, body scroll lock, focus trap, and size variants"
      replaces="modal.js"
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setSmOpen(true)} className="border-navy-300 dark:border-navy-600">
          Small Modal
        </Button>
        <Button onClick={() => setDefaultOpen(true)} className="bg-navy-600 hover:bg-navy-700">
          Default Modal
        </Button>
        <Button variant="outline" onClick={() => setLgOpen(true)} className="border-navy-300 dark:border-navy-600">
          Large Modal
        </Button>
      </div>

      {/* Small Modal */}
      <ImsModal open={smOpen} onOpenChange={setSmOpen} size="sm">
        <ImsModalHeader onClose={() => setSmOpen(false)} variant="navy">
          <ImsModalTitle>Confirm Delete</ImsModalTitle>
        </ImsModalHeader>
        <ImsModalBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
        </ImsModalBody>
        <ImsModalFooter>
          <Button variant="outline" onClick={() => setSmOpen(false)} className="border-navy-300 dark:border-navy-600">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setSmOpen(false)}>Delete</Button>
        </ImsModalFooter>
      </ImsModal>

      {/* Default Modal */}
      <ImsModal open={defaultOpen} onOpenChange={setDefaultOpen} size="default">
        <ImsModalHeader onClose={() => setDefaultOpen(false)} variant="navy">
          <ImsModalTitle>Create New Order</ImsModalTitle>
        </ImsModalHeader>
        <ImsModalBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Order Number</label>
              <input
                className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none"
                placeholder="ORD-2024-001"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Customer</label>
              <input
                className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none"
                placeholder="Select customer..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Notes</label>
              <textarea
                className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none resize-none"
                rows={3}
                placeholder="Add any notes..."
              />
            </div>
          </div>
        </ImsModalBody>
        <ImsModalFooter>
          <Button variant="outline" onClick={() => setDefaultOpen(false)} className="border-navy-300 dark:border-navy-600">
            Cancel
          </Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => setDefaultOpen(false)}>
            Create Order
          </Button>
        </ImsModalFooter>
      </ImsModal>

      {/* Large Modal */}
      <ImsModal open={lgOpen} onOpenChange={setLgOpen} size="lg">
        <ImsModalHeader onClose={() => setLgOpen(false)} variant="navy">
          <ImsModalTitle>Order Details</ImsModalTitle>
        </ImsModalHeader>
        <ImsModalBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-md">
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-semibold text-navy-700 dark:text-navy-300">ORD-2024-0042</p>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-md">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="font-semibold text-navy-700 dark:text-navy-300">Acme Corp</p>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-md">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-emerald-600">Processing</p>
            </div>
            <div className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-md">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold text-navy-700 dark:text-navy-300">$12,450.00</p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-2">Line Items</h4>
            <div className="space-y-2">
              {[
                { sku: 'SKU-001', name: 'Widget A', qty: 100, price: '$5,000' },
                { sku: 'SKU-002', name: 'Widget B', qty: 200, price: '$4,000' },
                { sku: 'SKU-003', name: 'Gadget C', qty: 50, price: '$3,450' },
              ].map((item) => (
                <div
                  key={item.sku}
                  className="flex justify-between items-center p-2 bg-white dark:bg-navy-900 rounded border border-navy-100 dark:border-navy-800 text-sm"
                >
                  <span className="font-mono text-navy-600 dark:text-navy-400">{item.sku}</span>
                  <span className="flex-1 ml-3">{item.name}</span>
                  <span className="text-muted-foreground">x{item.qty}</span>
                  <span className="ml-3 font-medium text-navy-700 dark:text-navy-300">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </ImsModalBody>
        <ImsModalFooter>
          <Button variant="outline" onClick={() => setLgOpen(false)} className="border-navy-300 dark:border-navy-600">
            Close
          </Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => setLgOpen(false)}>
            Print Invoice
          </Button>
        </ImsModalFooter>
      </ImsModal>
    </Section>
  );
}

// ============================================================================
// Tabs Demo
// ============================================================================

function TabsDemo() {
  return (
    <Section
      title="ImsTabs"
      description="Tabs with fade transitions, pill variant, and dropdown support"
      replaces="tab.js"
    >
      {/* Tab variant */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Tab Variant (with fade)
      </h4>
      <ImsTabs defaultValue="overview" fade duration={200}>
        <ImsTabNav variant="tabs">
          <ImsTabItem value="overview">Overview</ImsTabItem>
          <ImsTabItem value="products">Products</ImsTabItem>
          <ImsTabItem value="analytics">Analytics</ImsTabItem>
          <ImsTabItem value="settings" disabled>Settings</ImsTabItem>
        </ImsTabNav>
        <ImsTabContent>
          <ImsTabPane value="overview">
            <div className="p-4 bg-navy-50/50 dark:bg-navy-900/20 rounded-md">
              <h3 className="text-navy-700 dark:text-navy-300 font-semibold">Dashboard Overview</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome to the IMS ERP dashboard. Monitor your inventory, sales, and orders at a glance.
              </p>
            </div>
          </ImsTabPane>
          <ImsTabPane value="products">
            <div className="p-4 bg-navy-50/50 dark:bg-navy-900/20 rounded-md">
              <h3 className="text-navy-700 dark:text-navy-300 font-semibold">Product Catalog</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your complete product catalog with categories, pricing, and stock levels.
              </p>
            </div>
          </ImsTabPane>
          <ImsTabPane value="analytics">
            <div className="p-4 bg-navy-50/50 dark:bg-navy-900/20 rounded-md">
              <h3 className="text-navy-700 dark:text-navy-300 font-semibold">Analytics & Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View detailed analytics, sales trends, and generate custom reports.
              </p>
            </div>
          </ImsTabPane>
          <ImsTabPane value="settings">
            <div className="p-4 bg-navy-50/50 dark:bg-navy-900/20 rounded-md">
              Settings content (disabled tab).
            </div>
          </ImsTabPane>
        </ImsTabContent>
      </ImsTabs>

      <Separator className="my-5" />

      {/* Pill variant */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Pill Variant
      </h4>
      <ImsTabs defaultValue="all" fade={false}>
        <ImsTabNav variant="pills">
          <ImsTabItem value="all">All Items</ImsTabItem>
          <ImsTabItem value="active">Active</ImsTabItem>
          <ImsTabItem value="archived">Archived</ImsTabItem>
        </ImsTabNav>
        <ImsTabContent>
          <ImsTabPane value="all">
            <p className="text-sm text-muted-foreground p-3">Showing all items (42 total)</p>
          </ImsTabPane>
          <ImsTabPane value="active">
            <p className="text-sm text-muted-foreground p-3">Showing active items (38 active)</p>
          </ImsTabPane>
          <ImsTabPane value="archived">
            <p className="text-sm text-muted-foreground p-3">Showing archived items (4 archived)</p>
          </ImsTabPane>
        </ImsTabContent>
      </ImsTabs>
    </Section>
  );
}

// ============================================================================
// Dismiss Alert Demo
// ============================================================================

function DismissAlertDemo() {
  const [alerts, setAlerts] = React.useState({
    success: true,
    warning: true,
    info: true,
    danger: true,
  });

  const dismiss = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: false }));
  };

  const resetAlerts = () => {
    setAlerts({ success: true, warning: true, info: true, danger: true });
  };

  return (
    <Section
      title="ImsDismissAlert"
      description="Dismissible alerts with fade animation, auto-dismiss, and themed variants"
      replaces="alert.js"
    >
      <div className="space-y-3">
        {alerts.success && (
          <ImsDismissAlert variant="success" onDismiss={() => dismiss('success')}>
            <ImsAlertHeading>Success!</ImsAlertHeading>
            <p className="text-sm">
              Order #ORD-2024-0042 has been successfully created.{' '}
              <ImsAlertLink href="#">View Order</ImsAlertLink>
            </p>
          </ImsDismissAlert>
        )}
        {alerts.warning && (
          <ImsDismissAlert variant="warning" onDismiss={() => dismiss('warning')}>
            <ImsAlertHeading>Warning!</ImsAlertHeading>
            <p className="text-sm">
              Stock levels for 5 products are running low.{' '}
              <ImsAlertLink href="#">Check Inventory</ImsAlertLink>
            </p>
          </ImsDismissAlert>
        )}
        {alerts.info && (
          <ImsDismissAlert variant="info" onDismiss={() => dismiss('info')}>
            <ImsAlertHeading>Information</ImsAlertHeading>
            <p className="text-sm">
              System maintenance scheduled for Sunday 2:00 AM - 4:00 AM EST.
            </p>
          </ImsDismissAlert>
        )}
        {alerts.danger && (
          <ImsDismissAlert variant="danger" onDismiss={() => dismiss('danger')}>
            <ImsAlertHeading>Error!</ImsAlertHeading>
            <p className="text-sm">
              Failed to sync with warehouse API. Please check connection settings.
            </p>
          </ImsDismissAlert>
        )}
      </div>
      {!Object.values(alerts).some(Boolean) && (
        <p className="text-sm text-muted-foreground mt-3">All alerts dismissed.</p>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={resetAlerts}
        className="mt-3 border-navy-300 dark:border-navy-600"
      >
        Reset Alerts
      </Button>
    </Section>
  );
}

// ============================================================================
// LoadingButton / ToggleButton Demo
// ============================================================================

function ButtonDemo() {
  const [loading, setLoading] = React.useState(false);
  const [toggle1, setToggle1] = React.useState(false);
  const [toggle2, setToggle2] = React.useState(false);
  const [toggle3, setToggle3] = React.useState(true);

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Section
      title="ImsLoadingButton / ImsToggleButton"
      description="Loading state button with spinner and toggle button (checkbox/radio style)"
      replaces="button.js"
    >
      {/* Loading Button */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        ImsLoadingButton
      </h4>
      <div className="flex flex-wrap gap-3 mb-6">
        <ImsLoadingButton
          loading={loading}
          loadingText="Saving..."
          onClick={simulateLoading}
          className="bg-navy-600 hover:bg-navy-700"
        >
          <Save className="size-4 mr-1" /> Save Changes
        </ImsLoadingButton>
        <ImsLoadingButton
          loading={true}
          loadingText="Processing..."
          className="bg-navy-600 hover:bg-navy-700"
          spinnerPosition="right"
        >
          Process Order
        </ImsLoadingButton>
        <ImsLoadingButton
          loading={true}
          loadingText="Deleting..."
          variant="danger"
        >
          <Trash2 className="size-4 mr-1" /> Delete
        </ImsLoadingButton>
      </div>

      <Separator className="my-4" />

      {/* Toggle Buttons */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        ImsToggleButton
      </h4>
      <ImsButtonToolbar label="Formatting toolbar">
        <ImsToggleButton
          pressed={toggle1}
          onPressedChange={setToggle1}
          type="checkbox"
        >
          <Bold className="size-4" />
        </ImsToggleButton>
        <ImsToggleButton
          pressed={toggle2}
          onPressedChange={setToggle2}
          type="checkbox"
        >
          <Italic className="size-4" />
        </ImsToggleButton>
        <ImsToggleButton
          pressed={toggle3}
          onPressedChange={setToggle3}
          type="checkbox"
        >
          <Underline className="size-4" />
        </ImsToggleButton>
      </ImsButtonToolbar>
      <p className="text-xs text-muted-foreground mt-2">
        Bold: {toggle1 ? 'ON' : 'OFF'} | Italic: {toggle2 ? 'ON' : 'OFF'} | Underline: {toggle3 ? 'ON' : 'OFF'}
      </p>
    </Section>
  );
}

// ============================================================================
// ScrollSpy Demo
// ============================================================================

function ScrollSpyDemo() {
  const { activeId } = useScrollSpy({ offset: 20, throttle: 50 });

  const sections = [
    { id: 'carousel-section', label: 'Carousel' },
    { id: 'collapse-section', label: 'Collapse' },
    { id: 'modal-section', label: 'Modal' },
    { id: 'tabs-section', label: 'Tabs' },
    { id: 'alert-section', label: 'Alert' },
    { id: 'button-section', label: 'Button' },
  ];

  return (
    <Section
      title="useScrollSpy Hook"
      description="Tracks which section is currently in view based on scroll position"
      replaces="scrollspy.js"
    >
      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <div
            key={s.id}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeId === s.id
                ? 'bg-navy-600 text-white font-medium'
                : 'bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Active section: <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">{activeId ?? 'none'}</code>
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Scroll the page to see the active section highlight change.
      </p>
    </Section>
  );
}

// ============================================================================
// Affix Demo
// ============================================================================

function AffixDemo() {
  const { affixState, style, className } = useAffix({
    offsetTop: 80,
    onAffix: (state) => {
      // Callback when state changes
    },
  });

  return (
    <Section
      title="useAffix Hook"
      description="Sticky/affix behavior - sticks element to viewport on scroll"
      replaces="affix.js"
    >
      <div className="p-4 bg-navy-50 dark:bg-navy-900/30 rounded-md space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-navy-700 dark:text-navy-300">Current State:</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-mono ${
              affixState === 'top'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : affixState === 'bottom'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  : affixState === null
                    ? 'bg-navy-600 text-white'
                    : 'bg-gray-100 text-gray-700'
            }`}
          >
            {affixState === null ? 'affixed (sticky)' : affixState === 'top' ? 'top' : 'bottom'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>offsetTop:</strong> 80px — when scroll ≤ 80px, state is &quot;top&quot;</p>
          <p><strong>affixed:</strong> When scroll &gt; offsetTop, element becomes sticky</p>
          <p><strong>className:</strong> <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">{className || '(none)'}</code></p>
        </div>
        <div
          className="p-3 bg-navy-600 text-white text-sm rounded-md cursor-default"
          style={{ position: 'relative' }}
        >
          This element would stick to the top when affixed.
          <span className="ml-2 text-white/60 text-xs">(Preview only — not actually affixed in this context)</span>
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function BootstrapShowcase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-navy-800 dark:text-navy-200 flex items-center gap-2">
          <Package className="size-5" />
          Bootstrap 3 JavaScript Replacements
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive demos for all components from <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-xs">/src/lib/ims-bootstrap/</code>
        </p>
      </div>

      {/* Sections */}
      <div id="carousel-section">
        <CarouselDemo />
      </div>

      <div id="collapse-section">
        <CollapseAccordionDemo />
      </div>

      <div id="modal-section">
        <ModalDemo />
      </div>

      <div id="tabs-section">
        <TabsDemo />
      </div>

      <div id="alert-section">
        <DismissAlertDemo />
      </div>

      <div id="button-section">
        <ButtonDemo />
      </div>

      <div>
        <ScrollSpyDemo />
      </div>

      <div>
        <AffixDemo />
      </div>
    </div>
  );
}

export default BootstrapShowcase;
