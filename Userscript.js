// ==UserScript==
// @name         Text-Expander-AI
// @namespace    https://github.com/emrcaca
// @version      1.0.1
// @description  Text expander with AI commands + Hover translation + Settings Panel
// @author       emrcaca
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      your.custom.api
// @connect      discord.com
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
 *    GitHub: https://github.com/emrcaca/AI-Text-Improver
 *    Copyright (c) 2025 emrcaca | MIT License
 *
 */

(function() {
    'use strict';

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                              CONFIGURATION                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const CONFIG = {
        // AI API Settings
        ai: {
            url: "https://your.custom.api/v1/chat/completions",
            key: "sk-xxx",
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            topP: 0.8,
            maxTokens: 2000,
            timeout: 60000
        },

        // Discord Webhook
        discord: {
            webhookUrl: "https://discord.com/api/webhooks/....",
            username: "Notes"
        },

        // Translator Settings
        translator: {
            targetLang: 'tr',
            minChars: 1,
            maxChars: 2000,
            tooltipGap: 12,
            edgePadding: 10,
            debounce: 300,
            hideDelay: 200,
            timeout: 15000
        },

        // Dots Animation
        dots: {
            enabled: true,
            speed: 300,
            text: 'AI calisiyor'
        },

        // Text Expander Settings
        expander: {
            wordBoundary: true,
            debounceDelay: 10,
            aiCommandDelay: 500,
            debug: false
        }
    };

    // AI System Prompts
    const AI_PROMPTS = {
        '-ai':  'You are a helpful assistant. Provide a concise and helpful response. Return only the result.',
        '-fix': 'Fix all grammar, spelling, and punctuation errors. Return only the corrected text without any explanation.',
        '-imp': 'Improve the text to be clearer, more concise, and impactful while preserving its meaning. Return only the improved text.',
        '-gen': 'Expand the text into a detailed, natural response maintaining the same tone. Return only the expanded text.',
        '-en':  'Translate into fluent, natural English. Return only the translation.',
        '-tr':  'Akici ve dogal Turkceye cevir. Sadece ceviriyi dondur.',
        '-sum': 'Summarize concisely. Return only the summary.',
        '-frm': 'Rewrite in a formal and professional style. Return only the rewritten text.',
        '-cas': 'Rewrite in a casual, friendly tone. Return only the rewritten text.'
    };

    // Webhook Commands
    const WEBHOOK_COMMANDS = ['-wh'];

    // Default Text Triggers
    const DEFAULT_TRIGGERS = [
        { trigger: '"1', replace: 'Owo h', type: 'static' },
        { trigger: '"2', replace: 'Owo b', type: 'static' },
        { trigger: '"3', replace: 'Owo', type: 'static' },
        { trigger: '"4', replace: 'Owo pray', type: 'static' },
        { trigger: ':check', replace: '✓', type: 'static' },
        { trigger: ':cross', replace: '✗', type: 'static' },
        { trigger: ':heart', replace: '❤️', type: 'static' },
        { trigger: ':tarih', replace: 'date_tr', type: 'dynamic' },
        { trigger: ':date', replace: 'date_en', type: 'dynamic' },
        { trigger: ':saat', replace: 'time_tr', type: 'dynamic' },
        { trigger: ':time', replace: 'time_en', type: 'dynamic' },
        { trigger: ':gun', replace: 'day_tr', type: 'dynamic' }
    ];

    // Dynamic value generators
    const DYNAMIC_VALUES = {
        'date_tr': () => new Date().toLocaleDateString('tr-TR'),
        'date_en': () => new Date().toLocaleDateString('en-US'),
        'time_tr': () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        'time_en': () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        'day_tr': () => ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'][new Date().getDay()],
        'day_en': () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
        'year': () => new Date().getFullYear().toString(),
        'month_tr': () => ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'][new Date().getMonth()],
        'timestamp': () => Date.now().toString()
    };

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                            STORAGE MANAGER                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const Storage = {
        key: 'te_triggers_v1',

        get: () => {
            try {
                const data = GM_getValue(Storage.key, null);
                if (data) return JSON.parse(data);
            } catch (e) {
                console.error('[TE] Storage read error:', e);
            }
            return null;
        },

        set: (triggers) => {
            try {
                GM_setValue(Storage.key, JSON.stringify(triggers));
                return true;
            } catch (e) {
                console.error('[TE] Storage write error:', e);
                return false;
            }
        },

        reset: () => {
            Storage.set(DEFAULT_TRIGGERS);
            return DEFAULT_TRIGGERS;
        }
    };

    // Load triggers from storage or use defaults
    let TRIGGERS = Storage.get() || [...DEFAULT_TRIGGERS];

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                                 STYLES                                     ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    GM_addStyle(`
        :root {
            --te-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            --te-bg-solid: #1a1a2e;
            --te-border: #0f3460;
            --te-accent: #e94560;
            --te-accent-hover: #ff6b6b;
            --te-success: #4ade80;
            --te-warning: #fbbf24;
            --te-text: #e8e8e8;
            --te-text-dim: rgba(255, 255, 255, 0.5);
            --te-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
            --te-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Dots Indicator */
        .te-dots {
            position: fixed;
            background: var(--te-bg);
            border: 1px solid var(--te-border);
            border-radius: 8px;
            padding: 10px 16px;
            font-size: 13px;
            color: var(--te-text);
            font-weight: 500;
            z-index: 999999;
            pointer-events: none;
            box-shadow: var(--te-shadow);
            font-family: var(--te-font);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .te-dots__spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: var(--te-accent);
            border-radius: 50%;
            animation: te-spin 0.8s linear infinite;
        }

        .te-dots__text { min-width: 110px; }

        .te-dots__hint {
            font-size: 11px;
            color: var(--te-text-dim);
            padding-left: 10px;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        @keyframes te-spin { to { transform: rotate(360deg); } }

        /* Help Modal */
        .te-modal {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--te-bg);
            border: 1px solid var(--te-border);
            border-radius: 10px;
            font-size: 12px;
            color: var(--te-text);
            z-index: 999999;
            box-shadow: var(--te-shadow);
            font-family: var(--te-font);
            min-width: 280px;
            max-width: 320px;
            opacity: 0;
            transform: translateY(10px) scale(0.95);
            transition: opacity 0.2s, transform 0.2s;
            pointer-events: none;
        }

        .te-modal--visible {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

        .te-modal__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .te-modal__title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 13px;
        }

        .te-modal__icon {
            width: 18px;
            height: 18px;
            background: var(--te-accent);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }

        .te-modal__close {
            background: none;
            border: none;
            color: var(--te-text-dim);
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            line-height: 1;
            transition: color 0.15s;
        }

        .te-modal__close:hover { color: var(--te-accent); }

        .te-modal__content {
            padding: 12px 14px;
            max-height: 300px;
            overflow-y: auto;
        }

        .te-modal__section { margin-bottom: 12px; }
        .te-modal__section:last-child { margin-bottom: 0; }

        .te-modal__label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--te-accent);
            margin-bottom: 6px;
            font-weight: 600;
        }

        .te-modal__grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 4px 12px;
        }

        .te-modal__cmd {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 11px;
            background: rgba(255, 255, 255, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            color: #7dd3fc;
        }

        .te-modal__desc {
            color: var(--te-text-dim);
            font-size: 11px;
        }

        .te-modal__footer {
            padding: 8px 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 10px;
            color: var(--te-text-dim);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .te-modal__footer kbd {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 5px;
            border-radius: 3px;
        }

        .te-modal__settings-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: var(--te-text);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 10px;
            transition: background 0.15s;
        }

        .te-modal__settings-btn:hover {
            background: var(--te-accent);
        }

        .te-modal__content::-webkit-scrollbar { width: 6px; }
        .te-modal__content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }

        /* Settings Panel */
        .te-settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
        }

        .te-settings-overlay--visible {
            opacity: 1;
            visibility: visible;
        }

        .te-settings {
            background: var(--te-bg-solid);
            border: 1px solid var(--te-border);
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            box-shadow: var(--te-shadow);
            font-family: var(--te-font);
            color: var(--te-text);
            transform: scale(0.95);
            transition: transform 0.2s;
        }

        .te-settings-overlay--visible .te-settings {
            transform: scale(1);
        }

        .te-settings__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .te-settings__title {
            font-size: 16px;
            font-weight: 600;
        }

        .te-settings__header-actions {
            display: flex;
            gap: 8px;
        }

        .te-settings__close {
            background: none;
            border: none;
            color: var(--te-text-dim);
            cursor: pointer;
            padding: 6px;
            font-size: 20px;
            line-height: 1;
            transition: color 0.15s;
            border-radius: 4px;
        }

        .te-settings__close:hover {
            color: var(--te-accent);
            background: rgba(255, 255, 255, 0.05);
        }

        .te-settings__tabs {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0 20px;
        }

        .te-settings__tab {
            background: none;
            border: none;
            color: var(--te-text-dim);
            padding: 12px 16px;
            cursor: pointer;
            font-size: 13px;
            border-bottom: 2px solid transparent;
            margin-bottom: -1px;
            transition: color 0.15s, border-color 0.15s;
        }

        .te-settings__tab:hover {
            color: var(--te-text);
        }

        .te-settings__tab--active {
            color: var(--te-accent);
            border-bottom-color: var(--te-accent);
        }

        .te-settings__body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }

        .te-settings__body::-webkit-scrollbar { width: 8px; }
        .te-settings__body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }

        /* Triggers List */
        .te-triggers {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .te-triggers__add-form {
            display: grid;
            grid-template-columns: 1fr 2fr auto auto;
            gap: 10px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px dashed rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .te-triggers__input {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            color: var(--te-text);
            font-size: 13px;
            font-family: var(--te-font);
            transition: border-color 0.15s;
        }

        .te-triggers__input:focus {
            outline: none;
            border-color: var(--te-accent);
        }

        .te-triggers__input::placeholder {
            color: var(--te-text-dim);
        }

        .te-triggers__select {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 8px 12px;
            color: var(--te-text);
            font-size: 13px;
            cursor: pointer;
        }

        .te-triggers__select option {
            background: var(--te-bg-solid);
            color: var(--te-text);
        }

        .te-triggers__btn {
            background: var(--te-accent);
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            color: white;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.15s;
            white-space: nowrap;
        }

        .te-triggers__btn:hover {
            background: var(--te-accent-hover);
        }

        .te-triggers__btn--secondary {
            background: rgba(255, 255, 255, 0.1);
        }

        .te-triggers__btn--secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .te-triggers__btn--danger {
            background: transparent;
            color: var(--te-accent);
            padding: 6px 10px;
        }

        .te-triggers__btn--danger:hover {
            background: rgba(233, 69, 96, 0.2);
        }

        .te-triggers__item {
            display: grid;
            grid-template-columns: 120px 1fr auto auto;
            gap: 12px;
            align-items: center;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            transition: background 0.15s;
        }

        .te-triggers__item:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .te-triggers__item--editing {
            grid-template-columns: 1fr 2fr auto auto auto;
        }

        .te-triggers__trigger {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
            background: rgba(125, 211, 252, 0.15);
            color: #7dd3fc;
            padding: 4px 8px;
            border-radius: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .te-triggers__replace {
            font-size: 13px;
            color: var(--te-text-dim);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .te-triggers__type {
            font-size: 10px;
            text-transform: uppercase;
            padding: 3px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            color: var(--te-text-dim);
        }

        .te-triggers__type--dynamic {
            background: rgba(251, 191, 36, 0.2);
            color: var(--te-warning);
        }

        .te-triggers__actions {
            display: flex;
            gap: 4px;
        }

        .te-triggers__empty {
            text-align: center;
            padding: 40px 20px;
            color: var(--te-text-dim);
        }

        /* Settings Footer */
        .te-settings__footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(0, 0, 0, 0.2);
        }

        .te-settings__footer-info {
            font-size: 11px;
            color: var(--te-text-dim);
        }

        .te-settings__footer-actions {
            display: flex;
            gap: 10px;
        }

        /* Import/Export */
        .te-settings__section {
            margin-bottom: 24px;
        }

        .te-settings__section-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--te-accent);
            margin-bottom: 12px;
            font-weight: 600;
        }

        .te-settings__row {
            display: flex;
            gap: 10px;
            margin-bottom: 12px;
        }

        .te-settings__textarea {
            width: 100%;
            min-height: 120px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px;
            color: var(--te-text);
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 11px;
            resize: vertical;
        }

        .te-settings__textarea:focus {
            outline: none;
            border-color: var(--te-accent);
        }

        /* Toast */
        .te-toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--te-bg-solid);
            border: 1px solid var(--te-border);
            border-radius: 8px;
            padding: 12px 20px;
            color: var(--te-text);
            font-family: var(--te-font);
            font-size: 13px;
            z-index: 99999999;
            box-shadow: var(--te-shadow);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
        }

        .te-toast--visible {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }

        .te-toast--success {
            border-left: 3px solid var(--te-success);
        }

        .te-toast--error {
            border-left: 3px solid var(--te-accent);
        }

        /* Translator Tooltip */
        .te-tooltip {
            position: absolute;
            background: var(--te-bg);
            color: var(--te-text);
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid var(--te-border);
            font-size: 14px;
            line-height: 1.6;
            max-width: 400px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s, transform 0.15s;
            transform: translateX(-50%) translateY(4px);
            z-index: 999998;
            box-shadow: var(--te-shadow);
            display: none;
            word-break: break-word;
            font-family: var(--te-font);
        }

        .te-tooltip--visible {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .te-tooltip::after {
            content: '';
            position: absolute;
            left: calc(50% + var(--arrow-offset, 0px));
            transform: translateX(-50%);
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
        }

        .te-tooltip[data-pos="top"]::after {
            bottom: -8px;
            border-top: 8px solid #16213e;
        }

        .te-tooltip[data-pos="bottom"]::after {
            top: -8px;
            border-bottom: 8px solid #1a1a2e;
        }

        .te-tooltip__loading {
            display: inline-flex;
            gap: 10px;
            align-items: center;
        }

        .te-tooltip__spinner {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: var(--te-accent);
            animation: te-spin 0.8s linear infinite;
        }
    `);

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                            UTILITY FUNCTIONS                               ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const Utils = {
        escapeRegex: (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

        escapeHtml: (str) => String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;'),

        clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

        log: (...args) => CONFIG.expander.debug && console.log('[TE]', ...args)
    };

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                               TOAST                                        ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const Toast = (() => {
        let toast = null;
        let timeout = null;

        const show = (message, type = 'success', duration = 3000) => {
            if (!toast) {
                toast = document.createElement('div');
                toast.className = 'te-toast';
                document.body.appendChild(toast);
            }

            clearTimeout(timeout);
            toast.textContent = message;
            toast.className = `te-toast te-toast--${type}`;

            requestAnimationFrame(() => {
                toast.classList.add('te-toast--visible');
            });

            timeout = setTimeout(() => {
                toast.classList.remove('te-toast--visible');
            }, duration);
        };

        return { show };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                      UNIVERSAL TEXT SETTER (DOM PRESERVED)                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    class UniversalTextSetter {
        static getText(element) {
            if (!element) return '';

            if (element.isContentEditable) {
                return element.innerText || element.textContent || '';
            }

            return element.value || '';
        }

        static setText(element, text) {
            if (!element) return;
            const textStr = String(text);
            if (element.isContentEditable) {
                this.setContentEditable(element, textStr);
            } else {
                this.setInputValue(element, textStr);
            }
        }

        static setInputValue(element, text) {
            const tagName = element.tagName;
            const prototype = tagName === 'TEXTAREA'
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

            const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
            if (nativeSetter) {
                nativeSetter.call(element, text);
            } else {
                element.value = text;
            }

            element._valueTracker?.setValue(text);
            element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));

            try {
                element.setSelectionRange?.(text.length, text.length);
            } catch {}
        }

        static setContentEditable(element, text) {
            element.focus();
            const selection = window.getSelection();
            const range = document.createRange();

            try {
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);

                const beforeInputEvent = new InputEvent('beforeinput', {
                    inputType: 'insertText',
                    data: text,
                    bubbles: true,
                    cancelable: true
                });

                if (!element.dispatchEvent(beforeInputEvent)) return;

                element.textContent = text;

                element.dispatchEvent(new InputEvent('input', {
                    inputType: 'insertText',
                    data: text,
                    bubbles: true
                }));

                range.selectNodeContents(element);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
                return;
            } catch (e) {}

            try {
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                if (document.execCommand('selectAll', false, null)) {
                    document.execCommand('insertText', false, text);
                    return;
                }
            } catch (e) {}

            element.textContent = text;
            try {
                range.selectNodeContents(element);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch {}
        }

        static isEditable(element) {
            if (!element) return false;
            return element.tagName === 'INPUT' ||
                   element.tagName === 'TEXTAREA' ||
                   element.isContentEditable ||
                   element.getAttribute('contenteditable') === 'true';
        }

        static getActiveEditable() {
            const el = document.activeElement;
            return this.isEditable(el) ? el : null;
        }
    }

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                              DOTS ANIMATION                                ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const DotsAnimation = (() => {
        let interval = null;
        let indicator = null;
        let count = 0;

        const start = (element) => {
            stop();

            indicator = document.createElement('div');
            indicator.className = 'te-dots';
            indicator.innerHTML = `
                <div class="te-dots__spinner"></div>
                <span class="te-dots__text">${CONFIG.dots.text}</span>
                <span class="te-dots__hint">ESC iptal</span>
            `;

            const rect = element.getBoundingClientRect();
            indicator.style.top = `${Math.max(10, rect.top - 50)}px`;
            indicator.style.left = `${rect.left}px`;

            document.body.appendChild(indicator);

            const ir = indicator.getBoundingClientRect();
            if (ir.right > window.innerWidth - 10) {
                indicator.style.left = `${window.innerWidth - ir.width - 10}px`;
            }

            interval = setInterval(() => {
                if (!indicator) return;
                count = (count + 1) % 4;
                const textEl = indicator.querySelector('.te-dots__text');
                if (textEl) textEl.textContent = `${CONFIG.dots.text}${'.'.repeat(count)}`;
            }, CONFIG.dots.speed);
        };

        const stop = () => {
            if (interval) { clearInterval(interval); interval = null; }
            if (indicator) { indicator.remove(); indicator = null; }
            count = 0;
        };

        return { start, stop };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                            SETTINGS PANEL                                  ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const SettingsPanel = (() => {
        let overlay = null;
        let visible = false;
        let currentTab = 'triggers';
        let editingIndex = -1;

        const create = () => {
            if (overlay) return overlay;

            overlay = document.createElement('div');
            overlay.className = 'te-settings-overlay';
            overlay.innerHTML = `
                <div class="te-settings">
                    <div class="te-settings__header">
                        <div class="te-settings__title">Text Expander Ayarlari</div>
                        <div class="te-settings__header-actions">
                            <button class="te-settings__close" title="Kapat">&times;</button>
                        </div>
                    </div>
                    <div class="te-settings__tabs">
                        <button class="te-settings__tab te-settings__tab--active" data-tab="triggers">Tetikleyiciler</button>
                        <button class="te-settings__tab" data-tab="import-export">Iceri/Disari Aktar</button>
                    </div>
                    <div class="te-settings__body">
                        <div class="te-settings__panel" data-panel="triggers"></div>
                        <div class="te-settings__panel" data-panel="import-export" style="display:none"></div>
                    </div>
                    <div class="te-settings__footer">
                        <div class="te-settings__footer-info">
                            <span class="te-trigger-count">0</span> tetikleyici
                        </div>
                        <div class="te-settings__footer-actions">
                            <button class="te-triggers__btn te-triggers__btn--secondary te-reset-btn">Varsayilana Dondur</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Event listeners
            overlay.querySelector('.te-settings__close').addEventListener('click', hide);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) hide();
            });

            // Tabs
            overlay.querySelectorAll('.te-settings__tab').forEach(tab => {
                tab.addEventListener('click', () => switchTab(tab.dataset.tab));
            });

            // Reset button
            overlay.querySelector('.te-reset-btn').addEventListener('click', () => {
                if (confirm('Tum tetikleyiciler varsayilana donecek. Emin misiniz?')) {
                    TRIGGERS = Storage.reset();
                    TextExpander.updateTriggers();
                    renderTriggers();
                    Toast.show('Varsayilana donuldu', 'success');
                }
            });

            renderTriggers();
            renderImportExport();

            return overlay;
        };

        const switchTab = (tab) => {
            currentTab = tab;
            overlay.querySelectorAll('.te-settings__tab').forEach(t => {
                t.classList.toggle('te-settings__tab--active', t.dataset.tab === tab);
            });
            overlay.querySelectorAll('.te-settings__panel').forEach(p => {
                p.style.display = p.dataset.panel === tab ? 'block' : 'none';
            });
        };

        const renderTriggers = () => {
            const panel = overlay.querySelector('[data-panel="triggers"]');
            const dynamicOptions = Object.keys(DYNAMIC_VALUES).map(k =>
                `<option value="${k}">${k}</option>`
            ).join('');

            panel.innerHTML = `
                <div class="te-triggers">
                    <div class="te-triggers__add-form">
                        <input type="text" class="te-triggers__input te-add-trigger" placeholder="Tetikleyici (orn: :email)">
                        <input type="text" class="te-triggers__input te-add-replace" placeholder="Degisecek metin">
                        <select class="te-triggers__select te-add-type">
                            <option value="static">Statik</option>
                            <option value="dynamic">Dinamik</option>
                        </select>
                        <button class="te-triggers__btn te-add-btn">Ekle</button>
                    </div>
                    <div class="te-triggers__dynamic-help" style="display:none; margin-bottom:16px; padding:10px; background:rgba(251,191,36,0.1); border-radius:6px; font-size:11px; color:var(--te-warning);">
                        Dinamik degerler: ${Object.keys(DYNAMIC_VALUES).join(', ')}
                    </div>
                    <div class="te-triggers__list"></div>
                </div>
            `;

            const typeSelect = panel.querySelector('.te-add-type');
            const replaceInput = panel.querySelector('.te-add-replace');
            const dynamicHelp = panel.querySelector('.te-triggers__dynamic-help');

            typeSelect.addEventListener('change', () => {
                if (typeSelect.value === 'dynamic') {
                    replaceInput.placeholder = 'Dinamik deger (orn: date_tr)';
                    dynamicHelp.style.display = 'block';
                } else {
                    replaceInput.placeholder = 'Degisecek metin';
                    dynamicHelp.style.display = 'none';
                }
            });

            panel.querySelector('.te-add-btn').addEventListener('click', addTrigger);

            // Enter key support
            panel.querySelectorAll('.te-triggers__add-form input').forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') addTrigger();
                });
            });

            renderTriggersList();
        };

        const renderTriggersList = () => {
            const list = overlay.querySelector('.te-triggers__list');
            const countEl = overlay.querySelector('.te-trigger-count');

            if (TRIGGERS.length === 0) {
                list.innerHTML = '<div class="te-triggers__empty">Henuz tetikleyici yok</div>';
                countEl.textContent = '0';
                return;
            }

            countEl.textContent = TRIGGERS.length.toString();

            list.innerHTML = TRIGGERS.map((t, i) => {
                if (editingIndex === i) {
                    return `
                        <div class="te-triggers__item te-triggers__item--editing">
                            <input type="text" class="te-triggers__input te-edit-trigger" value="${Utils.escapeHtml(t.trigger)}">
                            <input type="text" class="te-triggers__input te-edit-replace" value="${Utils.escapeHtml(t.replace)}">
                            <select class="te-triggers__select te-edit-type">
                                <option value="static" ${t.type !== 'dynamic' ? 'selected' : ''}>Statik</option>
                                <option value="dynamic" ${t.type === 'dynamic' ? 'selected' : ''}>Dinamik</option>
                            </select>
                            <button class="te-triggers__btn te-save-edit" data-index="${i}">Kaydet</button>
                            <button class="te-triggers__btn te-triggers__btn--secondary te-cancel-edit">Iptal</button>
                        </div>
                    `;
                }

                const displayReplace = t.type === 'dynamic'
                    ? `[${t.replace}]`
                    : t.replace.length > 40 ? t.replace.substring(0, 40) + '...' : t.replace;

                return `
                    <div class="te-triggers__item">
                        <span class="te-triggers__trigger">${Utils.escapeHtml(t.trigger)}</span>
                        <span class="te-triggers__replace">${Utils.escapeHtml(displayReplace)}</span>
                        <span class="te-triggers__type ${t.type === 'dynamic' ? 'te-triggers__type--dynamic' : ''}">${t.type || 'static'}</span>
                        <div class="te-triggers__actions">
                            <button class="te-triggers__btn te-triggers__btn--secondary te-edit-btn" data-index="${i}">Duzenle</button>
                            <button class="te-triggers__btn te-triggers__btn--danger te-delete-btn" data-index="${i}">&times;</button>
                        </div>
                    </div>
                `;
            }).join('');

            // Event listeners
            list.querySelectorAll('.te-edit-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    editingIndex = parseInt(btn.dataset.index);
                    renderTriggersList();
                });
            });

            list.querySelectorAll('.te-delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    TRIGGERS.splice(index, 1);
                    saveTriggers();
                    renderTriggersList();
                    Toast.show('Tetikleyici silindi', 'success');
                });
            });

            list.querySelectorAll('.te-save-edit').forEach(btn => {
                btn.addEventListener('click', () => saveEdit(parseInt(btn.dataset.index)));
            });

            list.querySelectorAll('.te-cancel-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    editingIndex = -1;
                    renderTriggersList();
                });
            });
        };

        const addTrigger = () => {
            const triggerInput = overlay.querySelector('.te-add-trigger');
            const replaceInput = overlay.querySelector('.te-add-replace');
            const typeSelect = overlay.querySelector('.te-add-type');

            const trigger = triggerInput.value.trim();
            const replace = replaceInput.value.trim();
            const type = typeSelect.value;

            if (!trigger || !replace) {
                Toast.show('Tetikleyici ve degisecek metin gerekli', 'error');
                return;
            }

            if (TRIGGERS.some(t => t.trigger === trigger)) {
                Toast.show('Bu tetikleyici zaten var', 'error');
                return;
            }

            if (type === 'dynamic' && !DYNAMIC_VALUES[replace]) {
                Toast.show('Gecersiz dinamik deger: ' + replace, 'error');
                return;
            }

            TRIGGERS.push({ trigger, replace, type });
            saveTriggers();

            triggerInput.value = '';
            replaceInput.value = '';
            typeSelect.value = 'static';

            renderTriggersList();
            Toast.show('Tetikleyici eklendi', 'success');
        };

        const saveEdit = (index) => {
            const item = overlay.querySelector('.te-triggers__item--editing');
            const trigger = item.querySelector('.te-edit-trigger').value.trim();
            const replace = item.querySelector('.te-edit-replace').value.trim();
            const type = item.querySelector('.te-edit-type').value;

            if (!trigger || !replace) {
                Toast.show('Tetikleyici ve degisecek metin gerekli', 'error');
                return;
            }

            if (type === 'dynamic' && !DYNAMIC_VALUES[replace]) {
                Toast.show('Gecersiz dinamik deger: ' + replace, 'error');
                return;
            }

            TRIGGERS[index] = { trigger, replace, type };
            saveTriggers();
            editingIndex = -1;
            renderTriggersList();
            Toast.show('Tetikleyici guncellendi', 'success');
        };

        const saveTriggers = () => {
            Storage.set(TRIGGERS);
            TextExpander.updateTriggers();
        };

        const renderImportExport = () => {
            const panel = overlay.querySelector('[data-panel="import-export"]');
            panel.innerHTML = `
                <div class="te-settings__section">
                    <div class="te-settings__section-title">Disari Aktar</div>
                    <textarea class="te-settings__textarea te-export-data" readonly></textarea>
                    <div class="te-settings__row">
                        <button class="te-triggers__btn te-copy-export">Kopyala</button>
                    </div>
                </div>
                <div class="te-settings__section">
                    <div class="te-settings__section-title">Iceri Aktar</div>
                    <textarea class="te-settings__textarea te-import-data" placeholder="JSON formatinda tetikleyicileri buraya yapisirin..."></textarea>
                    <div class="te-settings__row">
                        <button class="te-triggers__btn te-import-btn">Iceri Aktar</button>
                        <button class="te-triggers__btn te-triggers__btn--secondary te-merge-btn">Birlestir</button>
                    </div>
                </div>
            `;

            const exportData = panel.querySelector('.te-export-data');
            exportData.value = JSON.stringify(TRIGGERS, null, 2);

            panel.querySelector('.te-copy-export').addEventListener('click', () => {
                exportData.select();
                document.execCommand('copy');
                Toast.show('Panoya kopyalandi', 'success');
            });

            panel.querySelector('.te-import-btn').addEventListener('click', () => {
                importTriggers(false);
            });

            panel.querySelector('.te-merge-btn').addEventListener('click', () => {
                importTriggers(true);
            });
        };

        const importTriggers = (merge) => {
            const importData = overlay.querySelector('.te-import-data');
            try {
                const data = JSON.parse(importData.value);
                if (!Array.isArray(data)) throw new Error('Gecersiz format');

                const valid = data.filter(t => t.trigger && t.replace);
                if (valid.length === 0) throw new Error('Gecerli tetikleyici bulunamadi');

                if (merge) {
                    const existing = new Set(TRIGGERS.map(t => t.trigger));
                    valid.forEach(t => {
                        if (!existing.has(t.trigger)) {
                            TRIGGERS.push(t);
                        }
                    });
                } else {
                    TRIGGERS.length = 0;
                    TRIGGERS.push(...valid);
                }

                saveTriggers();
                renderTriggers();
                overlay.querySelector('.te-export-data').value = JSON.stringify(TRIGGERS, null, 2);
                importData.value = '';
                Toast.show(`${valid.length} tetikleyici ${merge ? 'birlestirildi' : 'iceri aktarildi'}`, 'success');
            } catch (e) {
                Toast.show('Gecersiz JSON: ' + e.message, 'error');
            }
        };

        const show = () => {
            create();
            visible = true;
            editingIndex = -1;
            renderTriggersList();
            overlay.querySelector('.te-export-data').value = JSON.stringify(TRIGGERS, null, 2);
            requestAnimationFrame(() => overlay.classList.add('te-settings-overlay--visible'));
        };

        const hide = () => {
            if (overlay) {
                overlay.classList.remove('te-settings-overlay--visible');
                visible = false;
                editingIndex = -1;
            }
        };

        const toggle = () => visible ? hide() : show();
        const isVisible = () => visible;

        return { show, hide, toggle, isVisible };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                               HELP MODAL                                   ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const HelpModal = (() => {
        let modal = null;
        let visible = false;

        const create = () => {
            if (modal) return modal;

            modal = document.createElement('div');
            modal.className = 'te-modal';
            modal.innerHTML = `
                <div class="te-modal__header">
                    <div class="te-modal__title">
                        <span class="te-modal__icon">TE</span>
                        Text Expander AI
                    </div>
                    <button class="te-modal__close">&times;</button>
                </div>
                <div class="te-modal__content">
                    <div class="te-modal__section">
                        <div class="te-modal__label">AI Komutlari</div>
                        <div class="te-modal__grid">
                            <span class="te-modal__cmd">-fix</span><span class="te-modal__desc">Yazim duzelt</span>
                            <span class="te-modal__cmd">-imp</span><span class="te-modal__desc">Gelistir</span>
                            <span class="te-modal__cmd">-gen</span><span class="te-modal__desc">Genislet</span>
                            <span class="te-modal__cmd">-en</span><span class="te-modal__desc">Ingilizce</span>
                            <span class="te-modal__cmd">-tr</span><span class="te-modal__desc">Turkce</span>
                            <span class="te-modal__cmd">-sum</span><span class="te-modal__desc">Ozetle</span>
                            <span class="te-modal__cmd">-frm</span><span class="te-modal__desc">Resmi</span>
                            <span class="te-modal__cmd">-cas</span><span class="te-modal__desc">Gunluk</span>
                            <span class="te-modal__cmd">-ai</span><span class="te-modal__desc">Serbest</span>
                            <span class="te-modal__cmd">-wh</span><span class="te-modal__desc">Discord</span>
                        </div>
                    </div>
                    <div class="te-modal__section">
                        <div class="te-modal__label">Hover Ceviri</div>
                        <div class="te-modal__grid">
                            <span class="te-modal__cmd">Sec</span><span class="te-modal__desc">Otomatik cevir</span>
                        </div>
                    </div>
                </div>
                <div class="te-modal__footer">
                    <span><kbd>ESC</kbd> kapat</span>
                    <button class="te-modal__settings-btn">Ayarlar</button>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.te-modal__close').addEventListener('click', hide);
            modal.querySelector('.te-modal__settings-btn').addEventListener('click', () => {
                hide();
                SettingsPanel.show();
            });
            document.addEventListener('click', (e) => visible && !modal.contains(e.target) && hide());

            return modal;
        };

        const show = () => { create(); visible = true; requestAnimationFrame(() => modal.classList.add('te-modal--visible')); };
        const hide = () => { if (modal) { modal.classList.remove('te-modal--visible'); visible = false; } };
        const toggle = () => visible ? hide() : show();
        const isVisible = () => visible;

        return { show, hide, toggle, isVisible };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                               AI CLIENT                                    ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const AIClient = (() => {
        let currentRequest = null;

        const request = (userInput, command) => new Promise((resolve, reject) => {
            const systemPrompt = AI_PROMPTS[command] || AI_PROMPTS['-ai'];

            currentRequest = GM_xmlhttpRequest({
                method: "POST",
                url: CONFIG.ai.url,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${CONFIG.ai.key}`
                },
                data: JSON.stringify({
                    model: CONFIG.ai.model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userInput }
                    ],
                    temperature: CONFIG.ai.temperature,
                    top_p: CONFIG.ai.topP,
                    max_tokens: CONFIG.ai.maxTokens
                }),
                timeout: CONFIG.ai.timeout,
                onload: (res) => {
                    currentRequest = null;
                    if (res.status >= 400) return reject(new Error(`API: ${res.status}`));
                    try {
                        const content = JSON.parse(res.responseText)?.choices?.[0]?.message?.content?.trim();
                        content ? resolve(content) : reject(new Error("Empty"));
                    } catch { reject(new Error("Parse")); }
                },
                onerror: () => { currentRequest = null; reject(new Error("Network")); },
                ontimeout: () => { currentRequest = null; reject(new Error("Timeout")); },
                onabort: () => { currentRequest = null; reject(new Error("Cancelled")); }
            });
        });

        const cancel = () => { if (currentRequest) { try { currentRequest.abort(); } catch {} currentRequest = null; } };

        return { request, cancel };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                            DISCORD WEBHOOK                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const DiscordWebhook = {
        send: (message) => new Promise((resolve, reject) => {
            if (!CONFIG.discord.webhookUrl) return reject(new Error("No webhook"));

            GM_xmlhttpRequest({
                method: "POST",
                url: CONFIG.discord.webhookUrl,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ content: message, username: CONFIG.discord.username }),
                onload: (r) => r.status < 300 ? resolve() : reject(new Error(`${r.status}`)),
                onerror: () => reject(new Error("Network"))
            });
        })
    };

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                            INPUT BLOCKING                                  ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const InputBlocker = (() => {
        let isBlocking = false;

        const blocker = (e) => { if (isBlocking) { e.preventDefault(); e.stopPropagation(); } };

        const block = (el) => {
            isBlocking = true;
            el._blocker = blocker;
            ['keydown', 'keypress', 'input', 'paste'].forEach(t => el.addEventListener(t, blocker, true));
        };

        const unblock = (el) => {
            isBlocking = false;
            if (el._blocker) {
                ['keydown', 'keypress', 'input', 'paste'].forEach(t => el.removeEventListener(t, el._blocker, true));
                delete el._blocker;
            }
        };

        return { block, unblock };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                           TEXT EXPANDER ENGINE                             ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const TextExpander = (() => {
        let processing = false;
        let aiProcessing = false;
        let debounceTimer = null;
        let undoDetected = false;
        let originalText = '';
        let sortedTriggers = [];

        const allCommands = [...Object.keys(AI_PROMPTS), ...WEBHOOK_COMMANDS];

        const updateTriggers = () => {
            sortedTriggers = [...TRIGGERS].sort((a, b) => b.trigger.length - a.trigger.length);
        };

        const getReplacement = (triggerObj) => {
            if (triggerObj.type === 'dynamic') {
                const fn = DYNAMIC_VALUES[triggerObj.replace];
                return fn ? fn() : triggerObj.replace;
            }
            return triggerObj.replace;
        };

        const processAI = async (element, text, command) => {
            if (aiProcessing) return;

            const userInput = text.slice(0, -command.length).trim();
            if (!userInput) return;

            aiProcessing = true;
            originalText = text;

            const cursorStyle = element.style.caretColor;
            element.style.caretColor = 'transparent';

            InputBlocker.block(element);
            if (CONFIG.dots.enabled) DotsAnimation.start(element);

            const cleanup = () => {
                DotsAnimation.stop();
                InputBlocker.unblock(element);
                element.style.caretColor = cursorStyle;
                aiProcessing = false;
                originalText = '';
            };

            try {
                if (WEBHOOK_COMMANDS.includes(command)) {
                    await DiscordWebhook.send(userInput);
                    UniversalTextSetter.setText(element, userInput);
                } else {
                    const result = await AIClient.request(userInput, command);
                    UniversalTextSetter.setText(element, result);
                }
            } catch (err) {
                if (err.message === 'Cancelled') {
                    UniversalTextSetter.setText(element, originalText);
                } else {
                    console.error('[TE] Error:', err.message);
                    UniversalTextSetter.setText(element, `${userInput} [${err.message}]`);
                }
            } finally {
                cleanup();
            }
        };

        const checkAndReplace = () => {
            if (undoDetected || processing || aiProcessing) return;

            const el = UniversalTextSetter.getActiveEditable();
            if (!el) return;

            const text = UniversalTextSetter.getText(el);
            Utils.log('Check:', text);

            // Check commands
            const cmd = allCommands.find(c => text.endsWith(c));
            if (cmd) {
                setTimeout(() => processAI(el, text, cmd), CONFIG.expander.aiCommandDelay);
                return;
            }

            // Check triggers
            for (const triggerObj of sortedTriggers) {
                const { trigger } = triggerObj;
                const matches = CONFIG.expander.wordBoundary
                    ? new RegExp(`(^|\\s)${Utils.escapeRegex(trigger)}$`).test(text)
                    : text.endsWith(trigger);

                if (matches) {
                    processing = true;
                    const replacement = getReplacement(triggerObj);
                    UniversalTextSetter.setText(el, text.slice(0, -trigger.length) + replacement);
                    setTimeout(() => { processing = false; }, 100);
                    return;
                }
            }
        };

        const handleInput = (e) => {
            if (e.inputType !== 'historyUndo') undoDetected = false;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkAndReplace, CONFIG.expander.debounceDelay);
        };

        const handleKeydown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { undoDetected = true; return; }
            if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                HelpModal.toggle();
                return;
            }

            if (e.altKey && e.key === 's') {
                e.preventDefault();
                SettingsPanel.toggle();
                return;
            }

            if (e.key === 'Escape') {
                if (SettingsPanel.isVisible()) { SettingsPanel.hide(); return; }
                if (HelpModal.isVisible()) { HelpModal.hide(); return; }
                if (aiProcessing) {
                    e.preventDefault();
                    AIClient.cancel();
                    DotsAnimation.stop();
                    aiProcessing = false;
                    const el = UniversalTextSetter.getActiveEditable();
                    if (el) {
                        InputBlocker.unblock(el);
                        if (originalText) UniversalTextSetter.setText(el, originalText);
                        originalText = '';
                    }
                    return;
                }
            }

            if (undoDetected && e.key !== 'z') undoDetected = false;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(checkAndReplace, CONFIG.expander.debounceDelay);
        };

        const init = () => {
            updateTriggers();
            document.addEventListener('input', handleInput, true);
            document.addEventListener('keydown', handleKeydown, true);
        };

        return { init, isProcessing: () => aiProcessing, updateTriggers };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                           HOVER TRANSLATOR                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    const HoverTranslator = (() => {
        const state = { tooltip: null, cache: new Map(), seq: 0, timers: {}, request: null };

        const clearTimer = (n) => { if (state.timers[n]) { clearTimeout(state.timers[n]); state.timers[n] = null; } };

        const getTooltip = () => {
            if (state.tooltip) return state.tooltip;
            const el = document.createElement('div');
            el.className = 'te-tooltip';
            el.id = 'ht-tooltip';
            document.body.appendChild(el);
            return state.tooltip = el;
        };

        const hide = () => {
            const tip = state.tooltip;
            if (!tip) return;
            tip.classList.remove('te-tooltip--visible');
            clearTimer('hide');
            state.timers.hide = setTimeout(() => {
                if (!tip.classList.contains('te-tooltip--visible')) tip.style.display = 'none';
            }, CONFIG.translator.hideDelay);
        };

        const position = (anchor) => {
            const tip = getTooltip();
            tip.style.display = 'block';

            const { offsetWidth: w, offsetHeight: h } = tip;
            const { pageYOffset: scrollY, pageXOffset: scrollX, innerWidth } = window;
            const { tooltipGap: gap, edgePadding: pad } = CONFIG.translator;

            let pos = 'top', top = scrollY + anchor.yTop - h - gap;
            if (top < scrollY + pad) { pos = 'bottom'; top = scrollY + anchor.yBottom + gap; }

            const center = scrollX + anchor.x;
            const left = Utils.clamp(center, scrollX + pad + w/2, scrollX + innerWidth - pad - w/2);
            const offset = Utils.clamp(center - left, -(w/2 - 16), w/2 - 16);

            tip.dataset.pos = pos;
            tip.style.left = `${left}px`;
            tip.style.top = `${top}px`;
            tip.style.setProperty('--arrow-offset', `${offset}px`);
        };

        const show = (content, loading, anchor) => {
            const tip = getTooltip();
            clearTimer('hide');
            tip.classList.remove('te-tooltip--visible');
            tip.style.display = 'block';
            tip.style.visibility = 'hidden';
            tip.innerHTML = loading
                ? `<span class="te-tooltip__loading"><span class="te-tooltip__spinner"></span>${Utils.escapeHtml(content)}</span>`
                : Utils.escapeHtml(content);
            position(anchor);
            tip.style.visibility = 'visible';
            requestAnimationFrame(() => tip.classList.add('te-tooltip--visible'));
        };

        const getSelection = () => {
            const sel = window.getSelection();
            if (!sel?.rangeCount) return { text: '', anchor: null };
            const text = sel.toString().trim();
            const rect = sel.getRangeAt(0).getBoundingClientRect();
            return {
                text,
                anchor: (rect.width || rect.height) ? { x: rect.left + rect.width/2, yTop: rect.top, yBottom: rect.bottom } : null
            };
        };

        const translate = async (text) => {
            const key = text.trim();
            if (state.cache.has(key)) return state.cache.get(key);

            if (state.request) { try { state.request.abort(); } catch {} }

            return new Promise((resolve, reject) => {
                state.request = GM_xmlhttpRequest({
                    method: 'GET',
                    url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${CONFIG.translator.targetLang}&dt=t&q=${encodeURIComponent(key)}`,
                    timeout: CONFIG.translator.timeout,
                    onload: (r) => {
                        state.request = null;
                        try {
                            const result = JSON.parse(r.responseText)?.[0]?.map(x => x?.[0]).filter(Boolean).join('') || '';
                            state.cache.set(key, result);
                            resolve(result);
                        } catch (e) { reject(e); }
                    },
                    onerror: () => { state.request = null; reject(new Error('Network')); },
                    ontimeout: () => { state.request = null; reject(new Error('Timeout')); },
                    onabort: () => { state.request = null; reject(new Error('Cancelled')); }
                });
            });
        };

        const perform = async () => {
            if (UniversalTextSetter.isEditable(document.activeElement)) return;

            const { text, anchor } = getSelection();
            const { minChars, maxChars } = CONFIG.translator;

            if (!text || text.length < minChars || text.length > maxChars || !anchor) { hide(); return; }

            const seq = ++state.seq;
            show('Ceviriliyor...', true, anchor);

            try {
                const result = await translate(text);
                if (seq === state.seq) show(result || 'Ceviri yok', false, anchor);
            } catch (err) {
                if (seq === state.seq && err.message !== 'Cancelled') show('Hata', false, anchor);
            }
        };

        const handleSelection = () => {
            if (UniversalTextSetter.isEditable(document.activeElement)) { hide(); return; }
            clearTimer('selection');
            state.timers.selection = setTimeout(() => getSelection().text ? perform() : hide(), CONFIG.translator.debounce);
        };

        const init = () => {
            getTooltip();
            document.addEventListener('mouseup', handleSelection, { passive: true });
            document.addEventListener('keyup', (e) => {
                if (!UniversalTextSetter.isEditable(document.activeElement) && (e.key.startsWith('Arrow') || e.key === 'Shift')) handleSelection();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') { state.seq++; if (state.request) state.request.abort(); hide(); }
            });
            window.addEventListener('scroll', () => { hide(); state.seq++; }, { passive: true });
            document.addEventListener('focusin', (e) => UniversalTextSetter.isEditable(e.target) && hide());
        };

        return { init };
    })();

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                             INITIALIZATION                                 ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    TextExpander.init();
    HoverTranslator.init();

    console.log('Text Expander AI v2.4.0 | Ctrl+Alt+H yardim | Ctrl+Alt+S ayarlar');

})();
