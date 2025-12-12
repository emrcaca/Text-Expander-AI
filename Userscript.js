// ==UserScript==
// @name         Text-Expander-AI
// @namespace    https://github.com/emrcaca
// @version      1.0.0
// @description  Text expander with AI commands + Hover translation
// @author       emrcaca
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      api.example.com
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
            url: "https://api.example.com/v1/chat/completions",
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
            text: 'AI çalışıyor'
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
        '-tr':  'Akıcı ve doğal Türkçeye çevir. Sadece çeviriyi döndür.',
        '-sum': 'Summarize concisely. Return only the summary.',
        '-frm': 'Rewrite in a formal and professional style. Return only the rewritten text.',
        '-cas': 'Rewrite in a casual, friendly tone. Return only the rewritten text.'
    };

    // Webhook Commands
    const WEBHOOK_COMMANDS = ['-wh'];

    // Text Triggers
    const TRIGGERS = [
        { trigger: '"1', replace: 'Owo h' },
        { trigger: '"2', replace: 'Owo b' },
        { trigger: '"3', replace: 'Owo' },
        { trigger: '"4', replace: 'Owo pray' },
        { trigger: ':check', replace: '✓' },
        { trigger: ':cross', replace: '✗' },
        { trigger: ':heart', replace: '❤️' },
        { trigger: ':tarih', replace: () => new Date().toLocaleDateString('tr-TR') },
        { trigger: ':date', replace: () => new Date().toLocaleDateString('en-US') },
        { trigger: ':saat', replace: () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':time', replace: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':gun', replace: () => ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][new Date().getDay()] }
    ];

    // ╔═══════════════════════════════════════════════════════════════════════════╗
    // ║                                 STYLES                                     ║
    // ╚═══════════════════════════════════════════════════════════════════════════╝

    GM_addStyle(`
        :root {
            --te-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            --te-border: #0f3460;
            --te-accent: #e94560;
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
        }

        .te-modal__footer kbd {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 5px;
            border-radius: 3px;
        }

        .te-modal__content::-webkit-scrollbar { width: 6px; }
        .te-modal__content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
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

            // Adjust if overflows
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
                        <span class="te-modal__icon">⚡</span>
                        Text Expander AI
                    </div>
                    <button class="te-modal__close">×</button>
                </div>
                <div class="te-modal__content">
                    <div class="te-modal__section">
                        <div class="te-modal__label">AI Komutları</div>
                        <div class="te-modal__grid">
                            <span class="te-modal__cmd">-fix</span><span class="te-modal__desc">Yazım düzelt</span>
                            <span class="te-modal__cmd">-imp</span><span class="te-modal__desc">Geliştir</span>
                            <span class="te-modal__cmd">-gen</span><span class="te-modal__desc">Genişlet</span>
                            <span class="te-modal__cmd">-en</span><span class="te-modal__desc">İngilizce</span>
                            <span class="te-modal__cmd">-tr</span><span class="te-modal__desc">Türkçe</span>
                            <span class="te-modal__cmd">-sum</span><span class="te-modal__desc">Özetle</span>
                            <span class="te-modal__cmd">-frm</span><span class="te-modal__desc">Resmi</span>
                            <span class="te-modal__cmd">-cas</span><span class="te-modal__desc">Günlük</span>
                            <span class="te-modal__cmd">-ai</span><span class="te-modal__desc">Serbest</span>
                            <span class="te-modal__cmd">-wh</span><span class="te-modal__desc">Discord</span>
                        </div>
                    </div>
                    <div class="te-modal__section">
                        <div class="te-modal__label">Hover Çeviri</div>
                        <div class="te-modal__grid">
                            <span class="te-modal__cmd">Seç</span><span class="te-modal__desc">Otomatik çevir</span>
                        </div>
                    </div>
                </div>
                <div class="te-modal__footer"><kbd>ESC</kbd> kapat</div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.te-modal__close').addEventListener('click', hide);
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

        const allCommands = [...Object.keys(AI_PROMPTS), ...WEBHOOK_COMMANDS];
        const sortedTriggers = [...TRIGGERS].sort((a, b) => b.trigger.length - a.trigger.length);

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
            for (const { trigger, replace } of sortedTriggers) {
                const matches = CONFIG.expander.wordBoundary
                    ? new RegExp(`(^|\\s)${Utils.escapeRegex(trigger)}$`).test(text)
                    : text.endsWith(trigger);

                if (matches) {
                    processing = true;
                    const replacement = typeof replace === 'function' ? replace() : replace;
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

            if (e.ctrlKey && e.altKey && e.key === 'h') {
                e.preventDefault();
                HelpModal.toggle();
                return;
            }

            if (e.key === 'Escape') {
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
            document.addEventListener('input', handleInput, true);
            document.addEventListener('keydown', handleKeydown, true);
        };

        return { init, isProcessing: () => aiProcessing };
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
            show('Çeviriliyor...', true, anchor);

            try {
                const result = await translate(text);
                if (seq === state.seq) show(result || 'Çeviri yok', false, anchor);
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

    console.log('✨ Text Expander AI v2.3.0 | Ctrl+Alt+H for help');

})();
