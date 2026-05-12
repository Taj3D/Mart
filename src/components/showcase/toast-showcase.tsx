'use client';

import React, { useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { imsToast } from '@/components/toast/ims-toast';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ShieldAlert,
  Bell,
  Zap,
  Save,
  Trash2,
  FileDown,
} from 'lucide-react';

// ============================================================================
// Main Toast Showcase Component
// ============================================================================

export default function ToastShowcase() {
  return (
    <div className="space-y-8">
      {/* ================================================================== */}
      {/* Section: Header                                                      */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-700 dark:text-navy-200">
            <Bell className="size-5" />
            IMS Toast Notification Showcase
          </CardTitle>
          <CardDescription>
            Replaces: Toastr CSS — Deep Navy Blue themed notification system powered by Sonner with imsToast API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-navy-50 dark:bg-navy-900/30 rounded-md font-mono">
              imsToast.info()
            </span>
            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md font-mono">
              imsToast.success()
            </span>
            <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-md font-mono">
              imsToast.warning()
            </span>
            <span className="px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded-md font-mono">
              imsToast.error()
            </span>
            <span className="px-2 py-1 bg-navy-50 dark:bg-navy-900/30 rounded-md font-mono">
              imsToast.promise()
            </span>
            <span className="px-2 py-1 bg-navy-50 dark:bg-navy-900/30 rounded-md font-mono">
              imsToast.loading()
            </span>
            <span className="px-2 py-1 bg-navy-50 dark:bg-navy-900/30 rounded-md font-mono">
              imsToast.confirm()
            </span>
            <span className="px-2 py-1 bg-navy-50 dark:bg-navy-900/30 rounded-md font-mono">
              imsToast.dismiss()
            </span>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 1: Basic Toast Types                                         */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            Basic Toast Types
          </CardTitle>
          <CardDescription>
            Replaces: toastr.info(), toastr.success(), toastr.warning(), toastr.error() — Each type uses Deep Navy Blue themed colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Info Toast */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-900/30"
              onClick={() => {
                imsToast.info('System Update Available', {
                  description: 'A new version of IMS ERP (v3.2.1) is available. Contact your administrator to schedule the update.',
                });
              }}
            >
              <Info className="size-6 text-navy-600 dark:text-navy-300" />
              <span className="text-sm font-medium">Info</span>
              <span className="text-[10px] text-muted-foreground">Navy Blue BG</span>
            </Button>

            {/* Success Toast */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              onClick={() => {
                imsToast.success('Record Saved', {
                  description: 'Invoice #INV-2024-0087 has been saved successfully.',
                });
              }}
            >
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium">Success</span>
              <span className="text-[10px] text-muted-foreground">Emerald Green BG</span>
            </Button>

            {/* Warning Toast */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30"
              onClick={() => {
                imsToast.warning('Low Stock Alert', {
                  description: 'Product SKU-4219 "Steel Bolts M10" has only 12 units remaining. Reorder point: 50 units.',
                });
              }}
            >
              <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">Warning</span>
              <span className="text-[10px] text-muted-foreground">Amber BG</span>
            </Button>

            {/* Error Toast */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => {
                imsToast.error('Operation Failed', {
                  description: 'Failed to process payment for Order #ORD-5532. Gateway returned error code E-4012.',
                  duration: 6000,
                });
              }}
            >
              <XCircle className="size-6 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">Error</span>
              <span className="text-[10px] text-muted-foreground">Red BG (6s)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 2: Toast with Actions                                        */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            Toast with Action Buttons
          </CardTitle>
          <CardDescription>
            Replaces: Toastr with custom buttons — Toast notifications with action/cancel buttons for ERP workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Info with Action */}
            <Button
              variant="info"
              className="gap-2"
              onClick={() => {
                imsToast.info('New Purchase Order', {
                  description: 'PO-2024-0145 requires your approval. Total: $24,500.00',
                  action: {
                    label: 'Review',
                    onClick: () => {
                      imsToast.success('Opening PO-2024-0145', {
                        description: 'Redirecting to purchase order details...',
                      });
                    },
                  },
                });
              }}
            >
              <Zap className="size-4" />
              Info with Action
            </Button>

            {/* Success with Undo */}
            <Button
              variant="success"
              className="gap-2"
              onClick={() => {
                imsToast.success('Product Deleted', {
                  description: 'SKU-7890 "Premium Widget" has been removed from inventory.',
                  action: {
                    label: 'Undo',
                    onClick: () => {
                      imsToast.info('Undo Successful', {
                        description: 'Product SKU-7890 has been restored.',
                      });
                    },
                  },
                  duration: 8000,
                });
              }}
            >
              <Trash2 className="size-4" />
              Success with Undo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 3: Promise Toast (Simulated API Call)                        */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            Promise Toast — Simulated API Call
          </CardTitle>
          <CardDescription>
            Replaces: Toastr with loading indicator — Shows loading → success/error flow for async ERP operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Simulate Success */}
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                const simulateSuccess = new Promise<{ id: string }>((resolve) => {
                  setTimeout(() => resolve({ id: 'ORD-90210' }), 2500);
                });

                imsToast.promise(simulateSuccess, {
                  loading: 'Creating sales order...',
                  success: (data) => `Order ${data.id} created successfully!`,
                  error: 'Failed to create order. Please try again.',
                });
              }}
            >
              <Save className="size-4" />
              Simulate Success (2.5s)
            </Button>

            {/* Simulate Error */}
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                const simulateError = new Promise<never>((_, reject) => {
                  setTimeout(() => reject(new Error('Network timeout')), 2000);
                });

                imsToast.promise(simulateError, {
                  loading: 'Exporting inventory report...',
                  success: 'Report exported successfully!',
                  error: (err) => `Export failed: ${err.message}`,
                });
              }}
            >
              <FileDown className="size-4" />
              Simulate Error (2s)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 4: Loading Toast                                             */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            Loading Toast — Persistent Indicator
          </CardTitle>
          <CardDescription>
            Replaces: Toastr with persistent spinner — Shows a loading indicator that stays until manually dismissed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Show Loading */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const id = imsToast.loading('Syncing inventory data...', {
                  description: 'Connecting to warehouse server...',
                });
                // Auto-dismiss after 4 seconds and show success
                setTimeout(() => {
                  imsToast.dismiss(id);
                  imsToast.success('Sync Complete', {
                    description: '1,247 inventory records updated.',
                  });
                }, 4000);
              }}
            >
              <Loader2 className="size-4 animate-spin" />
              Show Loading (auto-dismiss 4s)
            </Button>

            {/* Dismiss All */}
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => {
                imsToast.dismiss();
              }}
            >
              <XCircle className="size-4" />
              Dismiss All Toasts
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 5: Confirm Dialog Toast                                      */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            Confirm Dialog Toast
          </CardTitle>
          <CardDescription>
            Replaces: window.confirm() — Confirmation dialogs in toast form for ERP destructive or critical actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Confirm */}
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                imsToast.confirm('Approve this purchase order?', {
                  description: 'PO-2024-0145: 500 units of Steel Rods @ $49.00 = $24,500.00',
                  confirmText: 'Approve',
                  cancelText: 'Reject',
                  onConfirm: () => {
                    imsToast.success('Purchase Order Approved', {
                      description: 'PO-2024-0145 has been approved and sent to the vendor.',
                    });
                  },
                  onCancel: () => {
                    imsToast.warning('Purchase Order Rejected', {
                      description: 'PO-2024-0145 has been rejected.',
                    });
                  },
                });
              }}
            >
              <CheckCircle2 className="size-4" />
              Default Confirm
            </Button>

            {/* Destructive Confirm */}
            <Button
              variant="danger"
              className="gap-2"
              onClick={() => {
                imsToast.confirm('Delete this product permanently?', {
                  description: 'SKU-4219 "Steel Bolts M10" — This action cannot be undone. All inventory records will be removed.',
                  confirmText: 'Delete',
                  cancelText: 'Keep',
                  variant: 'destructive',
                  onConfirm: () => {
                    imsToast.success('Product Deleted', {
                      description: 'SKU-4219 has been permanently removed from the system.',
                    });
                  },
                  onCancel: () => {
                    imsToast.info('Deletion Cancelled', {
                      description: 'The product was not deleted.',
                    });
                  },
                });
              }}
            >
              <ShieldAlert className="size-4" />
              Destructive Confirm
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================================================================== */}
      {/* Section 6: ERP Workflow Scenarios                                    */}
      {/* ================================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200">
            ERP Workflow Scenarios
          </CardTitle>
          <CardDescription>
            Real-world IMS ERP notification patterns combining multiple toast types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scenario 1: Order Processing */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => {
                // Step 1: Show loading
                const loadId = imsToast.loading('Processing order...', {
                  description: 'Validating order #ORD-7742',
                });

                setTimeout(() => {
                  imsToast.dismiss(loadId);
                  // Step 2: Check stock
                  imsToast.warning('Partial Stock', {
                    description: 'Only 8 of 15 units available for SKU-3301. Proceeding with partial fulfillment.',
                    action: {
                      label: 'Adjust',
                      onClick: () => {
                        imsToast.success('Order Adjusted', {
                          description: 'Quantity reduced to 8 units. Order confirmed.',
                        });
                      },
                    },
                  });
                }, 1500);
              }}
            >
              <span className="text-sm font-medium">Order Processing</span>
              <span className="text-[10px] text-muted-foreground">Loading → Warning → Action</span>
            </Button>

            {/* Scenario 2: Batch Import */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => {
                const importPromise = new Promise<{ imported: number; errors: number }>((resolve) => {
                  setTimeout(() => resolve({ imported: 245, errors: 3 }), 3000);
                });

                imsToast.promise(importPromise, {
                  loading: 'Importing 248 products from CSV...',
                  success: (data) => `Import complete: ${data.imported} succeeded, ${data.errors} failed`,
                  error: 'Import failed. Check file format and try again.',
                });
              }}
            >
              <span className="text-sm font-medium">Batch Import</span>
              <span className="text-[10px] text-muted-foreground">Promise → Success</span>
            </Button>

            {/* Scenario 3: Multi-step Approval */}
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => {
                imsToast.confirm('Submit for manager approval?', {
                  description: 'Expense Report #EXP-2024-0034: $2,450.00 — Travel & accommodation claims',
                  confirmText: 'Submit',
                  cancelText: 'Draft',
                  onConfirm: () => {
                    const approvalPromise = new Promise<{ approved: boolean }>((resolve) => {
                      setTimeout(() => resolve({ approved: true }), 2000);
                    });

                    imsToast.promise(approvalPromise, {
                      loading: 'Sending for approval...',
                      success: 'Submitted! Waiting for manager review.',
                      error: 'Failed to submit. Network error.',
                    });
                  },
                  onCancel: () => {
                    imsToast.info('Saved as Draft', {
                      description: 'Expense report saved. You can submit it later.',
                    });
                  },
                });
              }}
            >
              <span className="text-sm font-medium">Multi-step Approval</span>
              <span className="text-[10px] text-muted-foreground">Confirm → Promise</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
