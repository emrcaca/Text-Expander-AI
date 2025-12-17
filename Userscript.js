// ==UserScript==
// @name         Text-Expander-AI + Hover Translator
// @namespace    https://github.com/emrcaca
// @version      1.0.2
// @description  Text Expander AI + Hover Çeviri
// @author       emrcaca
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      your.custom.api
// @connect      translate.googleapis.com
// @run-at       document-idle
// ==/UserScript==

/**
 *
 *    ███████╗███╗   ███╗██████╗  ██████╗ █████╗  ██████╗ █████╗
 *    ██╔════╝████╗ ████║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗
 *    █████╗  ██╔████╔██║██████╔╝██║     ███████║██║     ███████║
 *    ██╔══╝  ██║╚██╔╝██║██╔══██╗██║     ██╔══██║██║     ██╔══██║
 *    ███████╗██║ ╚═╝ ██║██║  ██║╚██████╗██║  ██║╚██████╗██║  ██║
 *    ╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 *
 *                    Text-Expander-AI
 *
 *    GitHub: https://github.com/emrcaca/Text-Expander-AI
 *    Copyright (c) 2025 emrcaca | MIT License
 *
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     CONSTANTS
     ═══════════════════════════════════════════════════════════════════════════ */

  const CONSTANTS = Object.freeze({
    STORAGE_KEY: 'te_config',
    Z_INDEX: {
      LOADER: 2147483647,
      TOOLTIP: 2147483646,
      MODAL: 2147483647,
    },
    SELECTORS: {
      TOOLTIP_ID: 'ht-tooltip',
    },
    TIMING: {
      TOOLTIP_HIDE_DELAY: 200,
      SELECTION_DEBOUNCE: 200,
      CLICK_THRESHOLD: 250,
      TRIPLE_CLICK_THRESHOLD: 600,
    },
    EDITABLE_INPUT_TYPES: Object.freeze(
      new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number'])
    ),
    LANGUAGES: Object.freeze([
      ['tr', 'Türkçe'],
      ['en', 'English'],
      ['de', 'Deutsch'],
      ['fr', 'Français'],
      ['es', 'Español'],
    ]),
  });

  /* ═══════════════════════════════════════════════════════════════════════════
     DEFAULT CONFIGURATION
     ═══════════════════════════════════════════════════════════════════════════ */

  const DEFAULT_CONFIG = Object.freeze({
    api: Object.freeze({
      url: 'https://your.custom.api/v1/chat/completions',
      key: 'sk-xxx',
      model: 'openai/gpt-oss-120b',
      timeout: 60000,
    }),
    timing: Object.freeze({
      debounce: 20,
      dotSpeed: 300,
    }),
    commands: Object.freeze({
      '-ai': 'You are a helpful assistant. You may ask clarifying questions when necessary. Provide a concise response. Return only the result.',
      '-tr': 'Akıcı ve doğal Türkçeye çevir. Yalnızca çeviriyi döndür. Soru sorma.',
      '-en': 'Translate into fluent, natural English. Return only the translation. Do not ask questions.',
      '-fix': 'Fix all grammar, spelling, and punctuation errors. Return only the corrected text. Do not ask questions.',
      '-imp': 'Improve grammar, style, flow, and readability while preserving the original meaning. Return only the improved text. Do not ask questions.',
      '-enh': 'Enhance the content with relevant details, examples, and formatting suggestions to increase impact. Return only the enhanced content. Do not ask questions.',
      '-sum': 'Summarize the input in a single concise sentence. Return only the summary. Do not ask questions.',
      '-frm': 'Rewrite the text in a formal, professional tone. Return only the rewritten text. Do not ask questions.',
      '-cas': 'Rewrite the text in a friendly, casual tone. Return only the rewritten text. Do not ask questions.',
      '--eng': 'Act as a prompt engineer and generate a clear, goal-oriented prompt based on user intent and constraints. Return only the prompt. Do not ask questions.',
      '--enh': 'Enhance a prompt for clarity, specificity, and effectiveness by adding useful constraints and examples. Return only the improved prompt. Do not ask questions.',
      '--imp': 'Improve the structure, tone, and precision of a prompt while preserving its original intent. Return only the improved prompt. Do not ask questions.'
    }),
    triggers: Object.freeze({
      'hi': 'Hello!',
      'selam': 'Merhaba!',
      'hello': 'Hello!',
      'hey': 'Hey there!',
      ':tel': '+90 555 555 55 55',
      ':email': 'info@ornek.com',
      ':address': 'Atatürk Cad. No:1, Bursa, Türkiye',
      ':yardım': 'Size nasıl yardımcı olabilirim.',
      ':help': 'How can I help you.',
      'thanks': 'Teşekkürler!',
      'thankyou': 'Thank you!',
      'bye': 'Hoşça kal!',
      'gorusuruz': 'Görüşmek üzere!',
      'office_hours': 'Pazartesi-Cuma 09:00-18:00',
      'calisma_saatleri': 'Pazartesi-Cuma 09:00-18:00',
      'support': 'Destek ekibimizle iletişime geçin: support@ornek.com',
      'faq': 'Sıkça sorulan sorular için: https://ornek.com/faq',
      'website': 'https://ornek.com',
      'instagram': 'https://instagram.com/ornek',
      'twitter': 'https://twitter.com/ornek',
      'linkedin': 'https://linkedin.com/company/ornek',
      'whatsapp': '+90 555 555 55 55',
      'pricing': 'Fiyatlandırma bilgileri için: https://ornek.com/pricing',
      'randevu': 'Randevu almak için: randevu@ornek.com',
      'iletisim': 'İletişim: +90 555 555 55 55 | info@ornek.com',
      'acil': 'Acil durumlar için lütfen 112\'yi arayın',
      'konum': 'Bizi haritada bulmak için: https://maps.google.com/?q=Ornek+Konum',
      'newsletter': 'Bültene kaydolmak için: https://ornek.com/newsletter',
      'privacy': 'Gizlilik politikası: https://ornek.com/privacy',
      'terms': 'Kullanım koşulları: https://ornek.com/terms',
      ':D': '😀'
    }),

    translator: Object.freeze({
      enabled: true,
      targetLang: 'tr',
      minChars: 2,
      maxChars: 2000,
    }),
    expander: Object.freeze({
      enabled: true,
    }),
  });

  /* ═══════════════════════════════════════════════════════════════════════════
     CONFIGURATION MANAGER
     ═══════════════════════════════════════════════════════════════════════════ */

  const ConfigManager = (() => {
    let config = null;
    let commandKeys = [];
    let triggerKeys = [];

    /**
     * Deep clone an object
     * @param {Object} obj
     * @returns {Object}
     */
    const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

    /**
     * Merge configurations with defaults
     * @param {Object} saved
     * @returns {Object}
     */
    const mergeWithDefaults = (saved) => ({
      ...DEFAULT_CONFIG,
      ...saved,
      api: { ...DEFAULT_CONFIG.api, ...(saved.api || {}) },
      timing: { ...DEFAULT_CONFIG.timing, ...(saved.timing || {}) },
      commands: saved.commands || { ...DEFAULT_CONFIG.commands },
      triggers: saved.triggers || { ...DEFAULT_CONFIG.triggers },
      translator: { ...DEFAULT_CONFIG.translator, ...(saved.translator || {}) },
      expander: { ...DEFAULT_CONFIG.expander, ...(saved.expander || {}) },
    });

    /**
     * Sort keys by length descending
     * @param {Object} obj
     * @returns {string[]}
     */
    const sortKeysByLength = (obj) =>
      Object.keys(obj || {}).sort((a, b) => b.length - a.length);

    /**
     * Update sorted key arrays
     */
    const updateKeys = () => {
      commandKeys = sortKeysByLength(config.commands);
      triggerKeys = sortKeysByLength(config.triggers);
    };

    /**
     * Load configuration from storage
     */
    const load = () => {
      config = deepClone(DEFAULT_CONFIG);
      try {
        const saved = GM_getValue(CONSTANTS.STORAGE_KEY);
        if (saved) {
          config = mergeWithDefaults(JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Config load failed:', e);
      }
      updateKeys();
    };

    /**
     * Save configuration to storage
     */
    const save = () => {
      try {
        GM_setValue(CONSTANTS.STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.warn('Config save failed:', e);
      }
    };

    /**
     * Reset configuration to defaults
     */
    const reset = () => {
      config = deepClone(DEFAULT_CONFIG);
      save();
      updateKeys();
    };

    /**
     * Get configuration value by path
     * @param {string} path - Dot-separated path (e.g., 'api.url')
     * @returns {*}
     */
    const get = (path) => {
      if (!path) return config;
      return path.split('.').reduce((obj, key) => obj?.[key], config);
    };

    /**
     * Set configuration value by path
     * @param {string} path - Dot-separated path
     * @param {*} value
     */
    const set = (path, value) => {
      const keys = path.split('.');
      const lastKey = keys.pop();
      const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
      }, config);
      target[lastKey] = value;
    };

    /**
     * Get full config object (mutable reference)
     * @returns {Object}
     */
    const getAll = () => config;

    /**
     * Get sorted command keys
     * @returns {string[]}
     */
    const getCommandKeys = () => commandKeys;

    /**
     * Get sorted trigger keys
     * @returns {string[]}
     */
    const getTriggerKeys = () => triggerKeys;

    /**
     * Refresh keys after config change
     */
    const refreshKeys = () => updateKeys();

    // Initialize on creation
    load();

    return Object.freeze({
      load,
      save,
      reset,
      get,
      set,
      getAll,
      getCommandKeys,
      getTriggerKeys,
      refreshKeys,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     STYLES
     ═══════════════════════════════════════════════════════════════════════════ */

  const Styles = (() => {
    const CSS = `
      /* Loader */
      .te-loader {
        position: fixed;
        z-index: ${CONSTANTS.Z_INDEX.LOADER};
        padding: 8px 12px;
        font: 500 13px system-ui, -apple-system, sans-serif;
        color: #e8e8e8;
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 1px solid #0f3460;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .te-loader::before {
        content: '';
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255,255,255,0.2);
        border-top-color: #e94560;
        border-radius: 50%;
        animation: te-spin .8s linear infinite;
        flex-shrink: 0;
      }
      .te-loader::after {
        content: 'ESC iptal';
        font-size: 10px;
        color: rgba(255,255,255,0.5);
        padding-left: 8px;
        border-left: 1px solid rgba(255,255,255,0.1);
        margin-left: auto;
      }
      @keyframes te-spin { to { transform: rotate(360deg) } }

      /* Tooltip */
      #${CONSTANTS.SELECTORS.TOOLTIP_ID} {
        position: absolute;
        background: #1a1a2e;
        color: #e8e8e8;
        padding: 8px 12px;
        border-radius: 6px;
        font: 13px system-ui, sans-serif;
        max-width: 400px;
        pointer-events: none;
        opacity: 0;
        transition: opacity .15s;
        transform: translateX(-50%);
        z-index: ${CONSTANTS.Z_INDEX.TOOLTIP};
        box-shadow: 0 4px 12px rgba(0,0,0,.4);
        display: none;
      }
      #${CONSTANTS.SELECTORS.TOOLTIP_ID}.show { opacity: 1; }
      #${CONSTANTS.SELECTORS.TOOLTIP_ID}::after {
        content: '';
        position: absolute;
        left: calc(50% + var(--ao, 0px));
        transform: translateX(-50%);
        border: 6px solid transparent;
      }
      #${CONSTANTS.SELECTORS.TOOLTIP_ID}[data-pos=top]::after {
        bottom: -12px;
        border-top-color: #1a1a2e;
      }
      #${CONSTANTS.SELECTORS.TOOLTIP_ID}[data-pos=bottom]::after {
        top: -12px;
        border-bottom-color: #1a1a2e;
      }

      /* Modal */
      .te-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.8);
        z-index: ${CONSTANTS.Z_INDEX.MODAL};
        display: none;
        align-items: center;
        justify-content: center;
        font-family: system-ui, sans-serif;
      }
      .te-modal.open { display: flex; }
      .te-modal-box {
        background: #141414;
        border: 1px solid #2d2d2d;
        border-radius: 8px;
        width: 520px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
      }
      .te-modal-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #2d2d2d;
      }
      .te-modal-title { font-size: 14px; font-weight: 600; color: #fff; }
      .te-modal-close {
        background: none;
        border: none;
        color: #666;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
      }
      .te-modal-close:hover { color: #fff; }
      .te-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }
      .te-modal-body::-webkit-scrollbar { width: 4px; }
      .te-modal-body::-webkit-scrollbar-thumb { background: #2d2d2d; border-radius: 2px; }

      /* Tabs */
      .te-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
      .te-tab {
        padding: 6px 12px;
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
        color: #888;
        font-size: 12px;
        cursor: pointer;
      }
      .te-tab.active { background: #e94560; border-color: #e94560; color: #fff; }

      /* Sections */
      .te-section { display: none; }
      .te-section.active { display: block; }

      /* Groups */
      .te-group { margin-bottom: 16px; }
      .te-group-title {
        font-size: 11px;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 8px;
        letter-spacing: .5px;
      }

      /* Rows */
      .te-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #1a1a1a;
      }
      .te-row:last-child { border: none; }
      .te-label { font-size: 12px; color: #ccc; }

      /* Toggle */
      .te-toggle {
        width: 36px;
        height: 20px;
        background: #2d2d2d;
        border-radius: 10px;
        cursor: pointer;
        position: relative;
        transition: background .2s;
      }
      .te-toggle.on { background: #e94560; }
      .te-toggle::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: #fff;
        border-radius: 50%;
        transition: transform .2s;
      }
      .te-toggle.on::after { transform: translateX(16px); }

      /* Form Elements */
      .te-input, .te-select {
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
        padding: 6px 8px;
        color: #fff;
        font-size: 12px;
        outline: none;
      }
      .te-textarea {
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
        padding: 8px;
        color: #fff;
        font-size: 12px;
        outline: none;
        resize: vertical;
        min-height: 60px;
        width: 100%;
        font-family: inherit;
        box-sizing: border-box;
      }

      /* List */
      .te-list {
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
        max-height: 180px;
        overflow-y: auto;
      }
      .te-list::-webkit-scrollbar { width: 4px; }
      .te-list::-webkit-scrollbar-thumb { background: #2d2d2d; border-radius: 2px; }
      .te-list-item {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        border-bottom: 1px solid #222;
        gap: 8px;
      }
      .te-list-item:last-child { border: none; }
      .te-list-key {
        font-family: monospace;
        color: #e94560;
        font-size: 12px;
        min-width: 60px;
        flex-shrink: 0;
      }
      .te-list-val {
        font-size: 11px;
        color: #888;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .te-list-del {
        background: none;
        border: none;
        color: #555;
        cursor: pointer;
        font-size: 14px;
        padding: 2px 6px;
      }
      .te-list-del:hover { color: #e94560; }

      /* Add Form */
      .te-add-form {
        margin-top: 12px;
        padding: 12px;
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
      }
      .te-add-row { display: flex; gap: 8px; margin-bottom: 8px; }
      .te-add-row:last-child { margin-bottom: 0; }

      /* Buttons */
      .te-btn {
        padding: 6px 12px;
        background: #e94560;
        border: none;
        border-radius: 4px;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
      }
      .te-btn:hover { background: #d63d56; }
      .te-btn-sm { padding: 4px 10px; }
      .te-btn-ghost { background: transparent; color: #888; }
      .te-btn-ghost:hover { color: #e94560; background: transparent; }
      .te-btn-full { width: 100%; }

      /* Footer */
      .te-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #2d2d2d;
      }

      /* Misc */
      .te-empty { padding: 16px; text-align: center; color: #555; font-size: 11px; }
      .te-help-item { padding: 10px 0; border-bottom: 1px solid #1a1a1a; }
      .te-help-item:last-child { border: none; }
      .te-help-q { font-size: 12px; color: #fff; margin-bottom: 4px; }
      .te-help-a { font-size: 11px; color: #666; line-height: 1.5; }
      .te-kbd {
        display: inline-block;
        padding: 2px 5px;
        background: #1a1a1a;
        border: 1px solid #2d2d2d;
        border-radius: 3px;
        font-size: 10px;
        font-family: monospace;
        color: #888;
      }
    `;

    const inject = () => GM_addStyle(CSS);

    return Object.freeze({ inject });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     DOM UTILITIES
     ═══════════════════════════════════════════════════════════════════════════ */

  const DOMUtils = (() => {
    // Native setters for React compatibility
    const inputSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    )?.set;
    const textareaSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    /**
     * Check if element is editable
     * @param {Element} el
     * @returns {boolean}
     */
    const isEditable = (el) => {
      if (!el || el.disabled || el.readOnly) return false;
      if (el.isContentEditable) return true;
      if (el.tagName === 'TEXTAREA') return true;
      if (el.tagName === 'INPUT') {
        const type = (el.type || 'text').toLowerCase();
        return CONSTANTS.EDITABLE_INPUT_TYPES.has(type);
      }
      return el.getAttribute?.('contenteditable') === 'true';
    };

    /**
     * Get active editable element
     * @returns {Element|null}
     */
    const getActiveEditable = () => {
      const el = document.activeElement;
      return isEditable(el) ? el : null;
    };

    /**
     * Get text content from element
     * @param {Element} el
     * @returns {string}
     */
    const getText = (el) => {
      if (!el) return '';
      return el.isContentEditable ? (el.textContent ?? '') : (el.value ?? '');
    };

    /**
     * Move cursor to end of element
     * @param {Element} el
     */
    const moveCursorToEnd = (el) => {
      requestAnimationFrame(() => {
        try {
          const sel = window.getSelection();
          if (!sel) return;
          sel.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          sel.addRange(range);
        } catch (e) {
          // Ignore cursor errors
        }
      });
    };

/**
 * Set text for input/textarea elements
 * @param {HTMLInputElement|HTMLTextAreaElement} el
 * @param {string} text
 */
const setInputText = (el, text) => {
  const setter = el.tagName === 'TEXTAREA' ? textareaSetter : inputSetter;

  if (setter) {
    setter.call(el, text);
  } else {
    el.value = text;
  }

  // React compatibility - tracker'a ESKİ değeri ver ki farkı algılasın
  const tracker = el._valueTracker;
  if (tracker) {
    tracker.setValue('');
  }

  // InputEvent kullan (Event değil)
  el.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: text
  }));
  el.dispatchEvent(new Event('change', { bubbles: true }));

  // Move cursor to end
  try {
    el.setSelectionRange?.(text.length, text.length);
  } catch (e) {
    // Ignore selection errors
  }
};

    /**
     * Set text for contenteditable elements
     * @param {Element} el
     * @param {string} text
     */
    const setContentEditableText = (el, text) => {
      el.focus();
      const sel = window.getSelection?.();
      const range = document.createRange();

      // Try InputEvent approach first
      try {
        range.selectNodeContents(el);
        sel?.removeAllRanges();
        sel?.addRange(range);

        const beforeInputEvent = new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: text,
          bubbles: true,
          cancelable: true,
        });

        if (!el.dispatchEvent(beforeInputEvent)) return;

        el.textContent = text;
        el.dispatchEvent(
          new InputEvent('input', {
            inputType: 'insertText',
            data: text,
            bubbles: true,
          })
        );
        moveCursorToEnd(el);
        return;
      } catch (e) {
        // Fall through to next method
      }

      // Try execCommand approach
      try {
        range.selectNodeContents(el);
        sel?.removeAllRanges();
        sel?.addRange(range);
        if (document.execCommand?.('selectAll')) {
          document.execCommand('insertText', false, text);
          moveCursorToEnd(el);
          return;
        }
      } catch (e) {
        // Fall through to fallback
      }

      // Fallback: direct assignment
      el.textContent = text;
      moveCursorToEnd(el);
    };

    /**
     * Set text content to element
     * @param {Element} el
     * @param {string} text
     */
    const setText = (el, text) => {
      if (!el) return;
      if (el.isContentEditable) {
        setContentEditableText(el, text);
      } else {
        setInputText(el, text);
      }
    };

    /**
     * Check if element has text selection
     * @param {Element} el
     * @returns {boolean}
     */
    const hasSelection = (el) => {
      if (!el) return false;
      if (el.isContentEditable) {
        const sel = window.getSelection();
        return sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;
      }
      return el.selectionStart !== el.selectionEnd;
    };

    /**
     * Check if cursor is at the end of the text
     * @param {Element} el
     * @returns {boolean}
     */
    const isCursorAtEnd = (el) => {
      if (!el) return false;
      if (el.isContentEditable) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return false;
        const range = sel.getRangeAt(0);
        if (!range.collapsed) return false;
        const textLength = el.textContent.length;
        const cursorPos = range.startOffset;
        return cursorPos === textLength;
      }
      return el.selectionStart === el.value.length;
    };

    /**
     * Clear selection in element
     * @param {Element} el
     */
    const clearSelection = (el) => {
      if (!el) return;
      if (el.isContentEditable) {
        moveCursorToEnd(el);
      } else {
        try {
          el.setSelectionRange(el.value.length, el.value.length);
        } catch (e) {
          // Ignore selection errors
        }
      }
    };

    /**
     * Create element helper
     * @param {string} tag
     * @param {string} [className]
     * @param {string} [textContent]
     * @returns {Element}
     */
    const createElement = (tag, className, textContent) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (textContent) el.textContent = textContent;
      return el;
    };

    return Object.freeze({
      isEditable,
      getActiveEditable,
      getText,
      setText,
      hasSelection,
      isCursorAtEnd,
      clearSelection,
      createElement,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     LOADER UI
     ═══════════════════════════════════════════════════════════════════════════ */

  const LoaderUI = (() => {
    let element = null;
    let animationTimer = null;
    let dotCount = 0;
    let labelText = '';

    /**
     * Show loader near target element
     * @param {Element} target
     * @param {string} label
     */
    const show = (target, label) => {
      hide();

      labelText = label.replace('-', '').toUpperCase();
      element = DOMUtils.createElement('div', 'te-loader', labelText + '...');
      document.body.appendChild(element);

      // Position loader
      const targetRect = target.getBoundingClientRect();
      const loaderRect = element.getBoundingClientRect();

      element.style.cssText = `
        top: ${targetRect.top + (targetRect.height - loaderRect.height) / 2}px;
        left: ${targetRect.left + (targetRect.width - loaderRect.width) / 2}px;
        width: ${loaderRect.width}px;
      `;

      // Start dot animation
      element.textContent = labelText + '.';
      dotCount = 1;

      animationTimer = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        if (element) {
          element.textContent = labelText + '.'.repeat(dotCount);
        }
      }, ConfigManager.get('timing.dotSpeed'));
    };

    /**
     * Hide loader
     */
    const hide = () => {
      clearInterval(animationTimer);
      element?.remove();
      element = null;
      animationTimer = null;
      dotCount = 0;
    };

    return Object.freeze({ show, hide });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     API SERVICE
     ═══════════════════════════════════════════════════════════════════════════ */

  const APIService = (() => {
    let currentRequest = null;

    /**
     * Call AI API with text and command
     * @param {string} text - User input text
     * @param {string} command - Command key (e.g., '-fix')
     * @returns {Promise<string>}
     */
    const call = (text, command) =>
      new Promise((resolve, reject) => {
        const config = ConfigManager.getAll();
        const prompt = config.commands?.[command];

        if (!prompt) {
          reject('NoPrompt');
          return;
        }

        currentRequest = GM_xmlhttpRequest({
          method: 'POST',
          url: config.api.url,
          timeout: config.api.timeout,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.api.key}`,
          },
          data: JSON.stringify({
            model: config.api.model,
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: text },
            ],
          }),
          onload: (response) => {
            currentRequest = null;
            try {
              const data = JSON.parse(response.responseText);
              const message = data?.choices?.[0]?.message?.content?.trim();
              if (message) {
                resolve(message);
              } else {
                reject('Empty');
              }
            } catch (e) {
              reject('Parse');
            }
          },
          onerror: () => {
            currentRequest = null;
            reject('Network');
          },
          ontimeout: () => {
            currentRequest = null;
            reject('Timeout');
          },
          onabort: () => {
            currentRequest = null;
            reject('Cancelled');
          },
        });
      });

    /**
     * Cancel current request
     */
    const cancel = () => {
      try {
        currentRequest?.abort();
      } catch (e) {
        // Ignore abort errors
      }
      currentRequest = null;
    };

    return Object.freeze({ call, cancel });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     UNDO MANAGER
     ═══════════════════════════════════════════════════════════════════════════ */

  const UndoManager = (() => {
    const stacks = new WeakMap();
    let lastAction = { element: null, afterText: null };

    /**
     * Get or create stack for element
     * @param {Element} el
     * @returns {{undo: Array, redo: Array}}
     */
    const getStack = (el) => {
      if (!stacks.has(el)) {
        stacks.set(el, { undo: [], redo: [] });
      }
      return stacks.get(el);
    };

    /**
     * Push new state to undo stack
     * @param {Element} el
     * @param {string} before
     * @param {string} after
     */
    const push = (el, before, after) => {
      const stack = getStack(el);
      stack.undo.push({ before, after });
      stack.redo = [];
      lastAction = { element: el, afterText: after };
    };

    /**
     * Undo last action
     * @param {Element} el
     * @returns {string|null}
     */
    const undo = (el) => {
      const stack = getStack(el);
      const item = stack.undo.pop();
      if (item) {
        stack.redo.push(item);
        return item.before;
      }
      return null;
    };

    /**
     * Redo last undone action
     * @param {Element} el
     * @returns {string|null}
     */
    const redo = (el) => {
      const stack = getStack(el);
      const item = stack.redo.pop();
      if (item) {
        stack.undo.push(item);
        return item.after;
      }
      return null;
    };

    /**
     * Check if undo is available
     * @param {Element} el
     * @returns {boolean}
     */
    const canUndo = (el) => getStack(el).undo.length > 0;

    /**
     * Check if redo is available
     * @param {Element} el
     * @returns {boolean}
     */
    const canRedo = (el) => getStack(el).redo.length > 0;

    /**
     * Check if quick undo (backspace) is available
     * @param {Element} el
     * @param {string} currentText
     * @returns {boolean}
     */
    const canQuickUndo = (el, currentText) => {
      return (
        lastAction.element === el &&
        lastAction.afterText === currentText &&
        canUndo(el)
      );
    };

    /**
     * Clear quick undo state
     */
    const clearQuickUndo = () => {
      lastAction = { element: null, afterText: null };
    };

    return Object.freeze({
      push,
      undo,
      redo,
      canUndo,
      canRedo,
      canQuickUndo,
      clearQuickUndo,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     TRANSLATOR SERVICE
     ═══════════════════════════════════════════════════════════════════════════ */

  const TranslatorService = (() => {
    let tooltip = null;
    const CACHE_KEY = 'te_translations_cache';
    let cache = new Map();
    let sequenceId = 0;
    let hideTimer = null;
    let selectionTimer = null;
    let clickTimes = [];
    let clickTimer = null;
    let lastClickTime = 0;

    // Load cache from localStorage
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        cache = new Map(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Translation cache load failed:', e);
      cache = new Map();
    }

    // Save cache to localStorage
    const saveCache = () => {
      try {
        const entries = [...cache.entries()];
        localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
      } catch (e) {
        console.warn('Translation cache save failed:', e);
      }
    };

    /**
     * Get or create tooltip element
     * @returns {Element}
     */
    const getTooltip = () => {
      if (tooltip && document.body.contains(tooltip)) return tooltip;

      tooltip?.remove();
      tooltip = DOMUtils.createElement('div');
      tooltip.id = CONSTANTS.SELECTORS.TOOLTIP_ID;
      document.body.appendChild(tooltip);
      return tooltip;
    };

    /**
     * Hide tooltip
     */
    const hide = () => {
      const t = tooltip;
      if (!t) return;

      t.classList.remove('show');
      clearTimeout(hideTimer);

      hideTimer = setTimeout(() => {
        if (!t.classList.contains('show')) {
          t.style.display = 'none';
        }
      }, CONSTANTS.TIMING.TOOLTIP_HIDE_DELAY);
    };

    /**
     * Show tooltip with content
     * @param {string} content
     * @param {{x: number, yTop: number, yBottom: number}} anchor
     */
    const show = (content, anchor) => {
      const t = getTooltip();
      clearTimeout(hideTimer);

      // Prepare for measurement
      t.classList.remove('show');
      t.style.display = 'block';
      t.style.visibility = 'hidden';
      t.textContent = content;

      // Calculate position
      const width = t.offsetWidth;
      const height = t.offsetHeight;
      const scrollY = window.pageYOffset;
      const scrollX = window.pageXOffset;

      // Determine position (top or bottom)
      let position = 'top';
      let top = scrollY + anchor.yTop - height - 10;
      if (top < scrollY + 10) {
        position = 'bottom';
        top = scrollY + anchor.yBottom + 10;
      }

      // Center horizontally with bounds checking
      const center = scrollX + anchor.x;
      const left = Math.max(
        scrollX + 10 + width / 2,
        Math.min(scrollX + window.innerWidth - 10 - width / 2, center)
      );

      // Arrow offset
      const arrowOffset = Math.max(
        -width / 2 + 12,
        Math.min(width / 2 - 12, center - left)
      );

      // Apply styles
      t.dataset.pos = position;
      t.style.left = `${left}px`;
      t.style.top = `${top}px`;
      t.style.setProperty('--ao', `${arrowOffset}px`);
      t.style.visibility = 'visible';

      requestAnimationFrame(() => t.classList.add('show'));
    };

    /**
     * Translate text using Google Translate API
     * @param {string} text
     * @returns {Promise<string|null>}
     */
    const translate = async (text) => {
      const key = text.trim();
      if (cache.has(key)) return cache.get(key);

      const targetLang = ConfigManager.get('translator.targetLang') || 'tr';

      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(key)}`,
          timeout: 15000,
          onload: (response) => {
            try {
              const data = JSON.parse(response.responseText);

              // Skip if source language is same as target
              if (data?.[2] === targetLang) {
                cache.set(key, null);
                saveCache();
                resolve(null);
                return;
              }

              // Extract translation
              const result = (Array.isArray(data?.[0]) ? data[0] : [])
                .map((x) => x?.[0])
                .filter(Boolean)
                .join('') || '';

              cache.set(key, result);
              saveCache();
              resolve(result);
            } catch (e) {
              reject(e);
            }
          },
          onerror: reject,
          ontimeout: () => reject('timeout'),
        });
      });
    };

    /**
     * Get current selection info
     * @returns {{text: string, anchor: Object|null}}
     */
    const getSelection = () => {
      const sel = window.getSelection();
      if (!sel?.rangeCount) return { text: '', anchor: null };

      const text = sel.toString().trim();
      const rect = sel.getRangeAt(0).getBoundingClientRect();

      const anchor =
        rect?.width || rect?.height
          ? {
              x: rect.left + rect.width / 2,
              yTop: rect.top,
              yBottom: rect.bottom,
            }
          : null;

      return { text, anchor };
    };

    /**
     * Perform translation on current selection
     */
    const performTranslation = async () => {
      const config = ConfigManager.get('translator');
      if (!config?.enabled) return;

      const { text, anchor } = getSelection();
      const minChars = config.minChars || 2;
      const maxChars = config.maxChars || 2000;

      // Validation
      if (!text || text.length < minChars || text.length > maxChars || !anchor) {
        hide();
        return;
      }

      // Skip if in editable element
      if (DOMUtils.isEditable(document.activeElement)) return;

      // Check cache
      const key = text.trim();
      if (cache.has(key)) {
        const cached = cache.get(key);
        if (cached === null) return;
        show(cached, anchor);
        return;
      }

      // Translate
      const currentSeq = ++sequenceId;
      lastClickTime = Date.now();

      try {
        const result = await translate(text);
        if (currentSeq !== sequenceId || result === null) return;
        show(result, anchor);
      } catch (e) {
        if (currentSeq === sequenceId) {
          show('Hata', anchor);
        }
      }
    };

    /**
     * Handle click events
     */
    const handleClick = () => {
      const now = Date.now();
      clickTimes.push(now);
      if (clickTimes.length > 3) clickTimes.shift();

      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        const times = clickTimes;
        const len = times.length;

        // Detect double or triple click
        const isDoubleClick =
          len >= 2 && times[len - 1] - times[len - 2] < CONSTANTS.TIMING.CLICK_THRESHOLD;
        const isTripleClick =
          len === 3 && times[2] - times[0] < CONSTANTS.TIMING.TRIPLE_CLICK_THRESHOLD;

        if (isDoubleClick || isTripleClick) {
          performTranslation();
        }
      }, CONSTANTS.TIMING.CLICK_THRESHOLD);
    };

    /**
     * Handle selection change
     */
    const handleSelectionChange = () => {
      clearTimeout(selectionTimer);
      selectionTimer = setTimeout(() => {
        const { text } = getSelection();
        if (!text) {
          hide();
          return;
        }
        // Avoid duplicate translation on click
        if (Date.now() - lastClickTime < 300) return;
        performTranslation();
      }, CONSTANTS.TIMING.SELECTION_DEBOUNCE);
    };

    /**
     * Initialize translator
     */
    const init = () => {
      getTooltip();
    };

    return Object.freeze({
      init,
      hide,
      handleClick,
      handleSelectionChange,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     SETTINGS MODAL
     ═══════════════════════════════════════════════════════════════════════════ */

  const SettingsModal = (() => {
    let modal = null;
    let activeTab = 'general';

    // Helper functions
    const make = (tag, className, text) =>
      DOMUtils.createElement(tag, className, text);

    /**
     * Create tab button
     */
    const createTab = (name, label) => {
      const isActive = activeTab === name;
      const tab = make('div', `te-tab${isActive ? ' active' : ''}`, label);
      tab.dataset.tab = name;
      tab.onclick = () => {
        activeTab = name;
        render();
      };
      return tab;
    };

    /**
     * Create toggle switch
     */
    const createToggle = (configPath, isOn) => {
      const toggle = make('div', `te-toggle${isOn ? ' on' : ''}`);
      toggle.dataset.cfg = configPath;
      toggle.onclick = () => toggle.classList.toggle('on');
      return toggle;
    };

    /**
     * Create labeled row
     */
    const createRow = (labelText, rightElement) => {
      const row = make('div', 'te-row');
      row.appendChild(make('span', 'te-label', labelText));
      row.appendChild(rightElement);
      return row;
    };

    /**
     * Create input field
     */
    const createInput = (type, placeholder, value, width) => {
      const input = document.createElement('input');
      input.className = 'te-input';
      input.type = type || 'text';
      if (placeholder) input.placeholder = placeholder;
      if (value !== undefined) input.value = value;
      if (width) input.style.width = width;
      return input;
    };

    /**
     * Create select dropdown
     */
    const createSelect = (options, selectedValue) => {
      const select = document.createElement('select');
      select.className = 'te-select';
      options.forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        if (value === selectedValue) option.selected = true;
        select.appendChild(option);
      });
      return select;
    };

    /**
     * Create textarea
     */
    const createTextarea = (placeholder) => {
      const textarea = document.createElement('textarea');
      textarea.className = 'te-textarea';
      if (placeholder) textarea.placeholder = placeholder;
      return textarea;
    };

    /**
     * Create list of items
     */
    const createList = (items, type) => {
      const list = make('div', 'te-list');
      const entries = Object.entries(items || {});

      if (!entries.length) {
        list.appendChild(make('div', 'te-empty', 'Henüz eklenmemiş'));
        return list;
      }

      entries.forEach(([key, value]) => {
        const item = make('div', 'te-list-item');
        item.dataset.type = type;
        item.dataset.key = key;

        item.appendChild(make('span', 'te-list-key', key));

        const valueSpan = make('span', 'te-list-val', value);
        valueSpan.title = value;
        item.appendChild(valueSpan);

        const deleteBtn = make('button', 'te-list-del', '×');
        deleteBtn.onclick = () => {
          const config = ConfigManager.getAll();
          if (config[type]) delete config[type][key];
          render();
        };
        item.appendChild(deleteBtn);

        list.appendChild(item);
      });

      return list;
    };

    /**
     * Create section container
     */
    const createSection = (name) => {
      const isActive = activeTab === name;
      return make('div', `te-section${isActive ? ' active' : ''}`);
    };

    /**
     * Create group container
     */
    const createGroup = (title) => {
      const group = make('div', 'te-group');
      group.appendChild(make('div', 'te-group-title', title));
      return group;
    };

    /**
     * Build General section
     */
    const buildGeneralSection = () => {
      const section = createSection('general');
      const config = ConfigManager.getAll();

      // Features group
      const featuresGroup = createGroup('Özellikler');
      featuresGroup.appendChild(
        createRow(
          'Text Expander',
          createToggle('expander.enabled', config.expander?.enabled)
        )
      );
      featuresGroup.appendChild(
        createRow(
          'Hover Çeviri',
          createToggle('translator.enabled', config.translator?.enabled)
        )
      );
      section.appendChild(featuresGroup);

      // API group
      const apiGroup = createGroup('API Ayarları');

      const urlInput = createInput('text', '', config.api?.url || '', '200px');
      urlInput.dataset.cfg = 'api.url';
      apiGroup.appendChild(createRow('URL', urlInput));

      const keyInput = createInput('password', '', config.api?.key || '', '200px');
      keyInput.dataset.cfg = 'api.key';
      apiGroup.appendChild(createRow('Key', keyInput));

      const modelInput = createInput('text', '', config.api?.model || '', '200px');
      modelInput.dataset.cfg = 'api.model';
      apiGroup.appendChild(createRow('Model', modelInput));

      section.appendChild(apiGroup);

      // Translation group
      const translationGroup = createGroup('Çeviri');
      const langSelect = createSelect(
        CONSTANTS.LANGUAGES,
        config.translator?.targetLang || 'tr'
      );
      langSelect.dataset.cfg = 'translator.targetLang';
      translationGroup.appendChild(createRow('Hedef Dil', langSelect));
      section.appendChild(translationGroup);

      return section;
    };

    /**
     * Build Commands section
     */
    const buildCommandsSection = () => {
      const section = createSection('commands');
      const config = ConfigManager.getAll();
      const group = createGroup('AI Komutları');

      group.appendChild(createList(config.commands, 'commands'));

      // Add form
      const form = make('div', 'te-add-form');

      const row1 = make('div', 'te-add-row');
      const keyInput = createInput('text', 'Komut (örn: -sum)', '', '120px');
      keyInput.id = 'te-cmd-key';
      row1.appendChild(keyInput);
      form.appendChild(row1);

      const row2 = make('div', 'te-add-row');
      const valTextarea = createTextarea('System prompt yazın...');
      valTextarea.id = 'te-cmd-val';
      row2.appendChild(valTextarea);
      form.appendChild(row2);

      const addBtn = make('button', 'te-btn te-btn-sm te-btn-full', '+ Komut Ekle');
      addBtn.onclick = () => {
        const key = document.getElementById('te-cmd-key')?.value.trim();
        const val = document.getElementById('te-cmd-val')?.value.trim();
        if (key && val) {
          const cfg = ConfigManager.getAll();
          if (!cfg.commands) cfg.commands = {};
          cfg.commands[key] = val;
          render();
        }
      };
      form.appendChild(addBtn);

      group.appendChild(form);
      section.appendChild(group);
      return section;
    };

    /**
     * Build Triggers section
     */
    const buildTriggersSection = () => {
      const section = createSection('triggers');
      const config = ConfigManager.getAll();
      const group = createGroup('Metin Triggerları');

      group.appendChild(createList(config.triggers, 'triggers'));

      // Add form
      const form = make('div', 'te-add-form');
      const row = make('div', 'te-add-row');

      const keyInput = createInput('text', 'Trigger (örn: :mail)', '', '120px');
      keyInput.id = 'te-trg-key';
      row.appendChild(keyInput);

      const valInput = createInput('text', 'Değiştirilecek metin', '');
      valInput.id = 'te-trg-val';
      valInput.style.flex = '1';
      row.appendChild(valInput);

      form.appendChild(row);

      const addBtn = make('button', 'te-btn te-btn-sm te-btn-full', '+ Trigger Ekle');
      addBtn.onclick = () => {
        const key = document.getElementById('te-trg-key')?.value.trim();
        const val = document.getElementById('te-trg-val')?.value.trim();
        if (key && val) {
          const cfg = ConfigManager.getAll();
          if (!cfg.triggers) cfg.triggers = {};
          cfg.triggers[key] = val;
          render();
        }
      };
      form.appendChild(addBtn);

      group.appendChild(form);
      section.appendChild(group);
      return section;
    };

    /**
     * Build Help section
     */
    const buildHelpSection = () => {
      const section = createSection('help');

      // Keyboard shortcuts
      const shortcutsGroup = createGroup('Klavye Kısayolları');
      const shortcuts = [
        ['Geri Al', 'Ctrl+Z'],
        ['İleri Al', 'Ctrl+Y'],
        ['Hızlı Geri', 'Backspace'],
        ['İptal', 'ESC'],
      ];
      shortcuts.forEach(([label, key]) => {
        shortcutsGroup.appendChild(createRow(label, make('span', 'te-kbd', key)));
      });
      section.appendChild(shortcutsGroup);

      // Usage guide
      const usageGroup = createGroup('Nasıl Kullanılır?');
      const usageItems = [
        ['Komutlar', 'Metin yazın ve sonuna komut ekleyin: "merhaba dünya -fix"'],
        ['Triggerlar', 'Trigger yazın, otomatik değişir: :tel → +90 555 555 55 55'],
        [
          'Çeviri',
          'Metni seçin, otomatik çevrilir. Hedef dildeki metinler çevrilmez.',
        ],
      ];
      usageItems.forEach(([question, answer]) => {
        const item = make('div', 'te-help-item');
        item.appendChild(make('div', 'te-help-q', question));
        item.appendChild(make('div', 'te-help-a', answer));
        usageGroup.appendChild(item);
      });
      section.appendChild(usageGroup);

      return section;
    };

    /**
     * Save settings from modal
     */
    const saveSettings = () => {
      modal.querySelectorAll('[data-cfg]').forEach((el) => {
        const path = el.dataset.cfg;
        let value;

        if (el.classList.contains('te-toggle')) {
          value = el.classList.contains('on');
        } else {
          value = el.value;
        }

        ConfigManager.set(path, value);
      });

      ConfigManager.save();
      ConfigManager.refreshKeys();
      close();
    };

    /**
     * Render modal
     */
    const render = () => {
      if (modal) modal.remove();

      // Create modal backdrop
      modal = make('div', 'te-modal open');

      // Modal box
      const box = make('div', 'te-modal-box');

      // Header
      const header = make('div', 'te-modal-head');
      header.appendChild(make('span', 'te-modal-title', 'Ayarlar'));

      const closeBtn = make('button', 'te-modal-close', '×');
      closeBtn.onclick = close;
      header.appendChild(closeBtn);
      box.appendChild(header);

      // Body
      const body = make('div', 'te-modal-body');

      // Tabs
      const tabs = make('div', 'te-tabs');
      tabs.appendChild(createTab('general', 'Genel'));
      tabs.appendChild(createTab('commands', 'Komutlar'));
      tabs.appendChild(createTab('triggers', 'Triggerlar'));
      tabs.appendChild(createTab('help', 'Yardım'));
      body.appendChild(tabs);

      // Sections
      body.appendChild(buildGeneralSection());
      body.appendChild(buildCommandsSection());
      body.appendChild(buildTriggersSection());
      body.appendChild(buildHelpSection());

      box.appendChild(body);

      // Footer
      const footer = make('div', 'te-footer');

      const resetBtn = make('button', 'te-btn te-btn-ghost', 'Sıfırla');
      resetBtn.onclick = () => {
        if (confirm('Tüm ayarlar sıfırlansın mı?')) {
          ConfigManager.reset();
          render();
        }
      };

      const saveBtn = make('button', 'te-btn', 'Kaydet');
      saveBtn.onclick = saveSettings;

      footer.appendChild(resetBtn);
      footer.appendChild(saveBtn);
      box.appendChild(footer);

      modal.appendChild(box);

      // Close on backdrop click
      modal.onclick = (e) => {
        if (e.target === modal) close();
      };

      document.body.appendChild(modal);
    };

    /**
     * Close modal
     */
    const close = () => {
      if (modal) {
        modal.remove();
        modal = null;
      }
    };

    /**
     * Open modal
     */
    const open = () => render();

    return Object.freeze({ open, close });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     TEXT EXPANDER ENGINE
     ═══════════════════════════════════════════════════════════════════════════ */

  const ExpanderEngine = (() => {
    let isBusy = false;
    let shouldSkip = false;
    let debounceTimer = null;

    /**
     * Schedule check with debounce
     */
    const scheduleCheck = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(check, ConfigManager.get('timing.debounce'));
    };

    /**
     * Check for commands and triggers
     */
    const check = () => {
      if (!ConfigManager.get('expander.enabled') || isBusy || shouldSkip) {
        shouldSkip = false;
        return;
      }

      const element = DOMUtils.getActiveEditable();
      if (!element || DOMUtils.hasSelection(element)) return;

      const text = DOMUtils.getText(element);
      if (!text) return;

      // Check commands
      for (const cmd of ConfigManager.getCommandKeys()) {
        if (text.endsWith(cmd) && ConfigManager.get(`commands.${cmd}`)) {
          executeCommand(element, text, cmd);
          return;
        }
      }

      // Check triggers
      for (const trg of ConfigManager.getTriggerKeys()) {
        const replacement = ConfigManager.get(`triggers.${trg}`);
        if (text.endsWith(trg) && replacement !== undefined) {
          executeTrigger(element, text, trg, replacement);
          return;
        }
      }
    };

    /**
     * Execute AI command
     */
    const executeCommand = async (element, text, command) => {
      const input = text.slice(0, -command.length).trim();
      if (!input || isBusy) return;

      isBusy = true;
      const originalText = text;
      LoaderUI.show(element, command);

      try {
        const result = await APIService.call(input, command);
        UndoManager.push(element, originalText, result);
        DOMUtils.setText(element, result);
      } catch (error) {
        if (error === 'Cancelled') {
          DOMUtils.setText(element, originalText);
        } else {
          const errorText = `${input} [${error}]`;
          UndoManager.push(element, originalText, errorText);
          DOMUtils.setText(element, errorText);
        }
      } finally {
        LoaderUI.hide();
        isBusy = false;
      }
    };

    /**
     * Execute trigger replacement
     */
    const executeTrigger = (element, text, trigger, replacement) => {
      const result = text.slice(0, -trigger.length) + replacement;
      UndoManager.push(element, text, result);
      DOMUtils.setText(element, result);
    };

    /**
     * Cancel current operation
     */
    const cancel = () => {
      APIService.cancel();
      LoaderUI.hide();
      isBusy = false;
    };

    /**
     * Set skip flag
     */
    const skip = () => {
      shouldSkip = true;
    };

    /**
     * Check if busy
     */
    const busy = () => isBusy;

    return Object.freeze({
      scheduleCheck,
      cancel,
      skip,
      busy,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     EVENT HANDLERS
     ═══════════════════════════════════════════════════════════════════════════ */

  const EventHandlers = (() => {
    /**
     * Handle input events
     */
    const onInput = (e) => {
      const inputType = e.inputType;

      // Skip native undo/redo
      if (inputType === 'historyUndo' || inputType === 'historyRedo') {
        requestAnimationFrame(() => {
          DOMUtils.clearSelection(DOMUtils.getActiveEditable());
        });
        ExpanderEngine.skip();
        return;
      }

      // Schedule check for insert/delete operations
      if (!inputType || /^(insert|delete)/.test(inputType)) {
        ExpanderEngine.scheduleCheck();
      }
    };

    /**
     * Handle keydown events
     */
    const onKeydown = (e) => {
      const element = DOMUtils.getActiveEditable();
      const key = e.key;

      // Ignore modifier keys
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) return;

      // ESC key handling
      if (key === 'Escape') {
        TranslatorService.hide();
        SettingsModal.close();

        if (ExpanderEngine.busy()) {
          e.preventDefault();
          ExpanderEngine.cancel();
          return;
        }
      }

      if (!element) return;

      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z' && !e.shiftKey) {
        if (UndoManager.canUndo(element)) {
          e.preventDefault();
          const text = UndoManager.undo(element);
          if (text !== null) DOMUtils.setText(element, text);
          UndoManager.clearQuickUndo();
          ExpanderEngine.skip();
          return;
        }
      }

      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (key.toLowerCase() === 'y' || (key.toLowerCase() === 'z' && e.shiftKey))
      ) {
        if (UndoManager.canRedo(element)) {
          e.preventDefault();
          const text = UndoManager.redo(element);
          if (text !== null) DOMUtils.setText(element, text);
          ExpanderEngine.skip();
          return;
        }
      }

      // Backspace: Quick undo (only when cursor is at the end)
      if (key === 'Backspace' && !DOMUtils.hasSelection(element) && DOMUtils.isCursorAtEnd(element)) {
        const currentText = DOMUtils.getText(element);
        if (UndoManager.canQuickUndo(element, currentText)) {
          e.preventDefault();
          const text = UndoManager.undo(element);
          if (text !== null) DOMUtils.setText(element, text);
          UndoManager.clearQuickUndo();
          ExpanderEngine.skip();
          return;
        }
      }

      // Navigation keys
      if (/^(Arrow|Home|End|Page)/.test(key)) {
        ExpanderEngine.skip();
        return;
      }

      ExpanderEngine.scheduleCheck();
    };

    /**
     * Handle keyup events (for translator)
     */
    const onKeyup = (e) => {
      if (e.key.startsWith('Arrow') || e.key === 'Shift') {
        TranslatorService.handleSelectionChange();
      }
    };

    /**
     * Handle mousedown
     */
    const onMousedown = () => {
      ExpanderEngine.skip();
    };

    /**
     * Handle focus in
     */
    const onFocusin = () => {
      ExpanderEngine.skip();
    };

    /**
     * Handle scroll
     */
    const onScroll = () => {
      TranslatorService.hide();
    };

    return Object.freeze({
      onInput,
      onKeydown,
      onKeyup,
      onMousedown,
      onFocusin,
      onScroll,
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════════════════════════════════════════ */

  const App = (() => {
    /**
     * Register all event listeners
     */
    const registerEventListeners = () => {
      // Input handling
      document.addEventListener('input', EventHandlers.onInput, true);
      document.addEventListener('keydown', EventHandlers.onKeydown, true);
      document.addEventListener('keyup', EventHandlers.onKeyup);

      // Focus handling
      document.addEventListener('mousedown', EventHandlers.onMousedown, true);
      document.addEventListener('focusin', EventHandlers.onFocusin, true);

      // Translator events
      document.addEventListener('click', TranslatorService.handleClick, {
        passive: true,
      });
      document.addEventListener('mouseup', TranslatorService.handleSelectionChange, {
        passive: true,
      });
      window.addEventListener('scroll', EventHandlers.onScroll, { passive: true });
    };

    /**
     * Log startup message
     */
    const logStartup = () => {
      console.log(
        '%cText Expander AI + Hover Translator%c -fix -ai | "1-4 | CTRL+Z/Y',
        'background:#e94560;color:#fff;padding:2px 8px;border-radius:3px 0 0 3px;font-weight:700',
        'background:#1a1a2e;color:#e8e8e8;padding:2px 8px;border-radius:0 3px 3px 0'
      );
    };

    /**
     * Initialize the application
     */
    const init = () => {
      // Inject styles
      Styles.inject();

      // Initialize translator
      TranslatorService.init();

      // Register event listeners
      registerEventListeners();

      // Register menu command
      GM_registerMenuCommand('⚙ Ayarlar', SettingsModal.open);

      // Log startup
      logStartup();
    };

    return Object.freeze({ init });
  })();

  // Start the application
  App.init();
})();
