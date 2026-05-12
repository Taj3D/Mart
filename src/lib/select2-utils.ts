/**
 * IMS Select2 Compatibility Utils
 * Replaces Select2 4.0.3 core JavaScript utility layer
 * Provides diacritics removal, keyboard constants, observable events,
 * HTML escaping, matcher, tokenizer, and data conversion utilities
 * for the IMS ERP select component system (Deep Navy Blue theme)
 *
 * Converted from: Select2 4.0.3 full.js (select2/utils, select2/keys, select2/diacritics)
 * Reference: https://github.com/select2/select2
 *
 * Part of IMS ERP System - Deep Navy Blue Theme
 */

// ============================================================================
// Keyboard Key Constants (select2/keys)
// ============================================================================

/** Keyboard key codes matching Select2 keys module */
export const KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
} as const;

export type KeyCode = (typeof KEYS)[keyof typeof KEYS];

// ============================================================================
// Observable Event System (select2/utils → Observable)
// ============================================================================

/**
 * Observable event emitter replacing Select2's Utils.Observable.
 * Used for component-internal event communication.
 *
 * Converted from:
 *   var d = function() { this.listeners = {} };
 *   d.prototype.on = function(a, b) { ... };
 *   d.prototype.trigger = function(a) { ... };
 */
export class IMSObservable {
  protected listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  /** Register an event handler */
  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  /** Remove an event handler */
  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (!this.listeners[event]) return;
    if (handler) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    } else {
      delete this.listeners[event];
    }
  }

  /** Trigger an event with data */
  trigger(event: string, ...args: unknown[]): void {
    const handlers = this.listeners[event];
    if (handlers) {
      for (const handler of handlers) {
        handler.apply(this, args);
      }
    }
    // Wildcard handlers (matching Select2 "*" listener)
    const wildcardHandlers = this.listeners['*'];
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        handler.apply(this, [event, ...args]);
      }
    }
  }

  /** Remove all listeners */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// ============================================================================
// HTML Escaping (select2/utils → escapeMarkup)
// ============================================================================

/** HTML entity map for escaping (matching Select2 escapeMarkup) */
const ESCAPE_MAP: Record<string, string> = {
  '\\': '&#92;',
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#47;',
};

