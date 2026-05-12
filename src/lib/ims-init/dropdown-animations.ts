/**
 * IMS Init - Dropdown Animation Configuration
 *
 * Replaces the jQuery dropdown animation from the original script:
 *
 * ```js
 * $('.dropdown').on('show.bs.dropdown', function (e) {
 *     $(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
 * });
 * $('.dropdown').on('hide.bs.dropdown', function (e) {
 *     $(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
 * });
 * ```
 *
 * In React, dropdown animations are handled by Framer Motion variants
 * on the shadcn/ui DropdownMenu components.
 */

import type { DropdownAnimationConfig } from './types';

// ============================================================================
// Default Animation Configuration
// ============================================================================

/**
 * Default dropdown animation config.
 * Matches the original 300ms slideDown/slideUp timing.
 */
export function getDefaultDropdownAnimation(): DropdownAnimationConfig {
  return {
    duration: 300,
    easing: 'easeOut',
    type: 'slide-fade',
    origin: 'top',
  };
}

// ============================================================================
// Framer Motion Variants
// ============================================================================

/**
 * Framer Motion animation variants for dropdown menus.
 * Replaces jQuery slideDown/slideUp with Framer Motion animate.
 *
 * Usage with shadcn/ui DropdownMenuContent:
 * ```tsx
 * import { motion, AnimatePresence } from 'framer-motion';
 * import { imsDropdownVariants } from '@/lib/ims-init';
 *
 * <AnimatePresence>
 *   {isOpen && (
 *     <motion.div
 *       variants={imsDropdownVariants}
 *       initial="hidden"
 *       animate="visible"
 *       exit="hidden"
 *     >
 *       <DropdownMenuContent>...</DropdownMenuContent>
 *     </motion.div>
 *   )}
 * </AnimatePresence>
 * ```
 */
export const imsDropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Slide-only variants (matching original slideDown/slideUp more closely).
 * No fade, just vertical movement.
 */
export const imsDropdownSlideVariants = {
  hidden: {
    opacity: 1,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

/**
 * Scale variants for a more modern dropdown feel.
 */
export const imsDropdownScaleVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    originY: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    originY: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1], // spring-like
    },
  },
};

// ============================================================================
// Animation Config Builder
// ============================================================================

/**
 * Build Framer Motion transition from DropdownAnimationConfig.
 * Allows customizing dropdown animation from the IMS config.
 */
export function buildDropdownTransition(config: DropdownAnimationConfig = getDefaultDropdownAnimation()) {
  return {
    duration: config.duration / 1000, // Convert ms to seconds
    ease: config.easing,
  };
}

/**
 * Build Framer Motion variants from DropdownAnimationConfig.
 */
export function buildDropdownVariants(config: DropdownAnimationConfig = getDefaultDropdownAnimation()) {
  const transition = buildDropdownTransition(config);

  switch (config.type) {
    case 'slide':
      return {
        hidden: { opacity: 1, y: -10, transition },
        visible: { opacity: 1, y: 0, transition },
      };
    case 'fade':
      return {
        hidden: { opacity: 0, transition },
        visible: { opacity: 1, transition },
      };
    case 'scale':
      return {
        hidden: { opacity: 0, scale: 0.95, originY: config.origin === 'bottom' ? 1 : 0, transition },
        visible: { opacity: 1, scale: 1, originY: config.origin === 'bottom' ? 1 : 0, transition },
      };
    case 'slide-fade':
    default:
      return {
        hidden: { opacity: 0, y: -8, scale: 0.95, transition },
        visible: { opacity: 1, y: 0, scale: 1, transition },
      };
  }
}
