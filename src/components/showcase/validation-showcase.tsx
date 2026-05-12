'use client';

/**
 * Validation Showcase Component
 *
 * Demonstrates the IMS Validation library (/src/lib/ims-validation/) and
 * AJAX Form system (/src/components/ui/ims-ajax-form.tsx), replacing the
 * original jQuery Validation Plugin 1.11.1 and Microsoft jQuery Unobtrusive
 * Validation/Ajax with Deep Navy Blue themed React equivalents.
 *
 * Sections:
 * 1. Product Entry Form with ImsValidationProvider (required, email, min/max, range)
 * 2. Remote Validation (simulated)
 * 3. Unobtrusive Validation with data-val-* attributes
 * 4. AJAX Form submission with ImsAjaxForm
 * 5. Validation Summary display
 * 6. Standalone validator with useImsValidator hook
 */

import * as React from 'react';
import {
  ImsValidationProvider,
  ImsFormField,
  ImsValidationSummary,
  ImsRequiredIndicator,
  useImsValidation,
} from '@/lib/ims-validation';
import { useImsValidator } from '@/lib/ims-validation';
import type { FieldRules } from '@/lib/ims-validation';
import { ImsAjaxForm, ImsAjaxLoading, ImsAjaxConfirmDialog, useConfirmDialog } from '@/components/ui/ims-ajax-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Send, Save, RotateCcw } from 'lucide-react';

// ============================================================================
// Section 1: Product Entry Form (inside ImsValidationProvider)
// ============================================================================

const PRODUCT_RULES: FieldRules = {
  productName: { required: true, minlength: 3, maxlength: 100 },
  sku: { required: true, minlength: 5, maxlength: 20 },
  email: { required: true, email: true },
  price: { required: true, number: true, min: 0.01, max: 999999.99 },
  quantity: { required: true, digits: true, min: 0, max: 100000 },
  description: { maxlength: 500 },
  category: { required: true },
};