const ESCAPE_REGEX = /[&<>"'\/\\]/g;

/**
 * Escape HTML markup characters.
 * Replaces Select2 Utils.escapeMarkup()
 */
export function escapeMarkup(text: string | null | undefined): string {
  if (typeof text !== 'string') return text == null ? '' : String(text);
  return text.replace(ESCAPE_REGEX, (char) => ESCAPE_MAP[char] || char);
}

// ============================================================================
// Diacritics Removal (select2/diacritics)
// ============================================================================

/**
 * Complete diacritics mapping from Select2 4.0.3.
 * Maps accented/unicode characters to their ASCII equivalents for search matching.
 * This is essential for international ERP users searching in Bengali, Hindi, etc.
 */
export const DIACRITICS_MAP: Record<string, string> = {
  // A variants
  'Ⓐ': 'A', 'Ａ': 'A', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A',
  'Ẫ': 'A', 'Ẩ': 'A', 'Ã': 'A', 'Ā': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A',
  'Ẵ': 'A', 'Ẳ': 'A', 'Ȧ': 'A', 'Ǡ': 'A', 'Ä': 'A', 'Ǟ': 'A', 'Ả': 'A',
  'Å': 'A', 'Ǻ': 'A', 'Ǎ': 'A', 'Ȁ': 'A', 'Ȃ': 'A', 'Ạ': 'A', 'Ậ': 'A',
  'Ặ': 'A', 'Ḁ': 'A', 'Ą': 'A', 'Ⱥ': 'A', 'Ɐ': 'A',
  'Ꜳ': 'AA', 'Æ': 'AE', 'Ǽ': 'AE', 'Ǣ': 'AE', 'Ꜵ': 'AO', 'Ꜷ': 'AU',
  'Ꜹ': 'AV', 'Ꜻ': 'AV', 'Ꜽ': 'AY',
  // B
  'Ⓑ': 'B', 'Ｂ': 'B', 'Ḃ': 'B', 'Ḅ': 'B', 'Ḇ': 'B', 'Ƀ': 'B', 'Ƃ': 'B', 'Ɓ': 'B',
  // C
  'Ⓒ': 'C', 'Ｃ': 'C', 'Ć': 'C', 'Ĉ': 'C', 'Ċ': 'C', 'Č': 'C', 'Ç': 'C',
  'Ḉ': 'C', 'Ƈ': 'C', 'Ȼ': 'C', 'Ꜿ': 'C',
  // D
  'Ⓓ': 'D', 'Ｄ': 'D', 'Ḋ': 'D', 'Ď': 'D', 'Ḍ': 'D', 'Ḑ': 'D', 'Ḓ': 'D',
  'Ḏ': 'D', 'Đ': 'D', 'Ƌ': 'D', 'Ɗ': 'D', 'Ɖ': 'D', 'Ꝺ': 'D',
  'Ǳ': 'DZ', 'Ǆ': 'DZ', 'ǲ': 'Dz', 'ǅ': 'Dz',
  // E
  'Ⓔ': 'E', 'Ｅ': 'E', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E',
  'Ễ': 'E', 'Ể': 'E', 'Ẽ': 'E', 'Ē': 'E', 'Ḕ': 'E', 'Ḗ': 'E', 'Ĕ': 'E',
  'Ė': 'E', 'Ë': 'E', 'Ẻ': 'E', 'Ě': 'E', 'Ȅ': 'E', 'Ȇ': 'E', 'Ẹ': 'E',
  'Ệ': 'E', 'Ȩ': 'E', 'Ḝ': 'E', 'Ę': 'E', 'Ḙ': 'E', 'Ḛ': 'E', 'Ɛ': 'E', 'Ǝ': 'E',
  // F
  'Ⓕ': 'F', 'Ｆ': 'F', 'Ḟ': 'F', 'Ƒ': 'F', 'Ꝼ': 'F',
  // G
  'Ⓖ': 'G', 'Ｇ': 'G', 'Ǵ': 'G', 'Ĝ': 'G', 'Ḡ': 'G', 'Ğ': 'G', 'Ġ': 'G',
  'Ǧ': 'G', 'Ģ': 'G', 'Ǥ': 'G', 'Ɠ': 'G', 'Ꞡ': 'G', 'Ᵹ': 'G', 'Ꝿ': 'G',
  // H
  'Ⓗ': 'H', 'Ｈ': 'H', 'Ĥ': 'H', 'Ḣ': 'H', 'Ḧ': 'H', 'Ȟ': 'H', 'Ḥ': 'H',
  'Ḩ': 'H', 'Ḫ': 'H', 'Ħ': 'H', 'Ⱨ': 'H', 'Ⱶ': 'H', 'Ɥ': 'H',
  // I
  'Ⓘ': 'I', 'Ｉ': 'I', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ĩ': 'I', 'Ī': 'I',
  'Ĭ': 'I', 'İ': 'I', 'Ï': 'I', 'Ḯ': 'I', 'Ỉ': 'I', 'Ǐ': 'I', 'Ȉ': 'I',
  'Ȋ': 'I', 'Ị': 'I', 'Į': 'I', 'Ḭ': 'I', 'Ɨ': 'I',
  // J
  'Ⓙ': 'J', 'Ｊ': 'J', 'Ĵ': 'J', 'Ɉ': 'J',
  // K
  'Ⓚ': 'K', 'Ｋ': 'K', 'Ḱ': 'K', 'Ǩ': 'K', 'Ḳ': 'K', 'Ķ': 'K', 'Ḵ': 'K',
  'Ƙ': 'K', 'Ⱪ': 'K', 'Ꝁ': 'K', 'Ꝃ': 'K', 'Ꝅ': 'K', 'Ꞣ': 'K',
  // L
  'Ⓛ': 'L', 'Ｌ': 'L', 'Ŀ': 'L', 'Ĺ': 'L', 'Ľ': 'L', 'Ḷ': 'L', 'Ḹ': 'L',
  'Ļ': 'L', 'Ḽ': 'L', 'Ḻ': 'L', 'Ł': 'L', 'Ƚ': 'L', 'Ɫ': 'L', 'Ⱡ': 'L',
  'Ꝉ': 'L', 'Ꝇ': 'L', 'Ꞁ': 'L', 'Ǉ': 'LJ', 'ǈ': 'Lj',
  // M
  'Ⓜ': 'M', 'Ｍ': 'M', 'Ḿ': 'M', 'Ṁ': 'M', 'Ṃ': 'M', 'Ɱ': 'M', 'Ɯ': 'M',
  // N
  'Ⓝ': 'N', 'Ｎ': 'N', 'Ǹ': 'N', 'Ń': 'N', 'Ñ': 'N', 'Ṅ': 'N', 'Ň': 'N',
  'Ṇ': 'N', 'Ņ': 'N', 'Ṋ': 'N', 'Ṉ': 'N', 'Ƞ': 'N', 'Ɲ': 'N', 'Ꞑ': 'N',
  'Ꞥ': 'N', 'Ǌ': 'NJ', 'ǋ': 'Nj',
  // O
  'Ⓞ': 'O', 'Ｏ': 'O', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O',
  'Ỗ': 'O', 'Ổ': 'O', 'Õ': 'O', 'Ṍ': 'O', 'Ȭ': 'O', 'Ṏ': 'O', 'Ō': 'O',
  'Ṑ': 'O', 'Ṓ': 'O', 'Ŏ': 'O', 'Ȯ': 'O', 'Ȱ': 'O', 'Ö': 'O', 'Ȫ': 'O',
  'Ỏ': 'O', 'Ő': 'O', 'Ǒ': 'O', 'Ȍ': 'O', 'Ȏ': 'O', 'Ơ': 'O', 'Ờ': 'O',
  'Ớ': 'O', 'Ỡ': 'O', 'Ở': 'O', 'Ợ': 'O', 'Ọ': 'O', 'Ộ': 'O', 'Ǫ': 'O',
  'Ǭ': 'O', 'Ø': 'O', 'Ǿ': 'O', 'Ɔ': 'O', 'Ɵ': 'O', 'Ꝋ': 'O', 'Ꝍ': 'O',
  'Ƣ': 'OI', 'Ꝏ': 'OO', 'Ȣ': 'OU',
  // P
  'Ⓟ': 'P', 'Ｐ': 'P', 'Ṕ': 'P', 'Ṗ': 'P', 'Ƥ': 'P', 'Ᵽ': 'P',
  'Ꝑ': 'P', 'Ꝓ': 'P', 'Ꝕ': 'P',
  // Q
  'Ⓠ': 'Q', 'Ｑ': 'Q', 'Ꝗ': 'Q', 'Ꝙ': 'Q', 'Ɋ': 'Q',
  // R
  'Ⓡ': 'R', 'Ｒ': 'R', 'Ŕ': 'R', 'Ṙ': 'R', 'Ř': 'R', 'Ȑ': 'R', 'Ȓ': 'R',
  'Ṛ': 'R', 'Ṝ': 'R', 'Ŗ': 'R', 'Ṟ': 'R', 'Ɍ': 'R', 'Ɽ': 'R',
  'Ꝛ': 'R', 'Ꞧ': 'R', 'Ꞃ': 'R',
  // S
  'Ⓢ': 'S', 'Ｓ': 'S', 'ẞ': 'S', 'Ś': 'S', 'Ṥ': 'S', 'Ŝ': 'S', 'Ṡ': 'S',
  'Š': 'S', 'Ṧ': 'S', 'Ṣ': 'S', 'Ṩ': 'S', 'Ș': 'S', 'Ş': 'S',
  'Ȿ': 'S', 'Ꞩ': 'S', 'Ꞅ': 'S',
  // T
  'Ⓣ': 'T', 'Ｔ': 'T', 'Ṫ': 'T', 'Ť': 'T', 'Ṭ': 'T', 'Ț': 'T', 'Ţ': 'T',
  'Ṱ': 'T', 'Ṯ': 'T', 'Ŧ': 'T', 'Ƭ': 'T', 'Ʈ': 'T', 'Ⱦ': 'T',
  'Ꞇ': 'T', 'Ꜩ': 'TZ',
  // U
  'Ⓤ': 'U', 'Ｕ': 'U', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ũ': 'U', 'Ṹ': 'U',
  'Ū': 'U', 'Ṻ': 'U', 'Ŭ': 'U', 'Ü': 'U', 'Ǜ': 'U', 'Ǘ': 'U', 'Ǖ': 'U',
  'Ǚ': 'U', 'Ủ': 'U', 'Ů': 'U', 'Ű': 'U', 'Ǔ': 'U', 'Ȕ': 'U', 'Ȗ': 'U',
  'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ữ': 'U', 'Ử': 'U', 'Ự': 'U', 'Ụ': 'U',
  'Ṳ': 'U', 'Ų': 'U', 'Ṷ': 'U', 'Ṵ': 'U', 'Ʉ': 'U',
  // V
  'Ⓥ': 'V', 'Ｖ': 'V', 'Ṽ': 'V', 'Ṿ': 'V', 'Ʋ': 'V', 'Ꝟ': 'V',
  'Ʌ': 'V', 'Ꝡ': 'VY',
  // W
  'Ⓦ': 'W', 'Ｗ': 'W', 'Ẁ': 'W', 'Ẃ': 'W', 'Ŵ': 'W', 'Ẇ': 'W',
  'Ẅ': 'W', 'Ẉ': 'W', 'Ⱳ': 'W',
  // X
  'Ⓧ': 'X', 'Ｘ': 'X', 'Ẋ': 'X', 'Ẍ': 'X',
  // Y
  'Ⓨ': 'Y', 'Ｙ': 'Y', 'Ỳ': 'Y', 'Ý': 'Y', 'Ŷ': 'Y', 'Ỹ': 'Y', 'Ȳ': 'Y',
  'Ẏ': 'Y', 'Ÿ': 'Y', 'Ỷ': 'Y', 'Ỵ': 'Y', 'Ƴ': 'Y', 'Ɏ': 'Y', 'Ỿ': 'Y',
  // Z
  'Ⓩ': 'Z', 'Ｚ': 'Z', 'Ź': 'Z', 'Ẑ': 'Z', 'Ż': 'Z', 'Ž': 'Z', 'Ẓ': 'Z',
  'Ẕ': 'Z', 'Ƶ': 'Z', 'Ȥ': 'Z', 'Ɀ': 'Z', 'Ⱬ': 'Z', 'Ꝣ': 'Z',
  // Lowercase a
  'ⓐ': 'a', 'ａ': 'a', 'ẚ': 'a', 'à': 'a', 'á': 'a', 'â': 'a', 'ầ': 'a',
  'ấ': 'a', 'ẫ': 'a', 'ẩ': 'a', 'ã': 'a', 'ā': 'a', 'ă': 'a', 'ằ': 'a',
  'ắ': 'a', 'ẵ': 'a', 'ẳ': 'a', 'ȧ': 'a', 'ǡ': 'a', 'ä': 'a', 'ǟ': 'a',
  'ả': 'a', 'å': 'a', 'ǻ': 'a', 'ǎ': 'a', 'ȁ': 'a', 'ȃ': 'a', 'ạ': 'a',
  'ậ': 'a', 'ặ': 'a', 'ḁ': 'a', 'ą': 'a', 'ⱥ': 'a', 'ɐ': 'a',
  'ꜳ': 'aa', 'æ': 'ae', 'ǽ': 'ae', 'ǣ': 'ae', 'ꜵ': 'ao', 'ꜷ': 'au',
  'ꜹ': 'av', 'ꜻ': 'av', 'ꜽ': 'ay',
  // Lowercase b-d
  'ⓑ': 'b', 'ｂ': 'b', 'ḃ': 'b', 'ḅ': 'b', 'ḇ': 'b', 'ƀ': 'b', 'ƃ': 'b', 'ɓ': 'b',
  'ⓒ': 'c', 'ｃ': 'c', 'ć': 'c', 'ĉ': 'c', 'ċ': 'c', 'č': 'c', 'ç': 'c',
  'ḉ': 'c', 'ƈ': 'c', 'ȼ': 'c', 'ꜿ': 'c', 'ↄ': 'c',
  'ⓓ': 'd', 'ｄ': 'd', 'ḋ': 'd', 'ď': 'd', 'ḍ': 'd', 'ḑ': 'd', 'ḓ': 'd',
  'ḏ': 'd', 'đ': 'd', 'ƌ': 'd', 'ɖ': 'd', 'ɗ': 'd', 'ꝺ': 'd',
  'ǳ': 'dz', 'ǆ': 'dz',
  // Lowercase e
  'ⓔ': 'e', 'ｅ': 'e', 'è': 'e', 'é': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e',
  'ễ': 'e', 'ể': 'e', 'ẽ': 'e', 'ē': 'e', 'ḕ': 'e', 'ḗ': 'e', 'ĕ': 'e',
  'ė': 'e', 'ë': 'e', 'ẻ': 'e', 'ě': 'e', 'ȅ': 'e', 'ȇ': 'e', 'ẹ': 'e',
  'ệ': 'e', 'ȩ': 'e', 'ḝ': 'e', 'ę': 'e', 'ḙ': 'e', 'ḛ': 'e', 'ɇ': 'e',
  'ɛ': 'e', 'ǝ': 'e',
  // Lowercase f-n
  'ⓕ': 'f', 'ｆ': 'f', 'ḟ': 'f', 'ƒ': 'f', 'ꝼ': 'f',
  'ⓖ': 'g', 'ｇ': 'g', 'ǵ': 'g', 'ĝ': 'g', 'ḡ': 'g', 'ğ': 'g', 'ġ': 'g',
  'ǧ': 'g', 'ģ': 'g', 'ǥ': 'g', 'ɠ': 'g', 'ꞡ': 'g', 'ᵹ': 'g', 'ꝿ': 'g',
  'ⓗ': 'h', 'ｈ': 'h', 'ĥ': 'h', 'ḣ': 'h', 'ḧ': 'h', 'ȟ': 'h', 'ḥ': 'h',
  'ḩ': 'h', 'ḫ': 'h', 'ẖ': 'h', 'ħ': 'h', 'ⱨ': 'h', 'ⱶ': 'h', 'ɥ': 'h',
  'ƕ': 'hv',
  'ⓘ': 'i', 'ｉ': 'i', 'ì': 'i', 'í': 'i', 'î': 'i', 'ĩ': 'i', 'ī': 'i',
  'ĭ': 'i', 'ï': 'i', 'ḯ': 'i', 'ỉ': 'i', 'ǐ': 'i', 'ȉ': 'i', 'ȋ': 'i',
  'ị': 'i', 'į': 'i', 'ḭ': 'i', 'ɨ': 'i', 'ı': 'i',
  'ⓙ': 'j', 'ｊ': 'j', 'ĵ': 'j', 'ǰ': 'j', 'ɉ': 'j',
  'ⓚ': 'k', 'ｋ': 'k', 'ḱ': 'k', 'ǩ': 'k', 'ḳ': 'k', 'ķ': 'k', 'ḵ': 'k',
  'ƙ': 'k', 'ⱪ': 'k', 'ꝁ': 'k', 'ꝃ': 'k', 'ꝅ': 'k', 'ꞣ': 'k',
  'ⓛ': 'l', 'ｌ': 'l', 'ŀ': 'l', 'ĺ': 'l', 'ľ': 'l', 'ḷ': 'l', 'ḹ': 'l',
  'ļ': 'l', 'ḽ': 'l', 'ḻ': 'l', 'ſ': 'l', 'ł': 'l', 'ƚ': 'l', 'ɫ': 'l',
  'ⱡ': 'l', 'ꝉ': 'l', 'ꞁ': 'l', 'ꝇ': 'l', 'ǉ': 'lj',
  'ⓜ': 'm', 'ｍ': 'm', 'ḿ': 'm', 'ṁ': 'm', 'ṃ': 'm', 'ɱ': 'm', 'ɯ': 'm',
  'ⓝ': 'n', 'ｎ': 'n', 'ǹ': 'n', 'ń': 'n', 'ñ': 'n', 'ṅ': 'n', 'ň': 'n',
  'ṇ': 'n', 'ņ': 'n', 'ṋ': 'n', 'ṉ': 'n', 'ƞ': 'n', 'ɲ': 'n', 'ŉ': 'n',
  'ꞑ': 'n', 'ꞥ': 'n', 'ǌ': 'nj',
  // Lowercase o
  'ⓞ': 'o', 'ｏ': 'o', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o',
  'ỗ': 'o', 'ổ': 'o', 'õ': 'o', 'ṍ': 'o', 'ȭ': 'o', 'ṏ': 'o', 'ō': 'o',
  'ṑ': 'o', 'ṓ': 'o', 'ŏ': 'o', 'ȯ': 'o', 'ȱ': 'o', 'ö': 'o', 'ȫ': 'o',
  'ỏ': 'o', 'ő': 'o', 'ǒ': 'o', 'ȍ': 'o', 'ȏ': 'o', 'ơ': 'o', 'ờ': 'o',
  'ớ': 'o', 'ỡ': 'o', 'ở': 'o', 'ợ': 'o', 'ọ': 'o', 'ộ': 'o', 'ǫ': 'o',
  'ǭ': 'o', 'ø': 'o', 'ǿ': 'o', 'ɔ': 'o', 'ꝋ': 'o', 'ꝍ': 'o', 'ɵ': 'o',
  'ƣ': 'oi', 'ȣ': 'ou', 'ꝏ': 'oo',
  // Lowercase p-z
  'ⓟ': 'p', 'ｐ': 'p', 'ṕ': 'p', 'ṗ': 'p', 'ƥ': 'p', 'ᵽ': 'p',
  'ꝑ': 'p', 'ꝓ': 'p', 'ꝕ': 'p',
  'ⓠ': 'q', 'ｑ': 'q', 'ɋ': 'q', 'ꝗ': 'q', 'ꝙ': 'q',
  'ⓡ': 'r', 'ｒ': 'r', 'ŕ': 'r', 'ṙ': 'r', 'ř': 'r', 'ȑ': 'r', 'ȓ': 'r',
  'ṛ': 'r', 'ṝ': 'r', 'ŗ': 'r', 'ṟ': 'r', 'ɍ': 'r', 'ɽ': 'r',
  'ꝛ': 'r', 'ꞧ': 'r', 'ꞃ': 'r',
  'ⓢ': 's', 'ｓ': 's', 'ß': 's', 'ś': 's', 'ṥ': 's', 'ŝ': 's', 'ṡ': 's',
  'š': 's', 'ṧ': 's', 'ṣ': 's', 'ṩ': 's', 'ș': 's', 'ş': 's', 'ȿ': 's',
  'ꞩ': 's', 'ꞅ': 's', 'ẛ': 's',
  'ⓣ': 't', 'ｔ': 't', 'ṫ': 't', 'ẗ': 't', 'ť': 't', 'ṭ': 't', 'ț': 't',
  'ţ': 't', 'ṱ': 't', 'ṯ': 't', 'ŧ': 't', 'ƭ': 't', 'ʈ': 't',
  'ⱦ': 't', 'ꞇ': 't', 'ꜩ': 'tz',
  'ⓤ': 'u', 'ｕ': 'u', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ũ': 'u', 'ṹ': 'u',
  'ū': 'u', 'ṻ': 'u', 'ŭ': 'u', 'ü': 'u', 'ǜ': 'u', 'ǘ': 'u', 'ǖ': 'u',
  'ǚ': 'u', 'ủ': 'u', 'ů': 'u', 'ű': 'u', 'ǔ': 'u', 'ȕ': 'u', 'ȗ': 'u',
  'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ữ': 'u', 'ử': 'u', 'ự': 'u', 'ụ': 'u',
  'ṳ': 'u', 'ų': 'u', 'ṷ': 'u', 'ṵ': 'u', 'ʉ': 'u',
  'ⓥ': 'v', 'ｖ': 'v', 'ṽ': 'v', 'ṿ': 'v', 'ʋ': 'v', 'ꝟ': 'v',
  'ʌ': 'v', 'ꝡ': 'vy',
  'ⓦ': 'w', 'ｗ': 'w', 'ẁ': 'w', 'ẃ': 'w', 'ŵ': 'w', 'ẇ': 'w',
  'ẅ': 'w', 'ẘ': 'w', 'ẉ': 'w', 'ⱳ': 'w',
  'ⓧ': 'x', 'ｘ': 'x', 'ẋ': 'x', 'ẍ': 'x',
  'ⓨ': 'y', 'ｙ': 'y', 'ỳ': 'y', 'ý': 'y', 'ŷ': 'y', 'ỹ': 'y', 'ȳ': 'y',
  'ẏ': 'y', 'ÿ': 'y', 'ỷ': 'y', 'ẙ': 'y', 'ỵ': 'y', 'ƴ': 'y', 'ɏ': 'y', 'ỿ': 'y',
  'ⓩ': 'z', 'ｚ': 'z', 'ź': 'z', 'ẑ': 'z', 'ż': 'z', 'ž': 'z', 'ẓ': 'z',
  'ẕ': 'z', 'ƶ': 'z', 'ȥ': 'z', 'ɀ': 'z', 'ⱬ': 'z', 'ꝣ': 'z',
  // Greek
  'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ϊ': 'Ι', 'Ό': 'Ο',
  'Ύ': 'Υ', 'Ϋ': 'Υ', 'Ώ': 'Ω',
  'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ϊ': 'ι', 'ΐ': 'ι',
  'ό': 'ο', 'ύ': 'υ', 'ϋ': 'υ', 'ΰ': 'υ', 'ω': 'ω', 'ς': 'σ',
};

/** Regex matching any diacritical character */
const DIACRITICS_REGEX = new RegExp(
  `[${Object.keys(DIACRITICS_MAP).map(escapeRegexChar).join('')}]`,
  'g'
);

/**
 * Escape a single character for use in regex.
 */
function escapeRegexChar(char: string): string {
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

/**
 * Remove diacritics from a string for accent-insensitive search.
 * Replaces Select2 diacritics module usage in matcher.
 *
 * Example: "São Paulo" → "Sao Paulo", "Montréal" → "Montreal"
 */
export function removeDiacritics(text: string): string {
  if (!text) return text;
  return text.replace(DIACRITICS_REGEX, (match) => DIACRITICS_MAP[match] || match);
}

// ============================================================================
// Matcher Functions (select2/defaults → matcher)
// ============================================================================

/** Select2 option data structure */
export interface IMSSelect2Option {
  id: string;
  text: string;
  disabled?: boolean;
  selected?: boolean;
  title?: string;
  children?: IMSSelect2Option[];
  element?: HTMLElement;
  [key: string]: unknown;
}

/** Search/query parameters */
export interface IMSSelect2Query {
  term: string;
  page?: number;
}

/** Search results */
export interface IMSSelect2Results {
  results: IMSSelect2Option[];
  pagination?: { more: boolean };
}

/**
 * Default Select2 matcher with diacritics support.
 * Replaces: select2/defaults matcher function
 *
 * Original logic:
 *   function c(d, e) {
 *     if ("" === a.trim(d.term)) return e;
 *     // ... search through children recursively
 *     var j = b(e.text).toUpperCase();
 *     var k = b(d.term).toUpperCase();
 *     return j.indexOf(k) > -1 ? e : null;
 *   }
 *   where b = remove diacritics function
 */
export function defaultMatcher(
  params: IMSSelect2Query,
  option: IMSSelect2Option
): IMSSelect2Option | null {
  // Empty search matches everything
  const term = (params.term || '').trim();
  if (term === '') return option;

  // Search children recursively
  if (option.children && option.children.length > 0) {
    const match = { ...option, children: [] as IMSSelect2Option[] };
    for (const child of option.children) {
      const childMatch = defaultMatcher(params, child);
      if (childMatch !== null) {
        match.children.push(childMatch);
      }
    }
    return match.children.length > 0 ? match : defaultMatcher(params, match);
  }

  // Diacritics-insensitive text matching
  const optionText = removeDiacritics(option.text || '').toUpperCase();
  const searchTerm = removeDiacritics(term).toUpperCase();
  return optionText.indexOf(searchTerm) > -1 ? option : null;
}

/**
 * Fuzzy matcher that matches characters in order but not necessarily contiguous.
 * Provides a more forgiving search experience for ERP users.
 */
export function fuzzyMatcher(
  params: IMSSelect2Query,
  option: IMSSelect2Option
): IMSSelect2Option | null {
  const term = (params.term || '').trim().toLowerCase();
  if (term === '') return option;

  if (option.children && option.children.length > 0) {
    const match = { ...option, children: [] as IMSSelect2Option[] };
    for (const child of option.children) {
      const childMatch = fuzzyMatcher(params, child);
      if (childMatch !== null) match.children.push(childMatch);
    }
    return match.children.length > 0 ? match : null;
  }

  const text = removeDiacritics(option.text || '').toLowerCase();
  let termIdx = 0;
  for (let i = 0; i < text.length && termIdx < term.length; i++) {
    if (text[i] === term[termIdx]) termIdx++;
  }
  return termIdx === term.length ? option : null;
}

/**
 * Starts-with matcher - only matches options starting with the search term.
 */
export function startsWithMatcher(
  params: IMSSelect2Query,
  option: IMSSelect2Option
): IMSSelect2Option | null {
  const term = (params.term || '').trim();
  if (term === '') return option;

  if (option.children && option.children.length > 0) {
    const match = { ...option, children: [] as IMSSelect2Option[] };
    for (const child of option.children) {
      const childMatch = startsWithMatcher(params, child);
      if (childMatch !== null) match.children.push(childMatch);
    }
    return match.children.length > 0 ? match : null;
  }

  const text = removeDiacritics(option.text || '').toUpperCase();
  const searchTerm = removeDiacritics(term).toUpperCase();
  return text.startsWith(searchTerm) ? option : null;
}

// ============================================================================
// Tokenizer (select2/data/tokenizer)
// ============================================================================

/**
 * Tokenize input by separator characters.
 * Replaces: select2/data/tokenizer tokenizer function
 *
 * Original logic:
 *   for (var h = 0; h < g.length; ) {
 *     var j = g[h];
 *     if (-1 !== a.inArray(j, f)) {
 *       var k = g.substr(0, h);
 *       // create tag from k, reset h
 *     } else h++
 *   }
 *
 * @param term - Current search term
 * @param separators - Array of separator characters (e.g., [',', ' '])
 * @param createTag - Function to create a tag from token text
 * @returns Object with remaining term and created tokens
 */
export function tokenize(
  term: string,
  separators: string[],
  createTag?: (text: string) => IMSSelect2Option | null
): { term: string; tokens: IMSSelect2Option[] } {
  const tokens: IMSSelect2Option[] = [];
  const create = createTag || ((text: string) => {
    const trimmed = text.trim();
    return trimmed === '' ? null : { id: trimmed, text: trimmed };
  });

  let remaining = term || '';
  let i = 0;

  while (i < remaining.length) {
    const char = remaining[i];
    if (separators.includes(char)) {
      const tokenText = remaining.substring(0, i);
      const tag = create(tokenText);
      if (tag !== null) {
        tokens.push(tag);
      }
      remaining = remaining.substring(i + 1) || '';
      i = 0;
    } else {
      i++;
    }
  }

  return { term: remaining, tokens };
}

// ============================================================================
// Data Conversion (select2/utils → _convertData)
// ============================================================================

/**
 * Convert dashed HTML data attributes to nested objects.
 * Replaces: select2/utils _convertData function
 *
 * Example:
 *   { "data-ajax--url": "/api/search", "data-minimum-input-length": 3 }
 *   → { data: { ajax: { url: "/api/search" }, minimumInputLength: 3 } }
 *
 * Note: This uses camelCase conversion matching Select2's behavior
 * where "minimum-input-length" → "minimumInputLength"
 */
export function convertData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };

  for (const key in result) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) continue;

    const parts = key.split('-');
    if (parts.length === 1) continue;

    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      // CamelCase the part (matching Select2: f = f.substring(0,1).toLowerCase() + f.substring(1))
      part = part.substring(0, 1).toLowerCase() + part.substring(1);

      if (!(part in current)) {
        (current as Record<string, unknown>)[part] = {};
      }

      if (i === parts.length - 1) {
        (current as Record<string, unknown>)[part] = result[key];
      } else {
        current = (current as Record<string, unknown>)[part] as Record<string, unknown>;
      }
    }
    delete result[key];
  }

  return result;
}

