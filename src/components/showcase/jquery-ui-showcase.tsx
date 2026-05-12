/**
 * jQuery UI 1.12.1 Replacement Showcase
 * Demonstrates all components from /src/lib/ims-jquery-ui/
 *
 * Replaces: jquery-ui.js (accordion, slider, spinner, tabs, tooltip,
 *           progressbar, autocomplete, dialog, effects)
 *
 * Deep Navy Blue theme: #0a1628, #1a2744, #243b5c
 */

'use client';

import * as React from 'react';
import {
  ImsJuiAccordion,
  ImsJuiAccordionPanel,
  ImsJuiSlider,
  ImsJuiSpinner,
  ImsJuiTabs,
  ImsJuiTabList,
  ImsJuiTab,
  ImsJuiTabPanel,
  ImsJuiTooltip,
  ImsJuiPopover,
  ImsJuiProgressbar,
  ImsJuiAutocomplete,
  ImsJuiDialog,
  ImsJuiDialogHeader,
  ImsJuiDialogBody,
  ImsJuiDialogFooter,
  ImsJuiDialogTitle,
  useJuiEffect,
  animateEffect,
  CSS_CLASSES,
} from '@/lib/ims-jquery-ui';
import type { AutocompleteItem, EffectName } from '@/lib/ims-jquery-ui';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Layers, Info, Star, ShoppingCart, Users, Settings, Package, FileText, BarChart3, Box } from 'lucide-react';

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
// Accordion Demo
// ============================================================================

