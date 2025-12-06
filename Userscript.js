// ==UserScript==
// @name         AI Text Improver Enhanced
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  AI-powered text improvement with optimized architecture and better UX
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.openai.com
// @connect      api.anthropic.com
// @connect      api.cohere.ai
// @connect      api.emrxxxx.workers.dev
// @require      https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.js
// ==/UserScript==

/**
 *          ___ _ __ ___  _ __ ___ __ _  ___ __ _
 *         / _ \ '_ ` _ \| '__/ __/ _` |/ __/ _` |
 *        |  __/ | | | | | | | (_| (_| | (_| (_| |
 *         \___|_| |_| |_|_|  \___\__,_|\___\__,_|
 *
 *                AI Text Improver Enhanced
 *
 *    GitHub: https://github.com/emrcxcx/AI-Text-Improver
 *    Copyright (c) 2025 emrcaca | MIT License
 */

(function() {
    "use strict";

    // ==================== CONFIGURATION ====================
    const CONFIG = {
		// Choose your AI provider: "openai", "anthropic", "cohere", or "custom"
		AI_PROVIDER: "custom",

		// Custom API endpoint (required if AI_PROVIDER is "custom")
		CUSTOM_API_URL: "https://your.custom.api/v1/chat/completions",
		CUSTOM_API_KEY: "your-custom-api-key-here",

        OPENAI_API_KEY: "your-openai-key-here",
        ANTHROPIC_API_KEY: "your-anthropic-key-here",
        COHERE_API_KEY: "your-cohere-key-here",

        MODEL: "openai/gpt-oss-120b",
        TEMPERATURE: 0.7,
        MAX_TOKENS: 4096,

        TIMEOUT: 50000,
        DEBOUNCE_DELAY: 500,

        LOG_REQUESTS: false,
        ENCRYPT_REQUESTS: false
    };

    // ==================== COMMAND DEFINITIONS ====================
    const AI_COMMANDS = {
        '-fix': 'Fix all grammar, spelling, and punctuation errors. Return only the corrected text:',
        '-imp': 'Improve this text: clearer, concise, impactful. Keep meaning:',
        '-gen': 'Expand this into a detailed, natural response. Same tone:',
        '-en': 'Translate to natural English:',
        '-tr': 'Çeviri yap → akıcı ve doğal Türkçe:',
        '-sum': 'Summarize this concisely:',
        '-frm': 'Make this more formal and professional:',
        '-cas': 'Make this more casual and friendly:',
        '-ai': null
    };

    const TEXT_EXPANSIONS = {
        'hi': "Hello!",
		'ty': "Thank you!",
		'br': "Best regards,",
		'rg': "Regards,",
		'pl': "Please ",
		'th': "Thanks ",
		'cw': "Could you ",
		'wd': "Would you ",
		'bt': "Best,",
    };

    const MODE_CONFIGS = {
        'fix': { name: 'Düzelt', color: '#10b981' },
        'imp': { name: 'İyileştir', color: '#3b82f6' },
        'gen': { name: 'Genişlet', color: '#8b5cf6' },
        'en': { name: 'İngilizce', color: '#0ea5e9' },
        'tr': { name: 'Türkçe', color: '#ec4899' },
        'sum': { name: 'Özetle', color: '#f59e0b' },
        'frm': { name: 'Resmi', color: '#6366f1' },
        'cas': { name: 'Samimi', color: '#ef4444' },
        'ai': { name: 'Serbest AI', color: '#8b5cf6' }
    };

    // ==================== STATE MANAGEMENT ====================
    class StateManager {
        constructor() {
            this.processing = false;
            this.currentRequest = null;
            this.lastProcessedText = null;
            this.debounceTimer = null;
            this.elementMethodCache = new WeakMap();
        }

        reset() {
            this.processing = false;
            this.lastProcessedText = null;
        }

        setProcessing(value) {
            this.processing = value;
        }

        cancelRequest() {
            if (this.currentRequest) {
                this.currentRequest.abort();
                this.currentRequest = null;
            }
        }

        clearDebounce() {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = null;
            }
        }
    }

    // ==================== DOM UTILITIES ====================
    class DOMUtils {
        static getText(element) {
            return element.isContentEditable
                ? (element.textContent || '').replace(/\u200B/g, '')
                : (element.value || '');
        }

        static isInputLike(element) {
            const tag = element.tagName?.toLowerCase();
            return (tag === "input" || tag === "textarea") ||
                   (element.isContentEditable && element.contentEditable !== "false");
        }

        static setInputValue(element, text) {
            const descriptor = Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(element),
                "value"
            );
            const setter = descriptor?.set;

            if (setter) {
                setter.call(element, text);
            } else {
                element.value = text;
            }

            element.dispatchEvent(new Event("input", { bubbles: true }));
            element._valueTracker?.setValue(text);

            if (element.setSelectionRange) {
                element.setSelectionRange(text.length, text.length);
            }
        }

        static setCursor(selection, node, position) {
            const range = document.createRange();
            range.setStart(node, position);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        static setEditableContent(element, text, cache) {
            const cachedMethod = cache.get(element);

            if (cachedMethod === 'A') {
                return this.setContentMethodA(element, text);
            }
            if (cachedMethod === 'B') {
                return this.setContentMethodB(element, text);
            }

            // Try method A first
            this.setContentMethodA(element, text);

            // Verify and cache the working method
            setTimeout(() => {
                if (this.getText(element) === text) {
                    cache.set(element, 'A');
                } else {
                    this.setContentMethodB(element, text);
                    cache.set(element, 'B');
                }
            }, 1);
        }

        static setContentMethodA(element, text) {
            const selection = window.getSelection();
            const range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            element.dispatchEvent(new InputEvent("beforeinput", {
                inputType: "deleteContent",
                bubbles: true,
                cancelable: true
            }));

            element.dispatchEvent(new InputEvent("input", {
                inputType: "deleteContent",
                bubbles: true
            }));

            element.dispatchEvent(new InputEvent("beforeinput", {
                inputType: "insertText",
                data: text,
                bubbles: true,
                cancelable: true
            }));

            element.dispatchEvent(new InputEvent("input", {
                inputType: "insertText",
                data: text,
                bubbles: true
            }));

            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        static setContentMethodB(element, text) {
            const selection = window.getSelection();

            if (selection.rangeCount > 0) {
                const node = selection.getRangeAt(0).startContainer;
                if (node.nodeType === Node.TEXT_NODE) {
                    node.textContent = text;
                    this.setCursor(selection, node, text.length);
                    element.dispatchEvent(new InputEvent("input", {
                        inputType: "insertText",
                        bubbles: true
                    }));
                    return;
                }
            }

            const range = document.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);

            document.execCommand("delete");
            document.execCommand("insertText", false, text);

            element.dispatchEvent(new InputEvent("input", {
                inputType: "insertText",
                bubbles: true
            }));
        }

        static setElementValue(element, value, cache) {
            if (element.isContentEditable) {
                this.setEditableContent(element, value, cache);
            } else if (element.value !== undefined) {
                this.setInputValue(element, value);
            }
        }
    }

    // ==================== UI COMPONENTS ====================
    class UIManager {
        constructor() {
            this.spinner = null;
            this.stylesInjected = false;
            this.disabledElements = new WeakMap();
        }

        injectStyles() {
            if (this.stylesInjected) return;

            const style = document.createElement('style');
            style.id = 'ai-text-improver-styles';
            style.textContent = `
                .ai-spinner {
                    position: fixed;
                    z-index: 10000;
                    pointer-events: none;
                }

                .ai-spinner-circle {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #292929;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: ai-spin 0.6s linear infinite;
                }

                @keyframes ai-spin {
                    to { transform: rotate(360deg); }
                }

                .ai-processing {
                    opacity: 0.6 !important;
                    pointer-events: none !important;
                    cursor: not-allowed !important;
                    transition: opacity 0.2s ease;
                }

                input.ai-processing,
                textarea.ai-processing,
                [contenteditable="true"].ai-processing {
                    background-color: #f9fafb !important;
                    cursor: not-allowed !important;
                }
            `;

            document.head.appendChild(style);
            this.stylesInjected = true;
        }

        initNotificationContainer() {
            // Removed - notifications disabled
        }

        showSpinner(element) {
            this.hideSpinner();

            this.spinner = document.createElement('div');
            this.spinner.className = 'ai-spinner';
            this.spinner.innerHTML = '<div class="ai-spinner-circle"></div>';

            this.updateSpinnerPosition(element);
            document.body.appendChild(this.spinner);
        }

        updateSpinnerPosition(element) {
            if (!this.spinner) return;

            const rect = element.getBoundingClientRect();
            this.spinner.style.top = `${rect.top + rect.height / 2}px`;
            this.spinner.style.left = `${rect.left + rect.width / 2}px`;
            this.spinner.style.transform = 'translate(-50%, -50%)';
        }

        hideSpinner() {
            if (this.spinner) {
                this.spinner.remove();
                this.spinner = null;
            }
        }

        showNotification(message, type = 'info') {
            // Notifications disabled
            console.log(`[AI] ${type.toUpperCase()}: ${message}`);
        }

        disableElement(element) {
            // Store original state
            const originalState = {
                readonly: element.readOnly,
                contentEditable: element.contentEditable,
                tabIndex: element.tabIndex
            };
            this.disabledElements.set(element, originalState);

            // Make readonly instead of disabled (so we can still set value)
            if (element.isContentEditable) {
                element.contentEditable = 'false';
            } else {
                element.readOnly = true;
            }

            element.tabIndex = -1;
            element.classList.add('ai-processing');
        }

        enableElement(element) {
            const originalState = this.disabledElements.get(element);

            if (originalState) {
                // Restore original state
                if (element.isContentEditable !== undefined) {
                    element.contentEditable = originalState.contentEditable;
                } else {
                    element.readOnly = originalState.readonly;
                }
                element.tabIndex = originalState.tabIndex;

                this.disabledElements.delete(element);
            } else {
                // Fallback if no original state was stored
                if (element.isContentEditable !== undefined) {
                    element.contentEditable = 'true';
                } else {
                    element.readOnly = false;
                }
                element.tabIndex = 0;
            }

            element.classList.remove('ai-processing');

            // Restore focus
            element.focus();
        }
    }

    // ==================== MODAL MANAGER ====================
    class ModalManager {
        constructor() {
            this.modal = null;
            this.overlay = null;
            this.isOpen = false;
            this.stylesInjected = false;
        }

        injectStyles() {
            if (this.stylesInjected) return;

            const style = document.createElement("style");
            style.textContent = `
                #ai-improver-help-modal{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a1a;border:1px solid #333;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,.6);padding:16px;z-index:999999;max-width:380px;width:90%;font-family:'Segoe UI',system-ui,sans-serif;color:#e0e0e0;font-size:13px}
                #ai-improver-help-modal .modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #333}
                #ai-improver-help-modal h2{margin:0;font-size:15px;font-weight:600;color:#fff}
                #ai-improver-help-modal .close-btn{background:#2a2a2a;border:1px solid #444;width:24px;height:24px;border-radius:4px;font-size:18px;cursor:pointer;color:#aaa;transition:all .2s;line-height:1}
                #ai-improver-help-modal .close-btn:hover{background:#333;border-color:#555;color:#fff}
                #ai-improver-help-modal .shortcut-info{margin-bottom:10px;padding:10px 12px;background:linear-gradient(135deg,#2563eb 0%,#1e40af 100%);border-radius:6px;box-shadow:0 2px 8px rgba(37,99,235,.3);display:flex;align-items:center;gap:8px}
                #ai-improver-help-modal kbd{background:#1e3a8a;padding:4px 8px;border-radius:4px;color:#fff;font-size:11px;font-weight:600;border:1px solid #1e40af;box-shadow:0 2px 0 #172554;font-family:monospace}
                #ai-improver-help-modal .modal-content{max-height:400px;overflow-y:auto;padding-right:4px}
                #ai-improver-help-modal .mode-category{color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
                #ai-improver-help-modal .mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;margin-bottom:12px}
                #ai-improver-help-modal .mode-item{background:#252525;padding:6px 8px;border-radius:4px;border-left:2px solid}
                #ai-improver-help-modal .mode-item code{font-weight:600}
                #ai-improver-help-modal .mode-item span{color:#9ca3af}
                #ai-improver-help-modal .example-info{margin-top:12px;padding:8px 10px;background:#252525;border-radius:6px;font-size:11px;color:#9ca3af;border:1px solid #2a2a2a}
                #ai-improver-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.75);backdrop-filter:blur(2px);z-index:999998}
            `;

            document.head.appendChild(style);
            this.stylesInjected = true;
        }

        createModal() {
            if (this.modal) return this.modal;

            this.modal = document.createElement("div");
            this.modal.id = "ai-improver-help-modal";

            const header = document.createElement('div');
            header.className = 'modal-header';
            header.innerHTML = `<h2>⚡ AI Text Improver</h2><button class="close-btn" title="Kapat">×</button>`;

            const shortcutInfo = document.createElement('div');
            shortcutInfo.className = 'shortcut-info';
            shortcutInfo.innerHTML = `
                <span style="font-size: 16px;">⌨️</span>
                <div style="flex: 1;">
                    <div style="color:#bfdbfe;font-size:10px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:3px">Kısayol Tuşu</div>
                    <div style="display:flex;gap:4px;align-items:center"><kbd>Ctrl</kbd><span style="color:#93c5fd">+</span><kbd>Alt</kbd><span style="color:#93c5fd">+</span><kbd>H</kbd></div>
                </div>
            `;

            const content = document.createElement('div');
            content.className = 'modal-content';

            content.appendChild(this.createModeGrid('Temel Komutlar', ['fix', 'imp', 'gen']));
            content.appendChild(this.createModeGrid('Çeviri', ['en', 'tr']));
            content.appendChild(this.createModeGrid('Stil & Ton', ['sum', 'frm', 'cas']));
            content.appendChild(this.createModeGrid('Diğer', ['ai']));

            const exampleInfo = document.createElement('div');
            exampleInfo.className = 'example-info';
            exampleInfo.innerHTML = `💡 <span style="color: #e0e0e0;">"bu smetni ddüzelt <code>-fix</code>"</span>`;

            this.modal.appendChild(header);
            this.modal.appendChild(shortcutInfo);
            this.modal.appendChild(content);
            this.modal.appendChild(exampleInfo);

            header.querySelector('.close-btn').addEventListener('click', () => this.close());

            return this.modal;
        }

        createModeGrid(title, modeKeys) {
            const container = document.createElement('div');
            container.innerHTML = `<div class="mode-category">${title}</div>`;

            const grid = document.createElement('div');
            grid.className = 'mode-grid';

            modeKeys.forEach(key => {
                const config = MODE_CONFIGS[key];
                const item = document.createElement('div');
                item.className = 'mode-item';
                item.style.borderLeftColor = config.color;
                item.innerHTML = `<code style="color: ${config.color};">-${key}</code> <span>${config.name}</span>`;
                grid.appendChild(item);
            });

            container.appendChild(grid);
            return container;
        }

        createOverlay() {
            if (this.overlay) return this.overlay;

            this.overlay = document.createElement("div");
            this.overlay.id = "ai-improver-overlay";
            this.overlay.addEventListener('click', () => this.close());

            return this.overlay;
        }

        show() {
            if (this.isOpen) return;

            this.injectStyles();
            const modal = this.createModal();
            const overlay = this.createOverlay();

            modal.style.display = 'block';
            overlay.style.display = 'block';

            if (!modal.parentNode) document.body.appendChild(modal);
            if (!overlay.parentNode) document.body.appendChild(overlay);

            this.isOpen = true;
        }

        close() {
            if (this.modal) this.modal.style.display = 'none';
            if (this.overlay) this.overlay.style.display = 'none';
            this.isOpen = false;
        }
    }

    // ==================== API CLIENT ====================
    class APIClient {
        constructor(config) {
            this.config = config;
        }

        buildRequest(prompt) {
            const providers = {
                openai: {
                    url: "https://api.openai.com/v1/chat/completions",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.config.OPENAI_API_KEY}`
                    },
                    data: {
                        model: this.config.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: this.config.TEMPERATURE,
                        max_tokens: this.config.MAX_TOKENS
                    }
                },
                anthropic: {
                    url: "https://api.anthropic.com/v1/messages",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": this.config.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    data: {
                        model: this.config.MODEL,
                        max_tokens: this.config.MAX_TOKENS,
                        messages: [{ role: "user", content: prompt }]
                    }
                },
                cohere: {
                    url: "https://api.cohere.ai/v1/chat",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.config.COHERE_API_KEY}`
                    },
                    data: {
                        model: this.config.MODEL,
                        message: prompt,
                        temperature: this.config.TEMPERATURE,
                        max_tokens: this.config.MAX_TOKENS
                    }
                },
                custom: {
                    url: this.config.CUSTOM_API_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.config.CUSTOM_API_KEY}`
                    },
                    data: {
                        model: this.config.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: this.config.TEMPERATURE,
                        max_tokens: this.config.MAX_TOKENS
                    }
                }
            };

            return providers[this.config.AI_PROVIDER] || providers.custom;
        }

        extractResponse(data, provider) {
            const extractors = {
                anthropic: () => data.content?.[0]?.text?.trim(),
                cohere: () => data.text?.trim(),
                default: () => data.choices?.[0]?.message?.content?.trim()
            };

            return (extractors[provider] || extractors.default)();
        }

        makeRequest(prompt) {
            return new Promise((resolve, reject) => {
                const request = this.buildRequest(prompt);

                if (this.config.LOG_REQUESTS) {
                    console.log("[AI] Request:", request);
                }

                const xhr = GM_xmlhttpRequest({
                    method: "POST",
                    url: request.url,
                    headers: request.headers,
                    data: JSON.stringify(request.data),
                    timeout: this.config.TIMEOUT,
                    onload: (response) => {
                        if (response.status >= 400) {
                            reject(new Error(`API error: ${response.status}`));
                            return;
                        }

                        try {
                            const data = JSON.parse(response.responseText);
                            const content = this.extractResponse(data, this.config.AI_PROVIDER);

                            if (!content) {
                                reject(new Error("Empty AI response"));
                                return;
                            }

                            resolve(content);
                        } catch (err) {
                            reject(new Error("Failed to parse response"));
                        }
                    },
                    onerror: () => reject(new Error("Network error")),
                    ontimeout: () => reject(new Error("Request timeout"))
                });

                // Return abort function
                xhr.abort = xhr.abort.bind(xhr);
                return xhr;
            });
        }
    }

    // ==================== COMMAND PROCESSOR ====================
    class CommandProcessor {
        constructor(state, ui, api) {
            this.state = state;
            this.ui = ui;
            this.api = api;
        }

        async process(text, element) {
            if (this.state.processing || text === this.state.lastProcessedText) {
                return;
            }

            const command = Object.keys(AI_COMMANDS).find(cmd => text.endsWith(cmd));
            if (!command) return;

            const promptText = text.slice(0, -command.length).trim();
            if (!promptText) return;

            this.state.lastProcessedText = text;
            this.state.setProcessing(true);

            // Disable element and show loading state
            this.ui.disableElement(element);
            this.ui.showSpinner(element);

            const finalPrompt = command === '-ai'
                ? promptText
                : `${AI_COMMANDS[command]}\n\n${promptText}`;

            try {
                this.state.currentRequest = this.api.makeRequest(finalPrompt);
                const result = await this.state.currentRequest;

                // Temporarily enable to set value, then disable again
                if (document.contains(element)) {
                    this.ui.enableElement(element);
                    DOMUtils.setElementValue(element, result, this.state.elementMethodCache);
                    this.ui.showNotification("Text improved successfully", "success");
                }
            } catch (err) {
                console.error("[AI] Error:", err.message);
                this.ui.showNotification(`AI Error: ${err.message}`, 'error');

                // Restore original text on error
                if (document.contains(element)) {
                    this.ui.enableElement(element);
                    DOMUtils.setElementValue(element, promptText, this.state.elementMethodCache);
                }
            } finally {
                this.cleanup(element);
            }
        }

        cleanup(element) {
            this.state.reset();
            this.ui.hideSpinner();
        }

        cancel(element) {
            this.state.cancelRequest();
            this.cleanup(element);
            this.ui.showNotification("AI request cancelled", "info");
        }
    }

    // ==================== TEXT EXPANDER ====================
    class TextExpander {
        expand() {
            const element = document.activeElement;
            if (!element) return;

            const text = DOMUtils.getText(element);
            const expansion = TEXT_EXPANSIONS[text.slice(-2)];

            if (expansion) {
                const output = text.slice(0, -2) + expansion;
                DOMUtils.setElementValue(element, output, new WeakMap());
            }
        }
    }

    // ==================== INITIALIZATION ====================
    const state = new StateManager();
    const ui = new UIManager();
    const modal = new ModalManager();
    const api = new APIClient(CONFIG);
    const processor = new CommandProcessor(state, ui, api);
    const expander = new TextExpander();

    // Inject styles on load
    ui.injectStyles();

    // ==================== EVENT LISTENERS ====================

    // Key up - AI command detection
    document.addEventListener("keyup", (e) => {
        const element = e.target;
        if (!DOMUtils.isInputLike(element)) return;

        const text = DOMUtils.getText(element).trimEnd();
        const hasCommand = Object.keys(AI_COMMANDS).some(cmd => text.endsWith(cmd));

        if (hasCommand) {
            state.clearDebounce();
            state.debounceTimer = setTimeout(() => {
                processor.process(text, element);
            }, CONFIG.DEBOUNCE_DELAY);
        } else {
            state.clearDebounce();
        }
    });

    // Key down - Text expansion
    document.addEventListener("keydown", (e) => {
        if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
            setTimeout(() => expander.expand(), 0);
        }
    }, { passive: true });

    // Escape - Cancel AI request
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && state.processing) {
            processor.cancel(e.target);
        }
    });

    // Ctrl+Alt+H - Show help modal
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "h") {
            e.preventDefault();
            modal.show();
        }
    });

    // Escape - Close modal
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.isOpen) {
            modal.close();
        }
    });

    console.log("✨ AI Text Improver Enhanced - Ready!");
    console.log("Commands:", Object.keys(AI_COMMANDS).join(", "));
})();