// ============================================================================
// Utility Functions (select2/utils → generateChars, bind, hasScroll, appendMany)
// ============================================================================

/**
 * Generate random alphanumeric characters.
 * Replaces: select2/utils generateChars function
 */
export function generateChars(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    const random = Math.floor(36 * Math.random());
    result += random.toString(36);
  }
  return result;
}

/**
 * Generate a unique result ID for an option.
 * Replaces: select2/data/base generateResultId function
 */
export function generateResultId(
  containerId: string,
  option: IMSSelect2Option
): string {
  let id = containerId + '-result-';
  id += generateChars(4);
  id += option.id != null ? `-${option.id.toString()}` : `-${generateChars(4)}`;
  return id;
}

/**
 * Bind a function to a specific context.
 * Replaces: select2/utils bind function
 */
export function bind<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context: unknown
): T {
  return function (this: unknown, ...args: unknown[]) {
    return fn.apply(context, args);
  } as T;
}

/**
 * Check if an element has scrollable content.
 * Replaces: select2/utils hasScroll function
 */
export function hasScroll(element: HTMLElement): boolean {
  const overflowX = element.style.overflowX;
  const overflowY = element.style.overflowY;

  if (overflowX !== overflowY) {
    if (overflowY === 'scroll' || overflowX === 'scroll') return true;
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }

  return overflowY !== 'hidden' && overflowY !== 'visible';
}

