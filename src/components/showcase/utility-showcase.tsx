'use client';

/**
 * Utility Showcase Component
 *
 * Demonstrates utility modules from the IMS ERP system:
 * 1. Number Utilities (ims-init/number-utils)
 * 2. Status Label Mapping (ims-init/label-utils)
 * 3. Table Utilities (ims-init/table-utils)
 * 4. Route Styling System (ims-init/route-styling)
 * 5. Responsive Breakpoints (ims-respond)
 * 6. Feature Detection (ims-modernizr)
 * 7. Sidebar Layout (ims-sidebar) with Collapse/Expand + localStorage
 * 8. Sidebar Nav Persistence (ims-sidebar-nav)
 *
 * Deep Navy Blue theme throughout: #0a1628, #1a2744, #243b5c
 */

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ims-init utilities
import {
  getDefaultFloatIfEmpty,
  getDefaultIntIfEmpty,
  parseNumber,
  isValidNumber,
  safeDivide,
  calculatePercentage,
  formatCurrency,
  roundTo,
  clamp,
  sum,
} from '@/lib/ims-init/number-utils';
import {
  DEFAULT_STATUS_LABELS,
  getStatusLabel,
  getStatusVariant,
  isStatusDefined,
  getAllStatusLabels,
  bootstrapLabelToVariant,
  variantToBootstrapLabel,
} from '@/lib/ims-init/label-utils';
import {
  matchRoute,
  getDefaultRouteStyles,
  ORDER_FORM_ROUTES,
  isOrderFormPage,
  isLoginPage,
  resolveRouteStyles,
  getBodyClasses,
  getNavbarClasses,
  getFooterClasses,
} from '@/lib/ims-init/route-styling';
import {
  imsSorter,
  ascendingSorter,
  getDefaultQueryParams,
  buildQueryString,
  getDefaultActionButtons,
} from '@/lib/ims-init/table-utils';

// ims-respond hooks
import {
  useViewport,
  useBreakpoint,
  useIsAbove,
  useIsBelow,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useMatchMedia,
  useViewportWidth,
  useOrientation,
} from '@/lib/ims-respond/use-responsive';
import {
  DEFAULT_BREAKPOINTS,
  BREAKPOINT_ORDER,
  pxToEm,
  emToPx,
  resolveBreakpoint,
} from '@/lib/ims-respond/breakpoints';
import {
  prefersDarkColorScheme,
  prefersReducedMotion,
  getPixelRatio,
} from '@/lib/ims-respond/responsive-utils';

// ims-modernizr
import {
  useFeatureDetection,
  useCSSFeature,
  useHTML5Feature,
  useTouchSupport,
  useWebGLSupport,
  useOnlineStatus,
} from '@/lib/ims-modernizr/use-feature-detection';
import {
  detectAllFeatures,
  generateFeatureClasses,
  testProp,
  testAllProps,
} from '@/lib/ims-modernizr/feature-tests';

// ims-sidebar
import {
  IMSSidebarPanel,
  IMSContentArea,
  type SidebarMenuItem,
  useSidebarState,
  NAVY_SIDEBAR_THEME,
  DEFAULT_SIDEBAR_HEADER,
} from '@/lib/ims-sidebar';

// ims-sidebar-nav
import {
  SidebarNavProvider,
  SidebarNavItem,
  SidebarCollapseButton,
  useSidebarNavContextSafe,
} from '@/lib/ims-sidebar-nav';

import {
  Calculator,
  Tag,
  Monitor,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  Check,
  X,
  Minus,
} from 'lucide-react';

// ============================================================================
// Section 1: Number Utilities
// ============================================================================