function AccordionDemo() {
  return (
    <Section
      title="ImsJuiAccordion"
      description="Single/multiple panel expand with animated transitions and collapsible mode"
      replaces="ims-accordion"
    >
      {/* Standard accordion */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Standard Accordion
      </h4>
      <ImsJuiAccordion animate={200}>
        <ImsJuiAccordionPanel header="Product Management">
          Add, edit, and organize products in your catalog. Manage categories, pricing tiers, and product variants.
          Bulk import/export support with CSV and Excel files.
        </ImsJuiAccordionPanel>
        <ImsJuiAccordionPanel header="Inventory Tracking">
          Real-time stock level monitoring across all warehouses. Set reorder points and receive
          low-stock notifications. Track inventory movements and adjustments.
        </ImsJuiAccordionPanel>
        <ImsJuiAccordionPanel header="Supplier Management">
          Maintain supplier database with contact information and performance metrics.
          Manage purchase orders and track supplier deliveries.
        </ImsJuiAccordionPanel>
      </ImsJuiAccordion>

      <Separator className="my-5" />

      {/* Collapsible accordion */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Collapsible Accordion (all panels can be closed)
      </h4>
      <ImsJuiAccordion collapsible animate={300} active={0}>
        <ImsJuiAccordionPanel header="Click to expand / collapse">
          This accordion allows closing all panels. Click the active panel header to collapse it.
        </ImsJuiAccordionPanel>
        <ImsJuiAccordionPanel header="Another collapsible panel">
          With collapsible=true, clicking the active panel header will close it instead of keeping one open.
        </ImsJuiAccordionPanel>
      </ImsJuiAccordion>
    </Section>
  );
}

// ============================================================================
// Slider Demo
// ============================================================================

function SliderDemo() {
  const [singleValue, setSingleValue] = React.useState(50);
  const [rangeValues, setRangeValues] = React.useState<number[]>([25, 75]);

  return (
    <Section
      title="ImsJuiSlider"
      description="Horizontal/vertical slider with range, min/max, step, tick marks, and labels"
      replaces="ims-slider"
    >
      {/* Single value slider */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Single Value Slider
      </h4>
      <div className="max-w-md">
        <ImsJuiSlider
          min={0}
          max={100}
          step={1}
          value={singleValue}
          onValueChange={(v) => setSingleValue(v as number)}
          animate="fast"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>0</span>
          <span className="text-navy-600 dark:text-navy-400 font-semibold">Value: {singleValue}</span>
          <span>100</span>
        </div>
      </div>

      <Separator className="my-5" />

      {/* Range slider */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Range Slider
      </h4>
      <div className="max-w-md">
        <ImsJuiSlider
          min={0}
          max={1000}
          step={10}
          range
          values={rangeValues}
          onValueChange={(v) => setRangeValues(v as number[])}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>$0</span>
          <span className="text-navy-600 dark:text-navy-400 font-semibold">
            ${rangeValues[0]} — ${rangeValues[1]}
          </span>
          <span>$1,000</span>
        </div>
      </div>

      <Separator className="my-5" />

      {/* Slider with ticks */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Slider with Tick Marks
      </h4>
      <div className="max-w-md">
        <ImsJuiSlider
          min={0}
          max={100}
          step={5}
          defaultValue={60}
          ticks={{ step: 10, showLabels: true, majorEvery: 2 }}
        />
      </div>
    </Section>
  );
}

// ============================================================================
// Spinner Demo
// ============================================================================

function SpinnerDemo() {
  const [quantity, setQuantity] = React.useState(10);
  const [price, setPrice] = React.useState(29.99);

  return (
    <Section
      title="ImsJuiSpinner"
      description="Number spinner with up/down buttons, keyboard support, hold-to-spin acceleration, and formatting"
      replaces="ims-spinner"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-navy-700 dark:text-navy-300 block mb-2">
            Quantity
          </label>
          <ImsJuiSpinner
            value={quantity}
            onValueChange={setQuantity}
            min={0}
            max={9999}
            step={1}
            size="default"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Step: 1 | Min: 0 | Max: 9999
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-navy-700 dark:text-navy-300 block mb-2">
            Unit Price
          </label>
          <ImsJuiSpinner
            value={price}
            onValueChange={setPrice}
            min={0}
            max={9999.99}
            step={0.01}
            numberFormat="C2"
            size="default"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Step: 0.01 | Currency format | Hold to accelerate
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-navy-700 dark:text-navy-300 block mb-1.5">Small</label>
          <ImsJuiSpinner defaultValue={5} step={1} size="sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-navy-700 dark:text-navy-300 block mb-1.5">Default</label>
          <ImsJuiSpinner defaultValue={50} step={5} size="default" />
        </div>
        <div>
          <label className="text-xs font-medium text-navy-700 dark:text-navy-300 block mb-1.5">Large</label>
          <ImsJuiSpinner defaultValue={100} step={10} size="lg" />
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// Tabs Demo
// ============================================================================

function JuiTabsDemo() {
  return (
    <Section
      title="ImsJuiTabs"
      description="jQuery UI-style tabs with Deep Navy Blue header bar, keyboard navigation, and disabled tabs"
      replaces="ims-tabs"
    >
      <ImsJuiTabs defaultValue="dashboard" collapsible={false}>
        <ImsJuiTabList>
          <ImsJuiTab value="dashboard" icon={<BarChart3 className="size-4" />}>
            Dashboard
          </ImsJuiTab>
          <ImsJuiTab value="products" icon={<Package className="size-4" />}>
            Products
          </ImsJuiTab>
          <ImsJuiTab value="orders" icon={<ShoppingCart className="size-4" />}>
            Orders
          </ImsJuiTab>
          <ImsJuiTab value="reports" icon={<FileText className="size-4" />}>
            Reports
          </ImsJuiTab>
          <ImsJuiTab value="disabled" disabled>
            Disabled
          </ImsJuiTab>
        </ImsJuiTabList>
        <ImsJuiTabPanel value="dashboard">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Products', value: '1,284', icon: Package },
              { label: 'Active Orders', value: '42', icon: ShoppingCart },
              { label: 'Team Members', value: '18', icon: Users },
              { label: 'Revenue', value: '$84.5K', icon: BarChart3 },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 bg-navy-50 dark:bg-navy-900/30 rounded-md text-center"
              >
                <stat.icon className="size-5 mx-auto text-navy-600 dark:text-navy-400 mb-1" />
                <p className="text-lg font-bold text-navy-700 dark:text-navy-300">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </ImsJuiTabPanel>
        <ImsJuiTabPanel value="products">
          <p className="text-sm text-muted-foreground">
            Manage your product catalog with categories, pricing, and stock levels.
            Supports bulk import and export operations.
          </p>
        </ImsJuiTabPanel>
        <ImsJuiTabPanel value="orders">
          <p className="text-sm text-muted-foreground">
            Track and manage customer orders. Process returns and handle shipping
            integrations from this panel.
          </p>
        </ImsJuiTabPanel>
        <ImsJuiTabPanel value="reports">
          <p className="text-sm text-muted-foreground">
            Generate sales reports, inventory audits, and financial summaries.
            Schedule automated report delivery via email.
          </p>
        </ImsJuiTabPanel>
        <ImsJuiTabPanel value="disabled">
          This tab is disabled and cannot be selected.
        </ImsJuiTabPanel>
      </ImsJuiTabs>
    </Section>
  );
}

// ============================================================================
// Tooltip Demo
// ============================================================================

function TooltipDemo() {
  return (
    <Section
      title="ImsJuiTooltip / ImsJuiPopover"
      description="Tooltip with four placement directions, mouse tracking, and popover with title + content"
      replaces="ims-tooltip"
    >
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Tooltip Placements
      </h4>
      <div className="flex flex-wrap gap-3 mb-6">
        <ImsJuiTooltip content="Tooltip on top" side="top">
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">Top</Button>
        </ImsJuiTooltip>
        <ImsJuiTooltip content="Tooltip on bottom" side="bottom">
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">Bottom</Button>
        </ImsJuiTooltip>
        <ImsJuiTooltip content="Tooltip on left" side="left">
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">Left</Button>
        </ImsJuiTooltip>
        <ImsJuiTooltip content="Tooltip on right" side="right">
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">Right</Button>
        </ImsJuiTooltip>
      </div>

      <Separator className="my-4" />

      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Tooltip with Delay
      </h4>
      <div className="flex flex-wrap gap-3 mb-6">
        <ImsJuiTooltip content="Shown after 500ms delay" side="top" showDelay={500}>
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">500ms Delay</Button>
        </ImsJuiTooltip>
        <ImsJuiTooltip content="Immediate tooltip" side="top" showDelay={0}>
          <Button variant="outline" size="sm" className="border-navy-300 dark:border-navy-600">No Delay</Button>
        </ImsJuiTooltip>
      </div>

      <Separator className="my-4" />

      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Popover (Tooltip with Title)
      </h4>
      <div className="flex flex-wrap gap-3">
        <ImsJuiPopover
          title="Product Info"
          content="This product has 142 units in stock across 3 warehouses."
          side="top"
        >
          <Button size="sm" className="bg-navy-600 hover:bg-navy-700">
            <Info className="size-4 mr-1" /> Product Popover
          </Button>
        </ImsJuiPopover>
        <ImsJuiPopover
          title="Order Status"
          content="This order is currently being processed and will ship within 2 business days."
          side="bottom"
        >
          <Button size="sm" variant="outline" className="border-navy-300 dark:border-navy-600">
            <ShoppingCart className="size-4 mr-1" /> Order Popover
          </Button>
        </ImsJuiPopover>
      </div>
    </Section>
  );
}

// ============================================================================
// Progressbar Demo
// ============================================================================

function ProgressbarDemo() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <Section
      title="ImsJuiProgressbar"
      description="Determinate/indeterminate progress bar with labels, striped animation, and size variants"
      replaces="ims-progressbar"
    >
      {/* Animated progress */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Animated Progress (auto-incrementing)
      </h4>
      <ImsJuiProgressbar value={progress} showLabel labelPosition="right" size="default" />
      <p className="text-xs text-muted-foreground mt-2">
        Current: {progress}%
      </p>

      <Separator className="my-5" />

      {/* Static progress bars */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Static Progress Bars
      </h4>
      <div className="space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">25% — Small</label>
          <ImsJuiProgressbar value={25} showLabel labelPosition="right" size="sm" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">60% — Default</label>
          <ImsJuiProgressbar value={60} showLabel labelPosition="right" size="default" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">85% — Large</label>
          <ImsJuiProgressbar value={85} showLabel labelPosition="right" size="lg" />
        </div>
      </div>

      <Separator className="my-5" />

      {/* Indeterminate */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Indeterminate (loading)
      </h4>
      <ImsJuiProgressbar indeterminate size="default" />

      <Separator className="my-5" />

      {/* Striped */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Striped Progress
      </h4>
      <ImsJuiProgressbar value={70} striped showLabel labelPosition="outside" size="lg" />
    </Section>
  );
}

// ============================================================================
// Autocomplete Demo
// ============================================================================

function AutocompleteDemo() {
  // Local data source
  const localProducts: AutocompleteItem[] = [
    { label: 'Widget Standard', value: 'prod-001', group: 'Widgets' },
    { label: 'Widget Pro', value: 'prod-002', group: 'Widgets' },
    { label: 'Widget Enterprise', value: 'prod-003', group: 'Widgets' },
    { label: 'Gadget Basic', value: 'prod-004', group: 'Gadgets' },
    { label: 'Gadget Plus', value: 'prod-005', group: 'Gadgets' },
    { label: 'Gadget Ultra', value: 'prod-006', group: 'Gadgets' },
    { label: 'Sensor Type-A', value: 'prod-007', group: 'Sensors' },
    { label: 'Sensor Type-B', value: 'prod-008', group: 'Sensors' },
    { label: 'Controller X1', value: 'prod-009', group: 'Controllers' },
    { label: 'Controller X2', value: 'prod-010', group: 'Controllers' },
    { label: 'Module Alpha', value: 'prod-011', group: 'Modules' },
    { label: 'Module Beta', value: 'prod-012', group: 'Modules' },
  ];

  const [selectedProduct, setSelectedProduct] = React.useState<string>('');

  return (
    <Section
      title="ImsJuiAutocomplete"
      description="Search input with dropdown suggestions, group support, keyboard navigation, and debounced search"
      replaces="ims-autocomplete"
    >
      <div className="max-w-md space-y-4">
        <div>
          <label className="text-sm font-medium text-navy-700 dark:text-navy-300 block mb-2">
            Search Products (local data with groups)
          </label>
          <ImsJuiAutocomplete
            source={localProducts}
            minLength={1}
            delay={200}
            placeholder="Type to search products..."
            autoFocus={false}
            maxShowItems={5}
            onSelect={(_, { item }) => {
              setSelectedProduct(item?.label ?? '');
            }}
          />
          {selectedProduct && (
            <p className="text-xs text-navy-600 dark:text-navy-400 mt-2">
              Selected: <strong>{selectedProduct}</strong>
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-navy-700 dark:text-navy-300 block mb-2">
            Quick Search (no groups)
          </label>
          <ImsJuiAutocomplete
            source={[
              { label: 'Dashboard', value: 'dashboard' },
              { label: 'Products', value: 'products' },
              { label: 'Orders', value: 'orders' },
              { label: 'Customers', value: 'customers' },
              { label: 'Reports', value: 'reports' },
              { label: 'Settings', value: 'settings' },
            ]}
            minLength={1}
            delay={150}
            placeholder="Search pages..."
          />
        </div>
      </div>
    </Section>
  );
}

// ============================================================================
// Dialog Demo
// ============================================================================

function DialogDemo() {
  const [basicOpen, setBasicOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);

  return (
    <Section
      title="ImsJuiDialog"
      description="Modal dialog with draggable header, close on escape, and Deep Navy Blue themed header"
      replaces="ims-dialog"
    >
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setBasicOpen(true)} className="bg-navy-600 hover:bg-navy-700">
          Open Basic Dialog
        </Button>
        <Button variant="outline" onClick={() => setFormOpen(true)} className="border-navy-300 dark:border-navy-600">
          Open Form Dialog
        </Button>
      </div>

      {/* Basic Dialog */}
      <ImsJuiDialog
        open={basicOpen}
        onOpenChange={setBasicOpen}
        title="Confirmation Required"
        modal
        draggable
        size="sm"
      >
        <ImsJuiDialogHeader onClose={() => setBasicOpen(false)}>
          <ImsJuiDialogTitle>Confirmation Required</ImsJuiDialogTitle>
        </ImsJuiDialogHeader>
        <ImsJuiDialogBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to proceed with this action? This will update the inventory
            records across all connected warehouses.
          </p>
        </ImsJuiDialogBody>
        <ImsJuiDialogFooter>
          <Button variant="outline" onClick={() => setBasicOpen(false)} className="border-navy-300 dark:border-navy-600">
            Cancel
          </Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => setBasicOpen(false)}>
            Confirm
          </Button>
        </ImsJuiDialogFooter>
      </ImsJuiDialog>

      {/* Form Dialog */}
      <ImsJuiDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Add New Product"
        modal
        draggable
        size="default"
      >
        <ImsJuiDialogHeader onClose={() => setFormOpen(false)}>
          <ImsJuiDialogTitle>Add New Product</ImsJuiDialogTitle>
        </ImsJuiDialogHeader>
        <ImsJuiDialogBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Product Name</label>
              <input
                className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none"
                placeholder="Enter product name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-navy-700 dark:text-navy-300">SKU</label>
                <input
                  className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none"
                  placeholder="SKU-0001"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Category</label>
                <input
                  className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none"
                  placeholder="Select category"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-navy-700 dark:text-navy-300">Description</label>
              <textarea
                className="mt-1 w-full rounded-md border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none resize-none"
                rows={3}
                placeholder="Product description..."
              />
            </div>
          </div>
        </ImsJuiDialogBody>
        <ImsJuiDialogFooter>
          <Button variant="outline" onClick={() => setFormOpen(false)} className="border-navy-300 dark:border-navy-600">
            Cancel
          </Button>
          <Button className="bg-navy-600 hover:bg-navy-700" onClick={() => setFormOpen(false)}>
            Add Product
          </Button>
        </ImsJuiDialogFooter>
      </ImsJuiDialog>
    </Section>
  );
}

// ============================================================================
// Effects Demo
// ============================================================================

function EffectsDemo() {
  const shakeRef = React.useRef<HTMLDivElement>(null);
  const bounceRef = React.useRef<HTMLDivElement>(null);
  const highlightRef = React.useRef<HTMLDivElement>(null);
  const fadeRef = React.useRef<HTMLDivElement>(null);
  const scaleRef = React.useRef<HTMLDivElement>(null);
  const pulsateRef = React.useRef<HTMLDivElement>(null);

  const { animate } = useJuiEffect();

  const playEffect = (ref: React.RefObject<HTMLDivElement | null>, effectName: EffectName) => {
    if (ref.current) {
      animate(ref.current, effectName, {}, 500);
    }
  };

  return (
    <Section
      title="jQuery UI Effects"
      description="15 effect animations using Web Animations API — shake, bounce, highlight, and more"
      replaces="effects.js"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Shake */}
        <div className="text-center">
          <div
            ref={shakeRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-600 text-white rounded-lg font-semibold mb-2"
          >
            Shake
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(shakeRef, 'shake')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Shake
            </Button>
          </div>
        </div>

        {/* Bounce */}
        <div className="text-center">
          <div
            ref={bounceRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-500 text-white rounded-lg font-semibold mb-2"
          >
            Bounce
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(bounceRef, 'bounce')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Bounce
            </Button>
          </div>
        </div>

        {/* Highlight */}
        <div className="text-center">
          <div
            ref={highlightRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 rounded-lg font-semibold mb-2"
          >
            Highlight
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(highlightRef, 'highlight')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Highlight
            </Button>
          </div>
        </div>

        {/* Fade */}
        <div className="text-center">
          <div
            ref={fadeRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-700 text-white rounded-lg font-semibold mb-2"
          >
            Fade
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(fadeRef, 'fade')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Fade
            </Button>
          </div>
        </div>

        {/* Scale */}
        <div className="text-center">
          <div
            ref={scaleRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-400 text-white rounded-lg font-semibold mb-2"
          >
            Scale
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(scaleRef, 'scale')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Scale
            </Button>
          </div>
        </div>

        {/* Pulsate */}
        <div className="text-center">
          <div
            ref={pulsateRef}
            className="inline-flex items-center justify-center w-24 h-24 bg-navy-800 text-white rounded-lg font-semibold mb-2"
          >
            Pulsate
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => playEffect(pulsateRef, 'pulsate')}
              className="border-navy-300 dark:border-navy-600"
            >
              Play Pulsate
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-5" />

      {/* More effects buttons */}
      <h4 className="text-sm font-semibold text-navy-700 dark:text-navy-300 mb-3">
        Additional Effects
      </h4>
      <div className="flex flex-wrap gap-2">
        {(['blind', 'clip', 'drop', 'fold', 'slide'] as EffectName[]).map((effectName) => {
          const ref = React.createRef<HTMLDivElement>();
          return (
            <span key={effectName}>
              <Button
                size="sm"
                variant="outline"
                className="border-navy-300 dark:border-navy-600 capitalize"
                onClick={() => {
                  // Use a temporary target div for these effects
                  const target = document.getElementById(`effect-target-${effectName}`);
                  if (target) {
                    animate(target, effectName, { mode: 'effect' }, 500);
                  }
                }}
              >
                {effectName}
              </Button>
              <span
                id={`effect-target-${effectName}`}
                className="hidden"
              />
            </span>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Additional effects (blind, clip, drop, fold, slide) can be triggered programmatically via the <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">useJuiEffect()</code> hook.
      </p>
    </Section>
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function JqueryUiShowcase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-navy-800 dark:text-navy-200 flex items-center gap-2">
          <Layers className="size-5" />
          jQuery UI 1.12.1 Replacements
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive demos for all components from <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-xs">/src/lib/ims-jquery-ui/</code>
        </p>
      </div>

      {/* Sections */}
      <AccordionDemo />
      <SliderDemo />
      <SpinnerDemo />
      <JuiTabsDemo />
      <TooltipDemo />
      <ProgressbarDemo />
      <AutocompleteDemo />
      <DialogDemo />
      <EffectsDemo />
    </div>
  );
}

export default JqueryUiShowcase;