// ============================================================================
// Translation / i18n System (select2/translation + select2/i18n/en)
// ============================================================================

/** Translation strings for Select2 messages */
export interface IMSSelect2Translations {
  errorLoading: () => string;
  inputTooLong: (args: { maximum: number; input: string }) => string;
  inputTooShort: (args: { minimum: number; input: string }) => string;
  loadingMore: () => string;
  maximumSelected: (args: { maximum: number }) => string;
  noResults: () => string;
  searching: () => string;
}

/** English translations (matching select2/i18n/en) */
export const EN_TRANSLATIONS: IMSSelect2Translations = {
  errorLoading: () => 'The results could not be loaded.',
  inputTooLong: (args) => {
    const overChars = args.input.length - args.maximum;
    return `Please delete ${overChars} character${overChars !== 1 ? 's' : ''}`;
  },
  inputTooShort: (args) => {
    const remaining = args.minimum - args.input.length;
    return `Please enter ${remaining} or more character${remaining !== 1 ? 's' : ''}`;
  },
  loadingMore: () => 'Loading more results…',
  maximumSelected: (args) => {
    return `You can only select ${args.maximum} item${args.maximum !== 1 ? 's' : ''}`;
  },
  noResults: () => 'No results found',
  searching: () => 'Searching…',
};

