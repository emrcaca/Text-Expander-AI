// ==UserScript==
// @name         Text Expander AI
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Text expander with AI commands
// @author       You
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.openai.com
// @connect      api.anthropic.com
// @connect      api.cohere.ai
// @connect      your.custom.api
// @run-at       document-idle
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
    'use strict';

    // ==================== AI CONFIGURATION ====================
    const AI_CONFIG = {
        AI_PROVIDER: "custom", // "openai", "anthropic", "cohere", or "custom"
        CUSTOM_API_URL: "https://your.custom.api/v1/chat/completions",
        CUSTOM_API_KEY: "your-custom-api-key-here",
        OPENAI_API_KEY: "your-openai-key-here",
        ANTHROPIC_API_KEY: "your-anthropic-key-here",
        COHERE_API_KEY: "your-cohere-key-here",
        MODEL: "openai/gpt-oss-120b",
        TEMPERATURE: 0.3,
        MAX_TOKENS: 2000,
        TIMEOUT: 30000
    };

    // ==================== AI COMMANDS ====================
    const AI_COMMANDS = {
        '-fix': 'Fix all grammar, spelling, and punctuation errors:',
        '-imp': 'Improve this text: clearer, concise, impactful. Keep meaning:',
        '-gen': 'Expand this into a detailed, natural response. Same tone:',
        '-en': 'Translate to natural English:',
        '-tr': 'Çeviri yap → akıcı ve doğal Türkçe:',
        '-sum': 'Summarize this concisely:',
        '-frm': 'Make this more formal and professional:',
        '-cas': 'Make this more casual and friendly:',
        '-ai': null
    };

    class UniversalTextSetter {
        static getText(element) {
            if (!element) return '';
            return element.isContentEditable ? (element.textContent || '') : (element.value || '');
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

        static getActiveEditableElement() {
            const activeElement = document.activeElement;
            return this.isEditable(activeElement) ? activeElement : null;
        }
    }

    const TRIGGERS = [
        { trigger: 'hi', replace: 'Hello!' },
        { trigger: 'ok', replace: 'okey' },
        { trigger: 'brb', replace: 'Be right back' },
        { trigger: 'omw', replace: 'On my way' },
        { trigger: 'thx', replace: 'Thanks!' },
        { trigger: 'ty', replace: 'Thank you!' },
        { trigger: 'np', replace: 'No problem!' },
        { trigger: 'idk', replace: "I don't know" },
        { trigger: 'btw', replace: 'By the way' },
        { trigger: 'imo', replace: 'In my opinion' },
        { trigger: 'afaik', replace: 'As far as I know' },
        { trigger: ':mail', replace: 'ornek@email.com' },
        { trigger: ':mymail', replace: 'benim@email.com' },
        { trigger: '"1', replace: 'Owo h' },
        { trigger: '"2', replace: 'Owo b' },
        { trigger: '"3', replace: 'Owo' },
        { trigger: '"4', replace: 'Owo pray' },
        { trigger: ':tarih', replace: () => new Date().toLocaleDateString('tr-TR') },
        { trigger: ':date', replace: () => new Date().toLocaleDateString('en-US') },
        { trigger: ':saat', replace: () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':time', replace: () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
        { trigger: ':gun', replace: () => {
                const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
                return days[new Date().getDay()];
            }
        },
        { trigger: ':heart', replace: '❤️' },
        { trigger: ':check', replace: '✓' },
        { trigger: ':cross', replace: '✗' },
    ];

    const SETTINGS = {
        wordBoundary: true,
        debug: false,
        debounceDelay: 0,
        aiCommandDelay: 500, // 0.7 seconds delay for AI commands
    };

    // ==================== AI STATE MANAGEMENT ====================
    let processingReplace = false;
    let debounceTimer = null;
    let isAIProcessing = false;
    let currentAIRequest = null;
    let loadingIndicator = null;
    let undoDetected = false; // Flag to track if undo was used

    // ==================== LOADING INDICATOR ====================
    function createLoadingIndicator(element, options = {}) {
        const config = {
            size: 's', // 's', 'm', 'l'
            theme: 'dark', // 'dark', 'light'
            animation: 'dots', // 'spin', 'dots'
            ...options
        };

        // Sade stiller
        const themes = {
            dark: {
                bg: 'rgba(0, 0, 0, 0.9)',
                spinner: '#3b82f6',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                shadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            },
            light: {
                bg: 'rgba(255, 255, 255, 0.95)',
                spinner: '#3b82f6',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                shadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }
        };

        const sizes = {
            s: { spinnerSize: '12px' },
            m: { spinnerSize: '14px' },
            l: { spinnerSize: '16px' }
        };

        const theme = themes[config.theme];
        const size = sizes[config.size];

        // Animasyon stili (bir kez ekle)
        if (!document.querySelector('#loading-spin-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-spin-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes dots {
                    0%, 80%, 100% { opacity: 0.3; }
                    40% { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Container - sadece spinner için
        const indicator = document.createElement('div');
        Object.assign(indicator.style, {
            position: 'absolute',
            background: theme.bg,
            border: theme.border,
            borderRadius: '8px',
            padding: '12px',
            zIndex: '10000',
            pointerEvents: 'none',
            boxShadow: theme.shadow,
            backdropFilter: 'blur(4px)',
            opacity: '0',
            transform: 'scale(0.95)',
            transition: 'opacity 0.2s ease, transform 0.2s ease'
        });

        // Spinner
        let spinner;
        if (config.animation === 'dots') {
            const dotsContainer = document.createElement('div');
            dotsContainer.style.cssText = `
                display: flex;
                gap: 3px;
                align-items: center;
                justify-content: center;
            `;

            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.style.cssText = `
                    width: 6px;
                    height: 6px;
                    background: ${theme.spinner};
                    border-radius: 50%;
                    animation: dots 1.4s infinite ${i * 0.16}s;
                `;
                dotsContainer.appendChild(dot);
            }
            spinner = dotsContainer;
        } else {
            const spin = document.createElement('div');
            Object.assign(spin.style, {
                width: size.spinnerSize,
                height: size.spinnerSize,
                border: `2px solid ${theme.spinner}20`,
                borderTop: `2px solid ${theme.spinner}`,
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            });
            spinner = spin;
        }

        // Sadece spinner ekle
        indicator.appendChild(spinner);

        // Pozisyon
        const rect = element.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        indicator.style.top = `${rect.top + scrollY + (rect.height / 2)}px`;
        indicator.style.left = `${rect.left + scrollX + (rect.width / 2)}px`;
        indicator.style.transform = 'translate(-50%, -50%) scale(0.95)';

        document.body.appendChild(indicator);

        // Fade in
        requestAnimationFrame(() => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // Kaldırma fonksiyonu
        indicator.removeWithAnimation = function() {
            this.style.opacity = '0';
            this.style.transform = 'translate(-50%, -50%) scale(0.95)';

            setTimeout(() => {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            }, 200);
        };

        return indicator;
    }

    function removeLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.remove();
            loadingIndicator = null;
        }
    }

    // ==================== INPUT BLOCKER ====================
    function blockInput(element) {
        const blocker = (e) => {
            if (isAIProcessing) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        element._aiBlocker = blocker;
        element.addEventListener('keydown', blocker, true);
        element.addEventListener('keypress', blocker, true);
        element.addEventListener('input', blocker, true);
        element.addEventListener('paste', blocker, true);
    }

    function unblockInput(element) {
        if (element._aiBlocker) {
            element.removeEventListener('keydown', element._aiBlocker, true);
            element.removeEventListener('keypress', element._aiBlocker, true);
            element.removeEventListener('input', element._aiBlocker, true);
            element.removeEventListener('paste', element._aiBlocker, true);
            delete element._aiBlocker;
        }
    }

    // ==================== AI API CLIENT ====================
    class AIClient {
        static buildRequest(prompt) {
            const providers = {
                openai: {
                    url: "https://api.openai.com/v1/chat/completions",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.OPENAI_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                },
                anthropic: {
                    url: "https://api.anthropic.com/v1/messages",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": AI_CONFIG.ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        max_tokens: AI_CONFIG.MAX_TOKENS,
                        messages: [{ role: "user", content: prompt }]
                    }
                },
                cohere: {
                    url: "https://api.cohere.ai/v1/chat",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.COHERE_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        message: prompt,
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                },
                custom: {
                    url: AI_CONFIG.CUSTOM_API_URL,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${AI_CONFIG.CUSTOM_API_KEY}`
                    },
                    data: {
                        model: AI_CONFIG.MODEL,
                        messages: [
                            { role: "system", content: "Return only the result. No extra text, explanations, or quotes." },
                            { role: "user", content: prompt }
                        ],
                        temperature: AI_CONFIG.TEMPERATURE,
                        max_tokens: AI_CONFIG.MAX_TOKENS
                    }
                }
            };

            return providers[AI_CONFIG.AI_PROVIDER] || providers.custom;
        }

        static extractResponse(data, provider) {
            const extractors = {
                anthropic: () => data.content?.[0]?.text?.trim(),
                cohere: () => data.text?.trim(),
                default: () => data.choices?.[0]?.message?.content?.trim()
            };

            return (extractors[provider] || extractors.default)();
        }

        static makeRequest(prompt) {
            return new Promise((resolve, reject) => {
                const request = this.buildRequest(prompt);

                currentAIRequest = GM_xmlhttpRequest({
                    method: "POST",
                    url: request.url,
                    headers: request.headers,
                    data: JSON.stringify(request.data),
                    timeout: AI_CONFIG.TIMEOUT,
                    onload: (response) => {
                        if (response.status >= 400) {
                            reject(new Error(`API error: ${response.status}`));
                            return;
                        }

                        try {
                            const data = JSON.parse(response.responseText);
                            const content = this.extractResponse(data, AI_CONFIG.AI_PROVIDER);

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
            });
        }

        static cancelRequest() {
            if (currentAIRequest) {
                currentAIRequest.abort();
                currentAIRequest = null;
            }
        }
    }

    // ==================== AI PROCESSOR ====================
    async function processAICommand(element, text, aiCommand) {
        if (isAIProcessing) return;

        const command = Object.keys(AI_COMMANDS).find(cmd => text.endsWith(cmd));
        if (!command) return;

        const promptText = text.slice(0, -command.length).trim();
        if (!promptText) return;

        isAIProcessing = true;

        // Hide cursor during AI processing
        const originalCursorStyle = element.style.caretColor || '';
        element.style.caretColor = 'transparent';

        // Block input but keep element enabled
        blockInput(element);

        // Show loading indicator
        loadingIndicator = createLoadingIndicator(element);

        const finalPrompt = command === '-ai'
            ? promptText
            : `${AI_COMMANDS[command]}\n\n${promptText}`;

        try {
            const result = await AIClient.makeRequest(finalPrompt);
            UniversalTextSetter.setText(element, result);
        } catch (err) {
            console.error("[AI] Error:", err.message);
            // Restore original text on error
            UniversalTextSetter.setText(element, promptText);
        } finally {
            // Cleanup
            removeLoadingIndicator();
            unblockInput(element);

            // Restore cursor visibility
            element.style.caretColor = originalCursorStyle;

            isAIProcessing = false;
            currentAIRequest = null;
        }
    }

    function checkAndReplace() {
        // Don't process if undo was detected
        if (undoDetected) {
            console.log('[TextExpander] Skipping processing due to undo detection');
            return;
        }

        if (processingReplace || isAIProcessing) return;

        const activeEl = UniversalTextSetter.getActiveEditableElement();
        if (!activeEl) return;

        const currentText = UniversalTextSetter.getText(activeEl);

        if (SETTINGS.debug) {
            console.log('[TextExpander] Checking text:', currentText);
        }

        // First check for AI commands
        const aiCommand = Object.keys(AI_COMMANDS).find(cmd => currentText.endsWith(cmd));
        if (aiCommand) {
            // Apply specific delay for AI commands
            setTimeout(() => {
                processAICommand(activeEl, currentText, aiCommand);
            }, SETTINGS.aiCommandDelay);
            return;
        }

        // Then check for regular triggers
        const sortedTriggers = [...TRIGGERS].sort((a, b) => b.trigger.length - a.trigger.length);

        for (const item of sortedTriggers) {
            const trigger = item.trigger;

            if (SETTINGS.wordBoundary) {
                const regex = new RegExp(`(^|\\s)${escapeRegex(trigger)}$`);
                if (regex.test(currentText)) {
                    performReplace(activeEl, currentText, trigger, item.replace);
                    return;
                }
            } else {
                if (currentText.endsWith(trigger)) {
                    performReplace(activeEl, currentText, trigger, item.replace);
                    return;
                }
            }
        }
    }

    function performReplace(element, currentText, trigger, replacement) {
        processingReplace = true;

        const replaceText = typeof replacement === 'function' ? replacement() : replacement;

        const newText = currentText.slice(0, -trigger.length) + replaceText;

        if (SETTINGS.debug) {
            console.log('[TextExpander] Replacing:', trigger, '->', replaceText);
        }

        UniversalTextSetter.setText(element, newText);

        setTimeout(() => {
            processingReplace = false;
        }, 100);
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==================== EVENT LISTENERS ====================
    document.addEventListener('input', (e) => {
        // Reset undo flag when regular input occurs
        if (e.inputType !== 'historyUndo') {
            undoDetected = false;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            checkAndReplace();
        }, SETTINGS.debounceDelay);
    }, true);

    document.addEventListener('keydown', (e) => {
        // Detect CTRL+Z (undo)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            undoDetected = true;
            console.log('[TextExpander] Undo detected, pausing processing');
            return;
        }

        if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') {
            return;
        }

        // Escape to cancel AI request
        if (e.key === 'Escape' && isAIProcessing) {
            AIClient.cancelRequest();
            isAIProcessing = false;
            removeLoadingIndicator();
            const activeEl = UniversalTextSetter.getActiveEditableElement();
            if (activeEl) unblockInput(activeEl);
            console.log("[AI] Request cancelled");
            return;
        }

        // Reset undo flag when any other key is pressed
        if (undoDetected && e.key !== 'z') {
            undoDetected = false;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            checkAndReplace();
        }, SETTINGS.debounceDelay);
    }, true);

    // Add help shortcut (Ctrl+Alt+H)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'h') {
            e.preventDefault();
            showAIHelp();
        }
    });

    function showAIHelp() {
        const helpText = `
AI Metin İyileştirici Komutları:
-fix : Dilbilgisi ve imla hatalarını düzelt
-imp : Metnin netliğini artır
-gen : Metni genişlet
-en  : İngilizceye çevir
-tr  : Türkçeye çevir
-sum : Özetle
-frm : Resmi hâle getir
-cas : Samimi hâle getir
-ai  : Serbest AI komutu

Metnin sonuna istediğiniz komutu ekleyip boşluk/enter tuşuna basın.
Örnek: "merhaba nasılsın -tr"
AI işlemini iptal etmek için ESC tuşuna basın.
        `;
        alert(helpText);
    }

    console.log("Text Expander with AI loaded!");
    console.log("AI Commands available:", Object.keys(AI_COMMANDS).join(", "));
})();
