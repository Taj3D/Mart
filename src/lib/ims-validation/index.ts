/**
 * IMS Validation Module - Barrel Exports
 *
 * Comprehensive form validation library converted from jQuery Validation Plugin 1.11.1
 * and Microsoft jQuery Unobtrusive Validation to TypeScript/React for the IMS
 * (Inventory Management System).
 *
 * Provides type-safe, React-friendly validation with all the capabilities of the
 * original jQuery Validation + Unobtrusive Validation plugins, including:
 * - 16 built-in validation methods (required, email, url, etc.)
 * - Custom method registration (addMethod)
 * - Multi-source rule resolution (class, attribute, data, static)
 * - Async remote validation with AbortController
 * - Message formatting with parameter substitution
 * - Unobtrusive validation adapter system (addBool, addMinMax, addSingleVal)
 * - HTML data-val-* attribute parsing
 * - Additional validators (regex, nonalphamin, password complexity)
 * - React hooks (useImsValidator, useFieldValidator, useRemoteValidator, useUnobtrusiveValidation)
 * - React components (ImsValidationProvider, ImsFormField, ImsUnobtrusiveForm, ImsUnobtrusiveSummary)
 * - Deep Navy Blue themed error display
 *
 * @module ims-validation
 * @version 1.11.1-ims + unobtrusive 3.2.11-ims
 * @see https://jqueryvalidation.org/
 * @see https://github.com/aspnet/jquery-validate-unobtrusive
 */

// ============================================================================
// Constants & Version
// ============================================================================

export {
  DEPENDENCY_MISMATCH,
  PENDING,
  BUILTIN_METHOD_NAMES,
  IMS_VALIDATION_VERSION,
} from './types';

export type {
  ImsValidationMeta,
} from './types';

// ============================================================================
// Core Types
// ============================================================================

export type {
  RuleParameter,
  DependencyParam,
  ValidationRule,
  ValidationResult,
  NormalizedRules,
  FieldElement,
  ValidationMethod,
  ValidationMessages,
  FieldValidationState,
  FormValidationState,
  ValidatorSettings,
  ValidatorCallbacks,
  ErrorLabelElement,
  ValidatorInfo,
  FieldRules,
  ClassRuleSettings,
  ValidationGroup,
  RemoteValidationOptions,
  ValidateMode,
  InsertMode,
  ErrorListEntry,
  PendingRequest,
  BuiltinMethodName,
  BuiltinMessages,
  MethodRegistry,
  MessageRegistry,
  StaticRules,
  NormalizedFieldRules,
  ImsValidator,
} from './types';

// ============================================================================
// Built-in Validators & Messages
// ============================================================================

export {
  optional,
  required,
  email,
  url,
  date,
  dateISO,
  number,
  digits,
  creditcard,
  minlength,
  maxlength,
  rangelength,
  min,
  max,
  range,
  equalTo,
  remote,
  defaultMessages,
  builtinValidators,
} from './validators';

// ============================================================================
// Message Formatter
// ============================================================================

export {
  formatMessage,
  formatTemplate,
  resolveMessage,
  defaultMessage,
} from './message-formatter';

export type {
  MessageResolveOptions,
  FormatCurried,
} from './message-formatter';

// ============================================================================
// Validator Registry
// ============================================================================

export {
  ImsValidatorRegistry,
  globalRegistry,
  addMethod,
  addClassRules,
  getMethod,
  getMessage,
  getClassRules,
  normalizeRule,
  normalizeRules,
} from './validator-registry';

// ============================================================================
// Rule Resolver
// ============================================================================

export {
  classRules,
  attributeRules,
  dataRules,
  staticRules,
  resolveRules,
  rulesToList,
  getFieldNames,
} from './rule-resolver';

// ============================================================================
// Remote Validator
// ============================================================================

export {
  PendingRequestManager,
  validateRemote,
  useRemoteValidator,
  createRemoteValidator,
} from './remote-validator';

export type {
  RemoteValidationResult,
  RemoteValidatorCache,
  ValidateRemoteInput,
  RemoteValidatorOptions,
  RemoteValidatorInstance,
} from './remote-validator';

// ============================================================================
// React Hooks
// ============================================================================

export { useImsValidator } from './use-ims-validator';
export type {
  UseImsValidatorOptions,
  UseImsValidatorReturn,
} from './use-ims-validator';

export { useFieldValidator } from './use-field-validator';
export type {
  UseFieldValidatorOptions,
  UseFieldValidatorReturn,
} from './use-field-validator';

// ============================================================================
// React Components
// ============================================================================

export {
  ImsValidationContext,
  ImsValidationProvider,
  useImsValidation,
} from './ims-validation-provider';

export {
  ImsFormField,
  ImsValidationError,
  ImsValidationSummary,
  ImsRequiredIndicator,
} from './ims-form-field';

// ============================================================================
// Unobtrusive Validation Types
// ============================================================================

export {
  UNOBTRUSIVE_VERSION,
} from './unobtrusive-types';

export type {
  AdapterOptions,
  ValidationAdapter,
  AdapterRegistry as AdapterRegistryType,
  ParsedFieldValidation,
  ParsedFormValidation,
  FieldErrorConfig,
  ValidationSummaryConfig,
  ImsUnobtrusiveFormProps,
  UnobtrusiveGlobalOptions,
  SetValidationValueFn,
  UnobtrusiveValidationMeta,
} from './unobtrusive-types';

// ============================================================================
// Unobtrusive Validators
// ============================================================================

export {
  dummyValidator,
  regexValidator,
  nonalphaminValidator,
  validatePasswordComplexity,
  unobtrusiveDefaultMessages,
  unobtrusiveValidators,
} from './unobtrusive-validators';

export type {
  PasswordRules,
} from './unobtrusive-validators';

// ============================================================================
// Unobtrusive Adapters
// ============================================================================

export {
  setValidationValues,
  splitAndTrim,
  escapeAttributeValue,
  getModelPrefix,
  appendModelPrefix,
  ImsAdapterRegistry,
  createDefaultAdapterRegistry,
  globalAdapterRegistry,
} from './unobtrusive-adapters';

// ============================================================================
// Unobtrusive Parser
// ============================================================================

export {
  parseElement,
  parseForm,
  toValidationConfig,
  parseFieldConfig,
  unobtrusiveOptions,
  setUnobtrusiveOptions,
} from './unobtrusive-parser';

export type {
  UnobtrusiveFieldConfig,
} from './unobtrusive-parser';

// ============================================================================
// Unobtrusive Form Components
// ============================================================================

export {
  ImsUnobtrusiveForm,
  ImsUnobtrusiveValidationSummary,
  ImsUnobtrusiveFieldError,
  useUnobtrusiveValidation,
} from './unobtrusive-form';

export type {
  ImsUnobtrusiveValidationSummaryProps,
  ImsUnobtrusiveFieldErrorProps,
  UseUnobtrusiveValidationOptions,
  UseUnobtrusiveValidationReturn,
} from './unobtrusive-form';

// ============================================================================
// Unobtrusive Summary Components (Deep Navy Blue Theme)
// ============================================================================

export {
  ImsUnobtrusiveSummary,
  ImsUnobtrusiveFieldMessage,
  ImsUnobtrusiveFieldGroup,
  ImsUnobtrusiveResetButton,
} from './unobtrusive-summary';

export type {
  ImsUnobtrusiveSummaryProps,
  ImsUnobtrusiveFieldMessageProps,
  ImsUnobtrusiveFieldGroupProps,
  ImsUnobtrusiveResetButtonProps,
} from './unobtrusive-summary';