/** Bengali translations for IMS ERP users */
export const BN_TRANSLATIONS: IMSSelect2Translations = {
  errorLoading: () => 'ফলাফল লোড করা যায়নি।',
  inputTooLong: (args) => {
    const overChars = args.input.length - args.maximum;
    return `অনুগ্রহ করে ${overChars}টি অক্ষর মুছে দিন`;
  },
  inputTooShort: (args) => {
    const remaining = args.minimum - args.input.length;
    return `অনুগ্রহ করে আরো ${remaining}টি বা তার বেশি অক্ষর লিখুন`;
  },
  loadingMore: () => 'আরো ফলাফল লোড হচ্ছে…',
  maximumSelected: (args) => {
    return `আপনি সর্বোচ্চ ${args.maximum}টি আইটেম নির্বাচন করতে পারেন`;
  },
  noResults: () => 'কোনো ফলাফল পাওয়া যায়নি',
  searching: () => 'অনুসন্ধান করা হচ্ছে…',
};

/**
 * Translation manager.
 * Replaces: select2/translation class
 */
export class IMSTranslation {
  private dict: Partial<IMSSelect2Translations>;

  constructor(translations?: Partial<IMSSelect2Translations>) {
    this.dict = { ...EN_TRANSLATIONS, ...translations };
  }