function ProductEntryForm() {
  const {
    formState,
    errorMap,
    errorList,
    validate,
    resetForm,
    handleSubmit,
    isValid,
    numberOfInvalids,
    setFieldValue,
    touchField,
    validateField,
  } = useImsValidation();

  const [formData, setFormData] = React.useState({
    productName: '',
    sku: '',
    email: '',
    price: '',
    quantity: '',
    description: '',
    category: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldValue(field, value);
  };

  const handleBlur = (field: string) => {
    touchField(field);
    validateField(field);
  };

  const onSubmit = async () => {
    const valid = validate();
    if (valid) {
      // Simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 800));
      alert('Product saved successfully! (simulated)');
    }
  };

  const getFieldState = (field: string) => {
    const state = formState.fieldStates[field];
    const hasError = !!errorMap[field];
    const touched = state?.isTouched ?? false;
    return {
      hasError: touched && hasError,
      isValid: touched && !hasError && (state?.isDirty ?? false),
      errorMessage: touched && hasError ? errorMap[field] : undefined,
    };
  };

  const fieldClass = (field: string) => {
    const { hasError, isValid } = getFieldState(field);
    if (hasError) return 'border-red-400 focus-visible:ring-red-400/30';
    if (isValid) return 'border-emerald-500 focus-visible:ring-emerald-500/30';
    return '';
  };

  return (
    <div className="space-y-4">
      {/* Validation Summary */}
      {numberOfInvalids > 0 && formState.submitCount > 0 && (
        <div className="border border-red-400/30 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Please fix {numberOfInvalids} error{numberOfInvalids > 1 ? 's' : ''} below:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {errorList.map((err, i) => (
              <li key={i} className="text-sm text-red-500">
                <span className="font-medium capitalize">{err.fieldName}</span>: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Product Name <ImsRequiredIndicator />
          </Label>
          <Input
            placeholder="Enter product name"
            className={fieldClass('productName')}
            value={formData.productName}
            onChange={e => handleChange('productName', e.target.value)}
            onBlur={() => handleBlur('productName')}
          />
          {getFieldState('productName').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('productName').errorMessage}
            </p>
          )}
          {getFieldState('productName').isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Valid
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            SKU <ImsRequiredIndicator />
          </Label>
          <Input
            placeholder="e.g., SKU-12345"
            className={fieldClass('sku')}
            value={formData.sku}
            onChange={e => handleChange('sku', e.target.value)}
            onBlur={() => handleBlur('sku')}
          />
          {getFieldState('sku').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('sku').errorMessage}
            </p>
          )}
          {getFieldState('sku').isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Valid
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Supplier Email <ImsRequiredIndicator />
          </Label>
          <Input
            type="email"
            placeholder="supplier@example.com"
            className={fieldClass('email')}
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />
          {getFieldState('email').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('email').errorMessage}
            </p>
          )}
          {getFieldState('email').isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Valid
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Category <ImsRequiredIndicator />
          </Label>
          <Input
            placeholder="e.g., Electronics"
            className={fieldClass('category')}
            value={formData.category}
            onChange={e => handleChange('category', e.target.value)}
            onBlur={() => handleBlur('category')}
          />
          {getFieldState('category').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('category').errorMessage}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Price (USD) <ImsRequiredIndicator />
          </Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.01 - 999,999.99"
            className={fieldClass('price')}
            value={formData.price}
            onChange={e => handleChange('price', e.target.value)}
            onBlur={() => handleBlur('price')}
          />
          {getFieldState('price').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('price').errorMessage}
            </p>
          )}
          {getFieldState('price').isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Valid
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Quantity <ImsRequiredIndicator />
          </Label>
          <Input
            type="number"
            placeholder="0 - 100,000"
            className={fieldClass('quantity')}
            value={formData.quantity}
            onChange={e => handleChange('quantity', e.target.value)}
            onBlur={() => handleBlur('quantity')}
          />
          {getFieldState('quantity').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('quantity').errorMessage}
            </p>
          )}
          {getFieldState('quantity').isValid && (
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Valid
            </p>
          )}
        </div>

        {/* Description (full width) */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
            Description
          </Label>
          <Textarea
            placeholder="Product description (max 500 chars)"
            className={fieldClass('description')}
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            rows={3}
          />
          {getFieldState('description').hasError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {getFieldState('description').errorMessage}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{formData.description.length}/500 characters</p>
        </div>
      </div>

      {/* Form Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-navy-50 dark:bg-navy-900/30 border border-navy-200 dark:border-navy-700">
        {isValid ? (
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
        )}
        <div className="text-sm">
          <span className="font-medium text-navy-700 dark:text-navy-300">
            Form Status:
          </span>{' '}
          {isValid ? (
            <span className="text-emerald-600 dark:text-emerald-400">All fields valid</span>
          ) : (
            <span className="text-red-500">{numberOfInvalids} field{numberOfInvalids !== 1 ? 's' : ''} with errors</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onSubmit}
          className="bg-navy-600 hover:bg-navy-700 text-white"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Product
        </Button>
        <Button variant="outline" onClick={() => { resetForm(); setFormData({ productName: '', sku: '', email: '', price: '', quantity: '', description: '', category: '' }); }}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Section 2: Remote Validation Demo (simulated)
// ============================================================================

function RemoteValidationDemo() {
  const [skuValue, setSkuValue] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [result, setResult] = React.useState<'available' | 'taken' | null>(null);

  const checkSku = React.useCallback(async (sku: string) => {
    if (sku.length < 3) {
      setResult(null);
      return;
    }
    setChecking(true);
    setResult(null);

    // Simulate remote API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    const takenSkus = ['SKU-001', 'SKU-002', 'SKU-999', 'ABC-123'];
    if (takenSkus.includes(sku.toUpperCase())) {
      setResult('taken');
    } else {
      setResult('available');
    }
    setChecking(false);
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">
          Check SKU Availability (Simulated Remote Validation)
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="Try SKU-001 (taken) or SKU-NEW (available)"
            value={skuValue}
            onChange={e => {
              setSkuValue(e.target.value);
              setResult(null);
            }}
            className={
              result === 'taken'
                ? 'border-red-400'
                : result === 'available'
                ? 'border-emerald-500'
                : ''
            }
          />
          <Button
            onClick={() => checkSku(skuValue)}
            disabled={checking || skuValue.length < 3}
            variant="outline"
            className="border-navy-300 dark:border-navy-600"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
          </Button>
        </div>
        {checking && (
          <p className="text-xs text-navy-500 dark:text-navy-400 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
          </p>
        )}
        {result === 'available' && (
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> SKU is available!
          </p>
        )}
        {result === 'taken' && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> This SKU is already taken. Please choose another.
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground p-3 rounded-lg bg-navy-50/50 dark:bg-navy-900/20 border border-navy-100 dark:border-navy-800">
        <strong className="text-navy-600 dark:text-navy-400">How it works:</strong> In production, use the{' '}
        <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">remote</code> validator rule with a URL endpoint.
        The <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">validateRemote()</code> function sends an AJAX
        request and uses <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded">AbortController</code> for
        cancellation on subsequent keystrokes.
      </div>
    </div>
  );
}

// ============================================================================
// Section 3: Unobtrusive Validation Demo (data-val-* attributes)
// ============================================================================

function UnobtrusiveValidationDemo() {
  const [values, setValues] = React.useState({ username: '', age: '', website: '' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'username':
        if (!value.trim()) error = 'Username is required (data-val-required)';
        else if (value.length < 3) error = 'Username must be at least 3 characters (data-val-minlength)';
        break;
      case 'age':
        if (!value.trim()) error = 'Age is required (data-val-required)';
        else if (!/^\d+$/.test(value)) error = 'Age must be a number (data-val-number)';
        else if (parseInt(value) < 18) error = 'Must be at least 18 (data-val-min)';
        else if (parseInt(value) > 120) error = 'Must be at most 120 (data-val-max)';
        break;
      case 'website':
        if (value && !/^https?:\/\/.+/.test(value)) error = 'Enter a valid URL (data-val-url)';
        break;
    }
    return error;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field as keyof typeof values]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Demonstrates unobtrusive validation using <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">data-val-*</code> attribute patterns.
        These are parsed by <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">parseElement()</code> / <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">parseForm()</code>.
      </p>

      <div className="space-y-3">
        {/* Username with data-val-* display */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">Username</Label>
          <Input
            placeholder="Enter username"
            data-val="true"
            data-val-required="Username is required"
            data-val-minlength="3"
            data-val-minlength-msg="Username must be at least 3 characters"
            className={touched.username && errors.username ? 'border-red-400' : touched.username && !errors.username ? 'border-emerald-500' : ''}
            value={values.username}
            onChange={e => handleChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
          />
          {touched.username && errors.username && (
            <p className="text-xs text-red-400" data-valmsg-for="username">{errors.username}</p>
          )}
          {!touched.username && (
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val=&quot;true&quot;</Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-required</Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-minlength=&quot;3&quot;</Badge>
            </div>
          )}
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">Age</Label>
          <Input
            type="number"
            placeholder="18 - 120"
            data-val="true"
            data-val-required="Age is required"
            data-val-number="Must be a number"
            data-val-min="18"
            data-val-max="120"
            className={touched.age && errors.age ? 'border-red-400' : touched.age && !errors.age ? 'border-emerald-500' : ''}
            value={values.age}
            onChange={e => handleChange('age', e.target.value)}
            onBlur={() => handleBlur('age')}
          />
          {touched.age && errors.age && (
            <p className="text-xs text-red-400" data-valmsg-for="age">{errors.age}</p>
          )}
          {!touched.age && (
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-number</Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-min=&quot;18&quot;</Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-max=&quot;120&quot;</Badge>
            </div>
          )}
        </div>

        {/* Website */}
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">Website (optional)</Label>
          <Input
            type="url"
            placeholder="https://example.com"
            data-val-url="Enter a valid URL"
            className={touched.website && errors.website ? 'border-red-400' : touched.website && !errors.website && values.website ? 'border-emerald-500' : ''}
            value={values.website}
            onChange={e => handleChange('website', e.target.value)}
            onBlur={() => handleBlur('website')}
          />
          {touched.website && errors.website && (
            <p className="text-xs text-red-400" data-valmsg-for="website">{errors.website}</p>
          )}
          {!touched.website && (
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">data-val-url</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Section 4: AJAX Form Demo
// ============================================================================

function AjaxFormDemo() {
  const [ajaxResult, setAjaxResult] = React.useState<string>('');
  const [ajaxLoading, setAjaxLoading] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmMessage, setConfirmMessage] = React.useState('');
  const confirmResolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const handleAjaxSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAjaxLoading(true);
    setAjaxResult('');

    // Simulate AJAX request
    await new Promise(resolve => setTimeout(resolve, 1500));

    const success = Math.random() > 0.3;
    if (success) {
      setAjaxResult('success');
    } else {
      setAjaxResult('error');
    }
    setAjaxLoading(false);
  }, []);

  const handleDeleteWithConfirm = React.useCallback(() => {
    setConfirmMessage('Are you sure you want to delete this product? This action cannot be undone.');
    setConfirmOpen(true);
  }, []);

  const handleConfirm = React.useCallback(() => {
    setConfirmOpen(false);
    confirmResolveRef.current?.(true);
    confirmResolveRef.current = null;
    // Simulate delete
    setAjaxResult('deleted');
  }, []);

  const handleCancel = React.useCallback(() => {
    setConfirmOpen(false);
    confirmResolveRef.current?.(false);
    confirmResolveRef.current = null;
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        AJAX Form replaces <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">{'<form data-ajax="true">'}</code> with
        React component + <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">useAjaxForm</code> hook.
      </p>

      {/* AJAX Form */}
      <form onSubmit={handleAjaxSubmit} className="space-y-3 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-navy-700 dark:text-navy-300 text-sm">Item Name</Label>
            <Input placeholder="Enter item name" required className="border-navy-200 dark:border-navy-700" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-navy-700 dark:text-navy-300 text-sm">Quantity</Label>
            <Input type="number" placeholder="0" required className="border-navy-200 dark:border-navy-700" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-navy-600 hover:bg-navy-700 text-white" disabled={ajaxLoading}>
            {ajaxLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit via AJAX
          </Button>
          <Button type="button" variant="destructive" onClick={handleDeleteWithConfirm}>
            Delete with Confirm
          </Button>
        </div>

        {ajaxLoading && (
          <ImsAjaxLoading visible={ajaxLoading} text="Submitting..." size="sm" />
        )}
      </form>

      {/* Result Display */}
      {ajaxResult === 'success' && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> AJAX request completed successfully (onSuccess callback fired)
          </p>
        </div>
      )}
      {ajaxResult === 'error' && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-500 flex items-center gap-2">
            <XCircle className="h-4 w-4" /> AJAX request failed (onFailure callback fired)
          </p>
        </div>
      )}
      {ajaxResult === 'deleted' && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Item deleted after user confirmation (confirmHandler → ImsAjaxConfirmDialog)
          </p>
        </div>
      )}

      {/* Confirm Dialog */}
      <ImsAjaxConfirmDialog
        open={confirmOpen}
        message={confirmMessage}
        title="Confirm Deletion"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

// ============================================================================
// Section 5: useImsValidator Standalone Demo
// ============================================================================

function StandaloneValidatorDemo() {
  const {
    formState,
    errorMap,
    validate,
    resetForm,
    isValid,
    numberOfInvalids,
    registerField,
    setFieldValue,
    touchField,
    validateField,
  } = useImsValidator({
    rules: {
      orderId: { required: true, minlength: 3 },
      amount: { required: true, number: true, min: 1 },
    },
    messages: {
      orderId: { required: 'Order ID is required', minlength: 'Order ID must be at least 3 characters' },
      amount: { required: 'Amount is required', number: 'Must be a valid number', min: 'Amount must be at least 1' },
    },
  });

  const [values, setValues] = React.useState({ orderId: '', amount: '' });

  React.useEffect(() => {
    registerField('orderId');
    registerField('amount');
  }, [registerField]);

  const handleChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setFieldValue(field, value);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Using <code className="bg-navy-100 dark:bg-navy-800 px-1 rounded text-navy-700 dark:text-navy-300">useImsValidator</code> hook
        directly (no ImsValidationProvider needed).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">Order ID</Label>
          <Input
            placeholder="ORD-001"
            value={values.orderId}
            onChange={e => handleChange('orderId', e.target.value)}
            onBlur={() => { touchField('orderId'); validateField('orderId'); }}
            className={errorMap.orderId ? 'border-red-400' : ''}
          />
          {errorMap.orderId && <p className="text-xs text-red-400">{errorMap.orderId}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-navy-700 dark:text-navy-300 text-sm font-medium">Amount</Label>
          <Input
            type="number"
            placeholder="Min: 1"
            value={values.amount}
            onChange={e => handleChange('amount', e.target.value)}
            onBlur={() => { touchField('amount'); validateField('amount'); }}
            className={errorMap.amount ? 'border-red-400' : ''}
          />
          {errorMap.amount && <p className="text-xs text-red-400">{errorMap.amount}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => validate()} size="sm" className="bg-navy-600 hover:bg-navy-700 text-white">
          Validate All
        </Button>
        <Button variant="outline" size="sm" onClick={() => { resetForm(); setValues({ orderId: '', amount: '' }); }}>
          Reset
        </Button>
        <Badge variant={isValid ? 'success' : 'destructive'}>
          {isValid ? 'Valid' : `${numberOfInvalids} Error${numberOfInvalids !== 1 ? 's' : ''}`}
        </Badge>
      </div>
    </div>
  );
}

// ============================================================================
// Main Showcase Component
// ============================================================================

export function ValidationShowcase() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-navy-800 dark:text-navy-100">
          Form Validation &amp; AJAX Forms
        </h2>
        <p className="text-muted-foreground mt-1">
          Replaces jQuery Validation 1.11.1 + Microsoft Unobtrusive Validation/Ajax with React hooks and Deep Navy Blue theme
        </p>
      </div>

      {/* Section 1: Product Entry Form with ImsValidationProvider */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-validation</span>
            Product Entry Form
          </CardTitle>
          <CardDescription>
            Full form with required, email, min/max length, number range validation using ImsValidationProvider + ImsFormField.
            Replaces <code>$(&apos;form&apos;).validate(&#123;rules: &#123;...&#125;&#125;)</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImsValidationProvider rules={PRODUCT_RULES} mode="onBlur">
            <ProductEntryForm />
          </ImsValidationProvider>
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 2: Remote Validation */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">remote-validator</span>
            Remote Validation
          </CardTitle>
          <CardDescription>
            Simulated async validation (e.g., checking SKU uniqueness). Replaces <code>remote: &quot;/api/check-sku&quot;</code> rule with AbortController-based cancellation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RemoteValidationDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 3: Unobtrusive Validation */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">unobtrusive</span>
            Unobtrusive Validation (data-val-*)
          </CardTitle>
          <CardDescription>
            Replaces <code>data-val=&quot;true&quot;</code> attributes parsed by jQuery Unobtrusive Validation adapter system.
            Fields show their data-val-* attributes before interaction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnobtrusiveValidationDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 4: AJAX Form */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">ims-ajax-form</span>
            AJAX Form Submission
          </CardTitle>
          <CardDescription>
            Replaces <code>{'<form data-ajax="true">'}</code> with ImsAjaxForm + ImsAjaxConfirmDialog.
            Supports loading indicators, confirm dialogs, success/error callbacks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AjaxFormDemo />
        </CardContent>
      </Card>

      <Separator className="bg-navy-200 dark:bg-navy-700" />

      {/* Section 5: Standalone useImsValidator */}
      <Card className="border-navy-200 dark:border-navy-700">
        <CardHeader>
          <CardTitle className="text-navy-700 dark:text-navy-200 flex items-center gap-2">
            <span className="bg-navy-600 text-white text-xs px-2 py-0.5 rounded">useImsValidator</span>
            Standalone Validator Hook
          </CardTitle>
          <CardDescription>
            Direct hook usage without ImsValidationProvider. Replaces <code>$(&apos;form&apos;).validate(options)</code> with full TypeScript API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StandaloneValidatorDemo />
        </CardContent>
      </Card>
    </div>
  );
}

export default ValidationShowcase;