function NumberUtilitiesDemo() {
  const [testInput, setTestInput] = React.useState('');
  const [parsedResults, setParsedResults] = React.useState<Record<string, string>>({});

  const runTests = React.useCallback(() => {
    setParsedResults({
      'getDefaultFloatIfEmpty(test)': String(getDefaultFloatIfEmpty(testInput)),
      'getDefaultFloatIfEmpty("")': String(getDefaultFloatIfEmpty('')),
      'getDefaultFloatIfEmpty("abc")': String(getDefaultFloatIfEmpty('abc')),
      'getDefaultFloatIfEmpty(null)': String(getDefaultFloatIfEmpty(null)),
      'getDefaultFloatIfEmpty("3.14159")': String(getDefaultFloatIfEmpty('3.14159')),
      'getDefaultIntIfEmpty("42")': String(getDefaultIntIfEmpty('42')),
      'getDefaultIntIfEmpty("")': String(getDefaultIntIfEmpty('')),
      'parseNumber("3.14159", {precision:2})': String(parseNumber('3.14159', { precision: 2 })),
      'parseNumber("150", {min:0,max:100})': String(parseNumber('150', { min: 0, max: 100 })),
      'isValidNumber(test)': String(isValidNumber(testInput)),
      'safeDivide(100,5)': String(safeDivide(100, 5)),
      'safeDivide(100,0)': String(safeDivide(100, 0)),
      'calculatePercentage(25,100)': String(calculatePercentage(25, 100)),
      'formatCurrency(1234.5)': formatCurrency(1234.5),
      'formatCurrency(1234.5,2,"$")': formatCurrency(1234.5, 2, '$'),
      'roundTo(3.14159,2)': String(roundTo(3.14159, 2)),
      'clamp(150,0,100)': String(clamp(150, 0, 100)),
      'sum([1,"2",null,3])': String(sum([1, '2', null, 3])),
    });
  }, [testInput]);

  React.useEffect(() => { runTests(); }, [runTests]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces global <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">getDefaultFloatIfEmpty()</code> and{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">getDefaultIntIfEmpty()</code> from the original IMS script.
      </p>

      <div className="flex gap-2 items-end">
        <div className="space-y-1.5 flex-1">
          <Label className="text-navy-700 dark:text-navy-300 text-sm">Test Input Value</Label>
          <Input
            placeholder="Enter a value to test (e.g., 42, 'abc', empty)"
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            className="border-navy-200 dark:border-navy-700"
          />
        </div>
        <Button onClick={runTests} size="sm" className="bg-navy-600 hover:bg-navy-700 text-white">
          <RefreshCw className="h-3 w-3 mr-1" /> Run Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
        {Object.entries(parsedResults).map(([fn, result]) => (
          <div
            key={fn}
            className="flex items-center justify-between p-2 rounded-md bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800 text-xs"
          >
            <code className="text-navy-600 dark:text-navy-400 truncate mr-2">{fn}</code>
            <Badge
              variant={
                result === '0' || result === 'NaN' || result === 'false'
                  ? 'destructive'
                  : 'default'
              }
              className="text-[10px] py-0 px-1.5 shrink-0"
            >
              {result}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Section 2: Status Label Mapping
// ============================================================================

function StatusLabelDemo() {
  const allLabels = getAllStatusLabels();

  const variantColorMap: Record<string, string> = {
    default: 'bg-navy-600 text-white',
    info: 'bg-navy-500 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-500 text-white',
    danger: 'bg-red-600 text-white',
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces jQuery <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">$(&quot;.Transfer&quot;).addClass(&quot;label label-info&quot;)</code> patterns
        with Badge variant mapping. {Object.keys(allLabels).length} statuses defined.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto">
        {Object.entries(allLabels).map(([key, config]) => (
          <div
            key={key}
            className="flex items-center gap-2 p-2 rounded-md bg-navy-50/50 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800"
          >
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${variantColorMap[config.variant] || 'bg-gray-500 text-white'}`}>
              {config.label}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">{config.variant}</span>
          </div>
        ))}
      </div>

      {/* Lookup demo */}
      <div className="flex flex-wrap gap-2">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="font-medium">Bootstrap CSS mapping:</span>
          <Badge variant="info" className="text-[10px]">label-info → info</Badge>
          <Badge variant="destructive" className="text-[10px]">label-danger → danger</Badge>
          <Badge variant="warning" className="text-[10px]">label-warning → warning</Badge>
          <Badge variant="success" className="text-[10px]">label-success → success</Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section 3: Table Utilities
// ============================================================================

function TableUtilitiesDemo() {
  const sampleData = [
    { name: 'Widget A', price: 29.99, stock: 150 },
    { name: 'Widget B', price: 49.99, stock: 75 },
    { name: 'Widget C', price: 9.99, stock: 300 },
  ];

  const sortedDesc = [...sampleData].sort((a, b) => imsSorter(a.price, b.price));
  const sortedAsc = [...sampleData].sort((a, b) => ascendingSorter(a.price, b.price));
  const queryParams = getDefaultQueryParams({ search: 'widget', sort: 'price' });
  const queryString = buildQueryString(queryParams);
  const actionButtons = getDefaultActionButtons();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">rowStyle()</code>,{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">sorter()</code>,{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">queryParams()</code>, and action button patterns.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Sort demo */}
        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">imsSorter (descending)</p>
          {sortedDesc.map((item, i) => (
            <div key={i} className="text-xs flex justify-between py-0.5">
              <span>{item.name}</span>
              <span className="font-mono">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">ascendingSorter</p>
          {sortedAsc.map((item, i) => (
            <div key={i} className="text-xs flex justify-between py-0.5">
              <span>{item.name}</span>
              <span className="font-mono">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>

        {/* Query params demo */}
        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">getDefaultQueryParams + buildQueryString</p>
          <code className="text-[11px] text-navy-600 dark:text-navy-400 break-all">{queryString}</code>
        </div>

        {/* Action buttons */}
        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">getDefaultActionButtons</p>
          <div className="flex gap-1 flex-wrap">
            {actionButtons.map((btn, i) => (
              <Badge key={i} variant="outline" className="text-[10px] py-0 px-1.5">
                {btn.label} → {btn.variant}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section 4: Route Styling System
// ============================================================================

function RouteStylingDemo() {
  const testRoutes = [
    '/account/login',
    '/salesorder/create',
    '/salesorder/edit',
    '/purchaseorder/create',
    '/creditsalesorder/create',
    '/poreturn/create',
    '/transfer/create',
    '/dashboard',
    '/products',
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">$(&quot;body&quot;).addClass(&quot;login-bg&quot;)</code> and
        route-based DOM manipulation with declarative route style resolution.
      </p>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {testRoutes.map(route => {
          const styles = resolveRouteStyles(route);
          return (
            <div
              key={route}
              className="flex items-center gap-2 p-2 rounded-md bg-navy-50/50 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800 text-xs"
            >
              <code className="text-navy-600 dark:text-navy-400 font-mono min-w-[180px]">{route}</code>
              <div className="flex gap-1 flex-wrap flex-1">
                {styles.isLoginPage && <Badge variant="info" className="text-[9px] py-0 px-1">Login Page</Badge>}
                {styles.isOrderForm && <Badge variant="warning" className="text-[9px] py-0 px-1">Order Form</Badge>}
                {styles.bodyClasses.length > 0 && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    body: {styles.bodyClasses.join(' ')}
                  </Badge>
                )}
                {styles.navbarClasses.length > 0 && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    navbar: {styles.navbarClasses.join(' ')}
                  </Badge>
                )}
                {styles.footerClasses.length > 0 && (
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    footer: {styles.footerClasses.join(' ')}
                  </Badge>
                )}
                {!styles.isLoginPage && !styles.isOrderForm && styles.bodyClasses.length === 0 && styles.navbarClasses.length === 0 && (
                  <span className="text-muted-foreground">Default route</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Section 5: Responsive Breakpoints (ims-respond)
// ============================================================================

function ResponsiveDemo() {
  const { viewport, isMobile, isTablet, isDesktop, isLargeDesktop, breakpoint, isAbove, isBelow } = useViewport();
  const bpName = useBreakpoint();
  const width = useViewportWidth();
  const orientation = useOrientation();
  const isMobileHook = useIsMobile();
  const isTabletHook = useIsTablet();
  const isDesktopHook = useIsDesktop();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces Respond.js v1.2.0 + matchMedia polyfill with React hooks using <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">useSyncExternalStore</code>.
        Resize your browser to see changes.
      </p>

      {/* Current Viewport */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-navy-600 to-navy-700 text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{width}px</p>
            <p className="text-xs text-white/70">Viewport Width</p>
          </div>
          <div>
            <p className="text-2xl font-bold uppercase">{bpName}</p>
            <p className="text-xs text-white/70">Current Breakpoint</p>
          </div>
          <div>
            <p className="text-2xl font-bold capitalize">{orientation}</p>
            <p className="text-xs text-white/70">Orientation</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{viewport.pixelRatio}x</p>
            <p className="text-xs text-white/70">Pixel Ratio</p>
          </div>
        </div>
      </div>

      {/* Breakpoint Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-navy-200 dark:border-navy-700 rounded">
          <thead>
            <tr className="bg-navy-50 dark:bg-navy-900/40">
              <th className="text-left p-2 text-navy-700 dark:text-navy-300 font-semibold">Breakpoint</th>
              <th className="text-left p-2 text-navy-700 dark:text-navy-300 font-semibold">Min Width</th>
              <th className="text-left p-2 text-navy-700 dark:text-navy-300 font-semibold">Active</th>
              <th className="text-left p-2 text-navy-700 dark:text-navy-300 font-semibold">isAbove</th>
            </tr>
          </thead>
          <tbody>
            {BREAKPOINT_ORDER.map((bp) => {
              const minWidth = DEFAULT_BREAKPOINTS[bp as keyof typeof DEFAULT_BREAKPOINTS];
              const isActive = breakpoint === bp;
              const above = isAbove(bp);
              return (
                <tr key={bp} className={`border-t border-navy-100 dark:border-navy-800 ${isActive ? 'bg-navy-100/50 dark:bg-navy-800/50' : ''}`}>
                  <td className="p-2 font-mono font-semibold text-navy-600 dark:text-navy-400">{bp}</td>
                  <td className="p-2 font-mono">{minWidth}px</td>
                  <td className="p-2">
                    {isActive ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground/30" />
                    )}
                  </td>
                  <td className="p-2">
                    {above ? (
                      <Badge variant="success" className="text-[9px] py-0 px-1">Yes</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] py-0 px-1">No</Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Device type indicators */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={isMobileHook ? 'destructive' : 'outline'} className="text-xs">
          {isMobileHook ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
          Mobile (&lt;768px)
        </Badge>
        <Badge variant={isTabletHook ? 'warning' : 'outline'} className="text-xs">
          Tablet (768-991px)
        </Badge>
        <Badge variant={isDesktopHook ? 'success' : 'outline'} className="text-xs">
          Desktop (≥992px)
        </Badge>
        <Badge variant={isLargeDesktop ? 'info' : 'outline'} className="text-xs">
          Large (≥1200px)
        </Badge>
      </div>

      {/* Preferences */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="outline" className="font-mono">
          prefersDark: {String(prefersDarkColorScheme())}
        </Badge>
        <Badge variant="outline" className="font-mono">
          prefersReducedMotion: {String(prefersReducedMotion())}
        </Badge>
        <Badge variant="outline" className="font-mono">
          1em = {emToPx(1)}px
        </Badge>
        <Badge variant="outline" className="font-mono">
          768px = {pxToEm(768)}em
        </Badge>
      </div>
    </div>
  );
}

// ============================================================================
// Section 6: Feature Detection (ims-modernizr)
// ============================================================================

function FeatureDetectionDemo() {
  const { features } = useFeatureDetection();
  const isTouch = useTouchSupport();
  const isWebGL = useWebGLSupport();
  const isOnline = useOnlineStatus();

  const cssFeatureList = [
    { key: 'flexbox', label: 'Flexbox' },
    { key: 'cssGrid', label: 'CSS Grid' },
    { key: 'cssTransforms', label: 'CSS Transforms' },
    { key: 'cssTransforms3d', label: '3D Transforms' },
    { key: 'cssTransitions', label: 'CSS Transitions' },
    { key: 'cssAnimations', label: 'CSS Animations' },
    { key: 'cssGradients', label: 'CSS Gradients' },
    { key: 'cssColumns', label: 'CSS Columns' },
    { key: 'borderRadius', label: 'Border Radius' },
    { key: 'boxShadow', label: 'Box Shadow' },
    { key: 'opacity', label: 'Opacity' },
    { key: 'rgba', label: 'RGBA Colors' },
    { key: 'fontFace', label: '@font-face' },
    { key: 'backgroundSize', label: 'Background Size' },
  ] as const;

  const html5FeatureList = [
    { key: 'canvas', label: 'Canvas' },
    { key: 'webgl', label: 'WebGL' },
    { key: 'touch', label: 'Touch' },
    { key: 'geolocation', label: 'Geolocation' },
    { key: 'localStorage', label: 'localStorage' },
    { key: 'indexedDB', label: 'IndexedDB' },
    { key: 'webWorkers', label: 'Web Workers' },
    { key: 'webSockets', label: 'WebSockets' },
    { key: 'history', label: 'History API' },
    { key: 'dragAndDrop', label: 'Drag & Drop' },
    { key: 'postMessage', label: 'postMessage' },
  ] as const;

  const FeatureIcon = ({ supported }: { supported: boolean }) =>
    supported ? (
      <Check className="h-3.5 w-3.5 text-emerald-500" />
    ) : (
      <X className="h-3.5 w-3.5 text-red-400" />
    );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces Modernizr v2.6.2 feature detection. CSS classes on <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">&lt;html&gt;</code> element
        are generated by <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">generateFeatureClasses()</code>.
      </p>

      {/* Quick indicators */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={isTouch ? 'warning' : 'outline'} className="text-xs">
          Touch: {String(isTouch)}
        </Badge>
        <Badge variant={isWebGL ? 'success' : 'destructive'} className="text-xs">
          WebGL: {String(isWebGL)}
        </Badge>
        <Badge variant={isOnline ? 'success' : 'destructive'} className="text-xs">
          {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CSS Features */}
        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">CSS Features</p>
          <div className="grid grid-cols-2 gap-1">
            {cssFeatureList.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <FeatureIcon supported={!!(features.css as Record<string, boolean>)[key]} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HTML5 Features */}
        <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
          <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">HTML5 / API Features</p>
          <div className="grid grid-cols-2 gap-1">
            {html5FeatureList.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <FeatureIcon supported={!!(features.html5 as Record<string, boolean>)[key]} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generated CSS classes */}
      <div className="p-3 rounded-lg bg-navy-50/50 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800">
        <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-1">generateFeatureClasses() output:</p>
        <p className="text-[10px] font-mono text-navy-500 dark:text-navy-400 break-all leading-relaxed">
          {generateFeatureClasses(features)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Section 7: Sidebar Layout with Collapse/Expand + localStorage
// ============================================================================

function SidebarDemo() {
  const { isCollapsed, toggleCollapsed } = useSidebarState({ defaultCollapsed: false });

  const menuItems: SidebarMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      isActive: true,
      href: '#',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      href: '#',
      badge: 12,
      children: [
        { id: 'product-list', label: 'All Products', href: '#' },
        { id: 'product-add', label: 'Add New', href: '#' },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      href: '#',
    },
    {
      id: 'shipping',
      label: 'Shipping',
      icon: Truck,
      href: '#',
      badge: 3,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '#',
      children: [
        { id: 'report-sales', label: 'Sales Report', href: '#' },
        { id: 'report-inventory', label: 'Inventory Report', href: '#' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '#',
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces the original sidebar CSS (File 31) with IMSSidebarPanel component.
        Collapse/expand state is managed by <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">useSidebarState</code> hook.
        Deep Navy Blue replaces the original green (#41b53f).
      </p>

      {/* Sidebar Preview */}
      <div className="flex gap-4 items-start">
        <div className="border-2 border-navy-200 dark:border-navy-700 rounded-lg overflow-hidden h-[300px]">
          <IMSSidebarPanel
            collapsed={isCollapsed}
            onToggleCollapse={toggleCollapsed}
            menuItems={menuItems}
            header={DEFAULT_SIDEBAR_HEADER}
            theme={NAVY_SIDEBAR_THEME}
          />
        </div>

        <div className="flex-1 space-y-3">
          <Button
            onClick={toggleCollapsed}
            className="bg-navy-600 hover:bg-navy-700 text-white"
          >
            {isCollapsed ? (
              <><PanelLeftOpen className="h-4 w-4 mr-2" /> Expand Sidebar</>
            ) : (
              <><PanelLeftClose className="h-4 w-4 mr-2" /> Collapse Sidebar</>
            )}
          </Button>

          <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800 space-y-1 text-xs">
            <p><strong className="text-navy-700 dark:text-navy-300">State:</strong> {isCollapsed ? 'Collapsed (80px)' : 'Expanded (250px)'}</p>
            <p><strong className="text-navy-700 dark:text-navy-300">Theme:</strong> NAVY_SIDEBAR_THEME</p>
            <p><strong className="text-navy-700 dark:text-navy-300">Header:</strong> {DEFAULT_SIDEBAR_HEADER.title} / {DEFAULT_SIDEBAR_HEADER.shortTitle}</p>
            <p><strong className="text-navy-700 dark:text-navy-300">Items:</strong> {menuItems.length} top-level</p>
          </div>

          <div className="text-[11px] text-muted-foreground p-2 rounded border border-dashed border-navy-300 dark:border-navy-700">
            <strong>Color mapping:</strong> #41b53f (green) → #1a2744 (navy-700), #18bc9c (accent) preserved
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section 8: Sidebar Nav with localStorage Persistence
// ============================================================================

function SidebarNavDemo() {
  return (
    <SidebarNavProvider>
      <SidebarNavDemoInner />
    </SidebarNavProvider>
  );
}

function SidebarNavDemoInner() {
  const nav = useSidebarNavContextSafe();
  const [activeId, setActiveId] = React.useState<string>('dashboard');
  const [localStorageInfo, setLocalStorageInfo] = React.useState<Record<string, string>>({});

  const updateStorageInfo = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    setLocalStorageInfo({
      'sidebar state': localStorage.getItem('ims-sidebar-state') || '(not set)',
      'active nav': localStorage.getItem('ims-colorsidebar') || '(not set)',
      'open submenu': localStorage.getItem('ims-sidebar') || '(not set)',
    });
  }, []);

  React.useEffect(() => { updateStorageInfo(); }, [updateStorageInfo, activeId]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, hasSubmenu: true },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'shipping', label: 'Shipping', icon: Truck, hasSubmenu: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Replaces File 32 jQuery script: <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">openNav(id)</code>,{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">ColorNav(id)</code>,{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">localStorage.setItem(&quot;sidebar&quot;, id)</code> patterns.
        State is auto-persisted to localStorage.
      </p>

      {/* Interactive nav items */}
      <div className="p-3 rounded-lg bg-navy-800 text-white space-y-1 max-w-xs">
        {navItems.map(item => (
          <SidebarNavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            hasSubmenu={item.hasSubmenu}
          />
        ))}
        <div className="pt-2 border-t border-white/20">
          <SidebarCollapseButton />
        </div>
      </div>

      {/* Active item display */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-navy-700 dark:text-navy-300 font-medium">Active Item:</span>
        <Badge variant="info">{nav?.state.activeNavItemId || 'none'}</Badge>
        <span className="text-sm text-navy-700 dark:text-navy-300 font-medium">Collapsed:</span>
        <Badge variant={nav?.state.isCollapsed ? 'warning' : 'success'}>
          {String(nav?.state.isCollapsed ?? false)}
        </Badge>
      </div>

      {/* localStorage display */}
      <div className="p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800">
        <p className="text-xs font-semibold text-navy-700 dark:text-navy-300 mb-2">localStorage Persistence</p>
        <div className="space-y-1">
          {Object.entries(localStorageInfo).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <code className="text-navy-600 dark:text-navy-400 font-mono min-w-[120px]">{key}:</code>
              <span className="font-mono text-muted-foreground truncate">{value}</span>
            </div>
          ))}
        </div>
        <Button size="xs" variant="outline" className="mt-2" onClick={updateStorageInfo}>
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Showcase Component
// ============================================================================

export function UtilityShowcase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-100">
          Utility Modules &amp; Responsive/Sidebar Systems
        </h2>
        <p className="text-muted-foreground mt-1">
          Demonstrates ims-init, ims-respond, ims-modernizr, ims-sidebar, and ims-sidebar-nav modules with Deep Navy Blue theme
        </p>
      </div>

      {/* Section 1: Number Utilities */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-init/number-utils</span>
            Number Utilities
          </CardTitle>
          <CardDescription>
            getDefaultFloatIfEmpty, formatCurrency, parseNumber, safeDivide, calculatePercentage, roundTo, clamp, sum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NumberUtilitiesDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 2: Status Labels */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <Tag className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-init/label-utils</span>
            Status Label Mapping
          </CardTitle>
          <CardDescription>
            20+ ERP status labels mapped from Bootstrap label-* classes to Badge variants. Replaces jQuery addClass patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusLabelDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 3: Table Utilities */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-init/table-utils</span>
            Table Utilities
          </CardTitle>
          <CardDescription>
            imsSorter, ascendingSorter, getDefaultQueryParams, buildQueryString, getDefaultActionButtons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableUtilitiesDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 4: Route Styling */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-init/route-styling</span>
            Route Styling System
          </CardTitle>
          <CardDescription>
            resolveRouteStyles, getBodyClasses, getNavbarClasses, getFooterClasses, ORDER_FORM_ROUTES
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RouteStylingDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 5: Responsive Breakpoints */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-respond</span>
            Responsive Breakpoints
          </CardTitle>
          <CardDescription>
            useViewport, useBreakpoint, useIsMobile, useIsTablet, useIsDesktop, useMatchMedia — Replaces Respond.js v1.2.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 6: Feature Detection */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-modernizr</span>
            Feature Detection
          </CardTitle>
          <CardDescription>
            useFeatureDetection, useCSSFeature, useTouchSupport, useWebGLSupport, useOnlineStatus — Replaces Modernizr v2.6.2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureDetectionDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 7: Sidebar Layout */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <PanelLeftClose className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-sidebar</span>
            Sidebar Layout
          </CardTitle>
          <CardDescription>
            IMSSidebarPanel, useSidebarState, IMSSidebarLayout — Replaces File 31 sidebar CSS with Deep Navy Blue theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SidebarDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 8: Sidebar Nav Persistence */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-navy-500" />
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-sidebar-nav</span>
            Sidebar Nav Persistence
          </CardTitle>
          <CardDescription>
            SidebarNavProvider, SidebarNavItem, SidebarCollapseButton — Replaces File 32 jQuery script with localStorage auto-persistence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SidebarNavDemo />
        </CardContent>
      </Card>
    </div>
  );
}

export default UtilityShowcase;