  get(key: keyof IMSSelect2Translations): (...args: unknown[]) => string {
    return this.dict[key] || EN_TRANSLATIONS[key] || (() => '');
  }

  extend(translations: Partial<IMSSelect2Translations>): void {
    this.dict = { ...this.dict, ...translations };
  }

  all(): Partial<IMSSelect2Translations> {
    return { ...this.dict };
  }
}

// ============================================================================
// Select2 Defaults (select2/defaults)
// ============================================================================

/** Select2 default configuration matching select2/defaults */
export interface IMSSelect2Defaults {
  amdBase: string;
  amdLanguageBase: string;
  closeOnSelect: boolean;
  debug: boolean;
  dropdownAutoWidth: boolean;
  escapeMarkup: typeof escapeMarkup;
  language: IMSSelect2Translations;
  matcher: typeof defaultMatcher;
  minimumInputLength: number;
  maximumInputLength: number;
  maximumSelectionLength: number;
  minimumResultsForSearch: number;
  selectOnClose: boolean;
  sorter: <T>(results: T[]) => T[];
  templateResult: (option: IMSSelect2Option, container?: HTMLElement) => string | HTMLElement;
  templateSelection: (option: IMSSelect2Option, container?: HTMLElement) => string | HTMLElement;
  theme: string;
  width: string;
}

/** Default Select2 configuration values */
export const DEFAULT_SELECT2_CONFIG: IMSSelect2Defaults = {
  amdBase: './',
  amdLanguageBase: './i18n/',
  closeOnSelect: true,
  debug: false,
  dropdownAutoWidth: false,
  escapeMarkup,
  language: EN_TRANSLATIONS,
  matcher: defaultMatcher,
  minimumInputLength: 0,
  maximumInputLength: 0,
  maximumSelectionLength: 0,
  minimumResultsForSearch: 0,
  selectOnClose: false,
  sorter: (results) => results,
  templateResult: (option) => option.text,
  templateSelection: (option) => option.text,
  theme: 'default',
  width: 'resolve',
};

// ============================================================================
// Select2 Options Class (select2/options)
// ============================================================================

/**
 * Select2 options manager.
 * Replaces: select2/options class
 * Merges user-provided options with defaults.
 */
export class IMSSelect2Options {
  private options: Partial<IMSSelect2Defaults>;

  constructor(userOptions: Partial<IMSSelect2Defaults> = {}) {
    this.options = { ...DEFAULT_SELECT2_CONFIG, ...userOptions };
  }

  get<K extends keyof IMSSelect2Defaults>(key: K): IMSSelect2Defaults[K] {
    return (this.options[key] ?? DEFAULT_SELECT2_CONFIG[key]) as IMSSelect2Defaults[K];
  }

  set<K extends keyof IMSSelect2Defaults>(key: K, value: IMSSelect2Defaults[K]): void {
    this.options[key] = value;
  }

  apply(defaults: Partial<IMSSelect2Defaults>): void {
    this.options = { ...this.options, ...defaults };
  }
}

// ============================================================================
// Scroll Utilities (select2/results → ensureHighlightVisible)
// ============================================================================

/**
 * Ensure a highlighted option is visible within the scrollable container.
 * Replaces: select2/results ensureHighlightVisible function
 *
 * @param container - Scrollable container element
 * @param highlightedElement - The currently highlighted option element
 */
export function ensureHighlightVisible(
  container: HTMLElement,
  highlightedElement: HTMLElement | null
): void {
  if (!highlightedElement || !container) return;

  const options = container.querySelectorAll('[aria-selected]');
  const optionList = Array.from(options);
  const index = optionList.indexOf(highlightedElement);
  if (index < 0) return;

  const containerRect = container.getBoundingClientRect();
  const elementRect = highlightedElement.getBoundingClientRect();

  // Scroll offset calculation matching Select2 logic
  const offset = elementRect.top - containerRect.top + container.scrollTop;
  const adjustedOffset = offset - 2 * highlightedElement.offsetHeight;

  if (index <= 2) {
    container.scrollTop = 0;
  } else if (
    elementRect.top > containerRect.bottom ||
    elementRect.bottom < containerRect.top
  ) {
    container.scrollTop = adjustedOffset;
  }
}

// ============================================================================
// Dropdown Positioning (select2/dropdown/attachBody → _positionDropdown)
// ============================================================================

/** Dropdown position calculation result */
export interface IMSDropdownPosition {
  top: number;
  left: number;
  direction: 'above' | 'below';
}

/**
 * Calculate dropdown position relative to its container.
 * Replaces: select2/dropdown/attachBody _positionDropdown function
 *
 * @param containerRect - Bounding rect of the select container
 * @param dropdownHeight - Height of the dropdown
 * @param viewportHeight - Height of the browser viewport
 * @param parentOffset - Offset of the dropdown parent
 * @param forceDirection - Force dropdown direction (for manual override)
 */
export function calculateDropdownPosition(
  containerRect: DOMRect,
  dropdownHeight: number,
  viewportHeight: number,
  parentOffset: { top: number; left: number } = { top: 0, left: 0 },
  forceDirection?: 'above' | 'below'
): IMSDropdownPosition {
  const containerBottom = containerRect.bottom;
  const containerTop = containerRect.top;

  const fitsBelow = viewportHeight > containerBottom + dropdownHeight;
  const fitsAbove = containerTop > dropdownHeight;

  let direction: 'above' | 'below';

  if (forceDirection) {
    direction = forceDirection;
  } else if (!fitsBelow && fitsAbove) {
    direction = 'above';
  } else if (!fitsAbove && fitsBelow) {
    direction = 'below';
  } else {
    direction = 'below'; // Default: open below
  }

  const top = direction === 'above'
    ? containerTop - parentOffset.top - dropdownHeight
    : containerBottom - parentOffset.top;

  const left = containerRect.left - parentOffset.left;

  return { top, left, direction };
}

// ============================================================================
// Normalize Item (select2/data/select → _normalizeItem)
// ============================================================================

/**
 * Normalize a Select2 option item.
 * Replaces: select2/data/select _normalizeItem function
 * Ensures id and text are strings, adds default selected/disabled flags.
 */
export function normalizeItem(item: Partial<IMSSelect2Option> | string | number): IMSSelect2Option {
  if (typeof item === 'string' || typeof item === 'number') {
    item = { id: String(item), text: String(item) };
  }

  const normalized: IMSSelect2Option = {
    id: String(item.id ?? ''),
    text: String(item.text ?? ''),
    selected: item.selected ?? false,
    disabled: item.disabled ?? false,
  };

  if (item.title) normalized.title = item.title;
  if (item.children) normalized.children = item.children;
  if (item.element) normalized.element = item.element;

  // Copy any extra properties
  for (const key of Object.keys(item)) {
    if (!(key in normalized)) {
      (normalized as Record<string, unknown>)[key] = item[key as keyof typeof item];
    }
  }

  return normalized;
}

// ============================================================================
// Sort Options Helper
// ============================================================================

/**
 * Sort options for display, matching Select2 sorter behavior.
 * Supports grouping: group headers first, then children sorted within.
 */
export function sortOptions(
  options: IMSSelect2Option[],
  compareFn?: (a: IMSSelect2Option, b: IMSSelect2Option) => number
): IMSSelect2Option[] {
  const defaultCompare = (a: IMSSelect2Option, b: IMSSelect2Option) =>
    a.text.localeCompare(b.text);

  return [...options].sort(compareFn || defaultCompare);
}
